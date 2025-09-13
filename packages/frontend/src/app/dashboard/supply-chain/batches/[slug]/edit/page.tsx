'use client'

import { useState, useEffect } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  Save, 
  X,
  Plus,
  AlertTriangle,
  CheckCircle,
  Upload,
  Trash2,
  FileText,
  Shield
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { SupplyChainBatch, ProductType, ProductCategory } from '@/lib/supply-chain-types'
import { cn } from '@/lib/utils'

// Form validation schema
const batchEditSchema = z.object({
  batchNumber: z.string().min(1, 'Batch number is required'),
  species: z.string().min(1, 'Species is required'),
  commonName: z.string().optional(),
  productType: z.nativeEnum(ProductType),
  category: z.nativeEnum(ProductCategory),
  status: z.enum(['active', 'completed', 'expired', 'recalled']),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
})

type BatchEditData = z.infer<typeof batchEditSchema>

// Mock batch data using updated types
const mockBatch: SupplyChainBatch = {
  id: '1',
  batchNumber: 'TAQ-2024-001',
  productType: ProductType.WILD_CAPTURE,
  category: ProductCategory.MOLLUSCS,
  species: 'Crassostrea gigas',
  commonName: 'Pacific Oyster',
  currentStage: 'processing' as any,
  status: 'active',
  stages: [],
  createdBy: 'user1',
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-16'),
  tags: ['premium', 'export-grade', 'sustainable'],
  notes: 'High quality harvest from certified sustainable area'
}

