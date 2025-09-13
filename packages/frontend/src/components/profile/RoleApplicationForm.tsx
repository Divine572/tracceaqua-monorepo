'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { UserRole } from '@/lib/types'
import { Loader2, FileText, Upload, Info } from 'lucide-react'

const roleApplicationSchema = z.object({
  requestedRole: z.nativeEnum(UserRole).refine(
    (role) => role !== UserRole.CONSUMER && role !== UserRole.ADMIN && role !== UserRole.PENDING_UPGRADE,
    'Please select a valid professional role'
  ),
  organization: z.string().min(2, 'Organization is required'),
  experience: z.string().min(10, 'Please provide details about your experience'),
  reason: z.string().min(20, 'Please explain why you need this role'),
  contactPerson: z.string().optional(),
  contactEmail: z.string().email('Please provide a valid email').optional(),
  additionalInfo: z.string().optional(),
})

type RoleApplicationData = z.infer<typeof roleApplicationSchema>

const professionalRoles = [
  { value: UserRole.RESEARCHER, label: 'Researcher', description: 'Conservation data collection and analysis' },
  { value: UserRole.FARMER, label: 'Farmer', description: 'Aquaculture and shellfish farming' },
  { value: UserRole.FISHERMAN, label: 'Fisherman', description: 'Wild-capture shellfish harvesting' },
  { value: UserRole.PROCESSOR, label: 'Processor', description: 'Shellfish processing and packaging' },
  { value: UserRole.TRADER, label: 'Trader', description: 'Distribution and wholesale trading' },
  { value: UserRole.RETAILER, label: 'Retailer', description: 'Retail sales and consumer interface' },
]

export function RoleApplicationForm() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [supportingDocs, setSupportingDocs] = useState<File[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RoleApplicationData>({
    resolver: zodResolver(roleApplicationSchema),
  })

  const selectedRole = watch('requestedRole')

  const onSubmit = async (data: RoleApplicationData) => {
    setIsLoading(true)
    try {
      // TODO: Implement API call to submit role application
      console.log('Role application:', data)
      console.log('Supporting documents:', supportingDocs)
      
      toast({
        title: "Application submitted",
        description: "Your role application has been submitted for review. You'll be notified of the decision via email.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSupportingDocs(prev => [...prev, ...files].slice(0, 5)) // Max 5 files
  }

  const removeFile = (index: number) => {
    setSupportingDocs(prev => prev.filter((_, i) => i !== index))
  }

  if (user?.role !== UserRole.CONSUMER) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          You already have a professional role: <strong>{user?.role}</strong>. 
          Only consumers can apply for professional roles.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apply for Professional Role</CardTitle>
        <CardDescription>
          Apply for a professional role to access advanced features of TracceAqua. 
          All applications are reviewed by administrators.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="requestedRole">Requested Role</Label>
            <Select onValueChange={(value) => setValue('requestedRole', value as UserRole)}>
              <SelectTrigger>
                <SelectValue placeholder="Select the role you're applying for" />
              </SelectTrigger>
              <SelectContent>
                {professionalRoles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div>
                      <div className="font-medium">{role.label}</div>
                      <div className="text-sm text-muted-foreground">{role.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.requestedRole && (
              <p className="text-sm text-destructive">{errors.requestedRole.message}</p>
            )}
          </div>

          {/* Organization */}
          <div className="space-y-2">
            <Label htmlFor="organization">Organization/Company</Label>
            <Input
              id="organization"
              placeholder="Your organization or company name"
              {...register('organization')}
            //   error={errors.organization?.message}
            />
          </div>

          {/* Experience */}
          <div className="space-y-2">
            <Label htmlFor="experience">Relevant Experience</Label>
            <Textarea
              id="experience"
              placeholder="Describe your relevant experience in the seafood industry..."
              className="min-h-[120px]"
              {...register('experience')}
            />
            {errors.experience && (
              <p className="text-sm text-destructive">{errors.experience.message}</p>
            )}
          </div>

          {/* Reason for Application */}
          <div className="space-y-2">
            <Label htmlFor="reason">Why do you need this role?</Label>
            <Textarea
              id="reason"
              placeholder="Explain how you plan to use TracceAqua and why this role is necessary for your work..."
              className="min-h-[120px]"
              {...register('reason')}
            />
            {errors.reason && (
              <p className="text-sm text-destructive">{errors.reason.message}</p>
            )}
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Reference Contact (Optional)</Label>
              <Input
                id="contactPerson"
                placeholder="Name of reference person"
                {...register('contactPerson')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Reference Email (Optional)</Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="reference@company.com"
                {...register('contactEmail')}
                // error={errors.contactEmail?.message}
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-2">
            <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
            <Textarea
              id="additionalInfo"
              placeholder="Any additional information that supports your application..."
              {...register('additionalInfo')}
            />
          </div>

          {/* Supporting Documents */}
          <div className="space-y-2">
            <Label>Supporting Documents (Optional)</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <Label htmlFor="documents" className="cursor-pointer">
                  <span className="text-sm font-medium text-primary hover:text-primary/80">
                    Upload documents
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">
                    or drag and drop
                  </span>
                </Label>
                <Input
                  id="documents"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  PDF, DOC, or images up to 10MB each (max 5 files)
                </p>
              </div>
            </div>

            {/* File List */}
            {supportingDocs.length > 0 && (
              <div className="space-y-2">
                {supportingDocs.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(file.size / 1024 / 1024).toFixed(1)} MB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Application...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </div>

          {/* Information */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Applications are typically reviewed within 2-3 business days. 
              You'll receive an email notification with the decision.
            </AlertDescription>
          </Alert>
        </form>
      </CardContent>
    </Card>
  )
}