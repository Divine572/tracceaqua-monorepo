'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  FileCheck, 
  User, 
  Clock 
} from 'lucide-react'
import { UserRole, ROLE_DESCRIPTIONS } from '@/types'
import { useDropzone } from 'react-dropzone'
import { useRoleApplications } from '@/hooks/use-role-applications'




// Form validation schema
const roleApplicationSchema = z.object({
  requestedRole: z.enum([
    'RESEARCHER',
    'FARMER', 
    'FISHERMAN',
    'PROCESSOR',
    'TRADER',
    'RETAILER'
  ] as const, {
    required_error: 'Please select a role',
  }),
  organization: z.string().min(2, 'Organization name must be at least 2 characters').optional(),
  licenseNumber: z.string().optional(),
  businessType: z.string().min(5, 'Business type must be at least 5 characters').optional(),
  experience: z.string().min(1, 'Experience is required'),
  motivation: z.string().min(50, 'Motivation must be at least 50 characters').max(1000, 'Motivation must be less than 1000 characters'),
})

type RoleApplicationFormData = z.infer<typeof roleApplicationSchema>

interface RoleApplicationFormProps {
  onSuccess?: () => void
  className?: string
}

export function RoleApplicationForm({ onSuccess, className }: RoleApplicationFormProps) {
  const [step, setStep] = useState(1)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { submitApplication } = useRoleApplications()

  const form = useForm<RoleApplicationFormData>({
    resolver: zodResolver(roleApplicationSchema),
    defaultValues: {
      requestedRole: undefined,
      organization: '',
      licenseNumber: '',
      businessType: '',
      experience: '',
      motivation: '',
    },
  })

  const watchedRole = form.watch('requestedRole')

  // File upload with react-dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: (acceptedFiles) => {
      setSelectedFiles(prev => [...prev, ...acceptedFiles].slice(0, 5))
    },
    onDropRejected: (rejectedFiles) => {
      const error = rejectedFiles[0]?.errors[0]
      if (error?.code === 'file-too-large') {
        setError('File size must be less than 10MB')
      } else if (error?.code === 'file-invalid-type') {
        setError('File type not supported')
      } else {
        setError('File upload error')
      }
    },
  })

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: RoleApplicationFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      await submitApplication(data, selectedFiles)
      
      // Success state
      setStep(5)
      
      // Call success callback after a delay
      setTimeout(() => {
        onSuccess?.()
      }, 2000)
      
    } catch (error: any) {
      console.error('Application submission failed:', error)
      setError(error.message || 'Failed to submit application')
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    setError(null)
    setStep(prev => Math.min(prev + 1, 4))
  }

  const prevStep = () => {
    setError(null)
    setStep(prev => Math.max(prev - 1, 1))
  }

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Select Role'
      case 2: return 'Professional Details'
      case 3: return 'Upload Documents'
      case 4: return 'Review & Submit'
      case 5: return 'Application Submitted'
      default: return 'Role Application'
    }
  }

  const progress = (step / 5) * 100

  if (step === 5) {
    return (
      <Card className={`w-full max-w-2xl mx-auto ${className}`}>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-green-900">Application Submitted Successfully!</h3>
            <p className="text-green-700">
              Your application for <Badge variant="outline">{watchedRole?.replace('_', ' ')}</Badge> role has been submitted for review.
            </p>
            <p className="text-sm text-gray-600">
              You'll receive a notification once an admin reviews your application.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`w-full max-w-2xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          {getStepTitle()}
        </CardTitle>
        <CardDescription>
          Step {step} of 4 - Apply for a professional role to contribute to the seafood supply chain
        </CardDescription>
        <Progress value={progress} className="w-full" />
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Step 1: Role Selection */}
            {step === 1 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="requestedRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Professional Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose your professional role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="RESEARCHER">
                            <div className="flex flex-col items-start">
                              <span className="font-medium">Researcher</span>
                              <span className="text-xs text-gray-500">Conservation data collection</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="FARMER">
                            <div className="flex flex-col items-start">
                              <span className="font-medium">Farmer</span>
                              <span className="text-xs text-gray-500">Aquaculture operations</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="FISHERMAN">
                            <div className="flex flex-col items-start">
                              <span className="font-medium">Fisherman</span>
                              <span className="text-xs text-gray-500">Wild-capture fishing</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="PROCESSOR">
                            <div className="flex flex-col items-start">
                              <span className="font-medium">Processor</span>
                              <span className="text-xs text-gray-500">Seafood processing</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="TRADER">
                            <div className="flex flex-col items-start">
                              <span className="font-medium">Trader</span>
                              <span className="text-xs text-gray-500">Distribution & logistics</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="RETAILER">
                            <div className="flex flex-col items-start">
                              <span className="font-medium">Retailer</span>
                              <span className="text-xs text-gray-500">Retail sales</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                      {watchedRole && (
                        <FormDescription className="text-blue-600">
                          {ROLE_DESCRIPTIONS[watchedRole as UserRole]}
                        </FormDescription>
                      )}
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    onClick={nextStep}
                    disabled={!watchedRole}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Professional Details */}
            {step === 2 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="organization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization/Company</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Lagos Fishing Cooperative" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Name of your organization, cooperative, or company
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="licenseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Number (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., FISH-2024-001" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Professional license or permit number if applicable
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Type</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Small-scale artisanal fishing" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Describe the type of operation or business
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., 5 years" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Years of experience in this field
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button type="button" onClick={nextStep}>
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Document Upload */}
            {step === 3 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="motivation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motivation</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Explain why you want this professional role and how you plan to contribute to the seafood supply chain transparency..."
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Tell us why you want this role (50-1000 characters)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <FormLabel>Supporting Documents (Optional)</FormLabel>
                  <FormDescription>
                    Upload licenses, certificates, or other supporting documents (Max 5 files, 10MB each)
                  </FormDescription>
                  
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isDragActive 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {isDragActive 
                        ? 'Drop files here...' 
                        : 'Drag & drop files here, or click to select'
                      }
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Supports: PDF, Images, Word documents, Text files
                    </p>
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Selected Files:</p>
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-gray-500">
                              ({(file.size / 1024 / 1024).toFixed(1)} MB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button type="button" onClick={nextStep}>
                    Review Application
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Review Your Application</h3>
                  
                  <div className="grid gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900">Requested Role</h4>
                      <Badge variant="outline" className="mt-1">
                        {watchedRole?.replace('_', ' ')}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">
                        {watchedRole && ROLE_DESCRIPTIONS[watchedRole as UserRole]}
                      </p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900">Professional Details</h4>
                      <div className="mt-2 space-y-1 text-sm">
                        {form.getValues('organization') && (
                          <p><span className="font-medium">Organization:</span> {form.getValues('organization')}</p>
                        )}
                        {form.getValues('licenseNumber') && (
                          <p><span className="font-medium">License:</span> {form.getValues('licenseNumber')}</p>
                        )}
                        {form.getValues('businessType') && (
                          <p><span className="font-medium">Business Type:</span> {form.getValues('businessType')}</p>
                        )}
                        <p><span className="font-medium">Experience:</span> {form.getValues('experience')}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900">Motivation</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {form.getValues('motivation')}
                      </p>
                    </div>

                    {selectedFiles.length > 0 && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900">Documents ({selectedFiles.length})</h4>
                        <div className="mt-2 space-y-1">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <FileCheck className="w-4 h-4 text-green-600" />
                              <span>{file.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}