export default function BatchEdit() {
  const params = useParams()
  const router = useRouter()
  const batchId = params.id as string
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [newTag, setNewTag] = useState('')
  const [isDirty, setIsDirty] = useState(false)

  const { data: batch = mockBatch, isLoading } = useQuery({
    queryKey: ['batch', batchId],
    queryFn: async () => {
      // TODO: Replace with actual API call
      return mockBatch
    },
  })

  const methods = useForm<BatchEditData>({
    resolver: zodResolver(batchEditSchema),
    defaultValues: {
      batchNumber: '',
      species: '',
      commonName: '',
      productType: ProductType.WILD_CAPTURE,
      category: ProductCategory.MOLLUSCS,
      status: 'active',
      tags: [],
      notes: '',
    },
    mode: 'onChange',
  })

  const { handleSubmit, reset, watch, setValue, formState: { isSubmitting } } = methods

  // Load batch data into form when available
  useEffect(() => {
    if (batch) {
      reset({
        batchNumber: batch.batchNumber,
        species: batch.species,
        commonName: batch.commonName || '',
        productType: batch.productType,
        category: batch.category,
        status: batch.status,
        tags: batch.tags || [],
        notes: batch.notes || '',
      })
    }
  }, [batch, reset])

  // Watch for form changes
  useEffect(() => {
    const subscription = watch(() => setIsDirty(true))
    return () => subscription.unsubscribe()
  }, [watch])

  const updateBatchMutation = useMutation({
    mutationFn: async (data: BatchEditData) => {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { ...batch, ...data, updatedAt: new Date() }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batch', batchId] })
      queryClient.invalidateQueries({ queryKey: ['batches'] })
      toast({
        title: "Batch updated",
        description: "The batch has been successfully updated.",
      })
      setIsDirty(false)
      router.push(`/dashboard/supply-chain/batches/${batchId}`)
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update batch. Please try again.",
        variant: "destructive",
      })
    },
  })

  const onSubmit = (data: BatchEditData) => {
    updateBatchMutation.mutate(data)
  }

  const addTag = () => {
    if (newTag.trim()) {
      const currentTags = watch('tags') || []
      if (!currentTags.includes(newTag.trim())) {
        setValue('tags', [...currentTags, newTag.trim()])
        setNewTag('')
        setIsDirty(true)
      }
    }
  }

  const removeTag = (tagToRemove: string) => {
    const currentTags = watch('tags') || []
    setValue('tags', currentTags.filter(tag => tag !== tagToRemove))
    setIsDirty(true)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading batch...</div>
  }

  return (
    <div className="space-y-6 container max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/supply-chain/batches/${batchId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Details
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Edit Batch</h1>
            <p className="text-muted-foreground">
              {batch.batchNumber} • {batch.species}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isDirty && (
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">Unsaved changes</span>
            </div>
          )}
          <Button 
            variant="outline" 
            onClick={() => reset()}
            disabled={!isDirty || isSubmitting}
          >
            Reset
          </Button>
          <Button 
            onClick={handleSubmit(onSubmit)}
            disabled={!isDirty || isSubmitting}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList>
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="classification">Classification</TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Edit the core details of this batch
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={methods.control}
                      name="batchNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Batch Number *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Unique identifier for this batch
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={methods.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="expired">Expired</SelectItem>
                              <SelectItem value="recalled">Recalled</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={methods.control}
                      name="species"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Species Scientific Name *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Crassostrea gigas"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={methods.control}
                      name="commonName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Common Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Pacific Oyster"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Local or commercial name for this species
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="classification">
              <Card>
                <CardHeader>
                  <CardTitle>Product Classification</CardTitle>
                  <CardDescription>
                    Classify the product type and category
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={methods.control}
                      name="productType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select product type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={ProductType.WILD_CAPTURE}>Wild Capture</SelectItem>
                              <SelectItem value={ProductType.FARMED}>Farmed</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Source of the seafood product
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={methods.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={ProductCategory.MOLLUSCS}>Molluscs</SelectItem>
                              <SelectItem value={ProductCategory.CRUSTACEANS}>Crustaceans</SelectItem>
                              <SelectItem value={ProductCategory.FINFISH}>Finfish</SelectItem>
                              <SelectItem value={ProductCategory.ECHINODERMS}>Echinoderms</SelectItem>
                              <SelectItem value={ProductCategory.PROCESSED}>Processed</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Biological classification of the product
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metadata">
              <Card>
                <CardHeader>
                  <CardTitle>Metadata & Tags</CardTitle>
                  <CardDescription>
                    Manage tags and additional information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Tags Section */}
                  <div className="space-y-4">
                    <div>
                      <FormLabel>Tags</FormLabel>
                      <FormDescription>
                        Add tags to help categorize and search for this batch
                      </FormDescription>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {watch('tags')?.map((tag: string) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {tag}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 hover:bg-transparent"
                            onClick={() => removeTag(tag)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tag..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addTag()
                          }
                        }}
                      />
                      <Button type="button" onClick={addTag} variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <span>Suggested tags:</span>
                      {['organic', 'sustainable', 'premium', 'local', 'export-grade', 'wild-caught', 'farm-raised'].map((suggestedTag) => (
                        <Button
                          key={suggestedTag}
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1 text-xs"
                          onClick={() => {
                            const currentTags = watch('tags') || []
                            if (!currentTags.includes(suggestedTag)) {
                              setValue('tags', [...currentTags, suggestedTag])
                              setIsDirty(true)
                            }
                          }}
                        >
                          + {suggestedTag}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <FormField
                    control={methods.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Add any additional notes about this batch..."
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Additional information about this batch
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Batch Settings</CardTitle>
                  <CardDescription>
                    Advanced settings and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">Public Traceability</h4>
                        <p className="text-sm text-muted-foreground">
                          Allow consumers to trace this batch using QR codes
                        </p>
                      </div>
                      <Switch 
                        checked={batch.status === 'active'}
                        disabled
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">Blockchain Recording</h4>
                        <p className="text-sm text-muted-foreground">
                          Record changes to the blockchain for immutable audit trail
                        </p>
                      </div>
                      <Switch 
                        checked={true}
                        disabled
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">Quality Verification</h4>
                        <p className="text-sm text-muted-foreground">
                          Require quality verification for stage transitions
                        </p>
                      </div>
                      <Switch 
                        checked={true}
                        disabled
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium text-destructive">Danger Zone</h4>
                    
                    <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">Archive Batch</h4>
                        <p className="text-sm text-muted-foreground">
                          Archive this batch and remove it from active listings
                        </p>
                      </div>
                      <Button variant="destructive" size="sm" disabled>
                        Archive
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">Delete Batch</h4>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete this batch and all associated data
                        </p>
                      </div>
                      <Button variant="destructive" size="sm" disabled>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </FormProvider>

      {/* Batch Information Sidebar */}
      <Card>
        <CardHeader>
          <CardTitle>Batch Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Created:</span>
              <p className="font-medium">{batch.createdAt.toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Updated:</span>
              <p className="font-medium">{batch.updatedAt.toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Stages:</span>
              <p className="font-medium">{batch.stages.length}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Views:</span>
              <p className="font-medium">{batch.views || 0}</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>All changes are logged and auditable</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}