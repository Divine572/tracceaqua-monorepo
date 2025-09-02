// File: packages/frontend/src/components/conservation/ConservationFormWizard.tsx
'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Save, Upload, MapPin, Fish, FlaskConical, FileCheck, CheckCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// Import step components (we'll create these next)
import LocationEnvironmentalStep from './steps/LocationEnvironmentalStep'
import SpeciesIdentificationStep from './steps/SpeciesIdentificationStep'  
import SamplingMethodsStep from './steps/SamplingMethodsStep'
import LabTestUploadStep from './steps/LabTestUploadStep'
import ResultsVerificationStep from './steps/ResultsVerificationStep'

// Form data interface
export interface ConservationFormData {
  // Step 1: Location & Environmental Data
  location: {
    latitude?: number
    longitude?: number
    locationName: string
    waterBody: string
    depth: number
    waterTemperature: number
    salinity: number
    ph: number
    dissolvedOxygen: number
    weather: string
    notes: string
  }
  
  // Step 2: Species Identification
  species: {
    scientificName: string
    commonName: string
    family: string
    photos: File[]
    characteristics: string
    estimatedAge: string
    size: {
      length: number
      weight: number
    }
    condition: string
  }
  
  // Step 3: Sampling Methods
  sampling: {
    method: string
    equipment: string[]
    collectionDate: string
    collectionTime: string
    sampleSize: number
    preservationMethod: string
    chainOfCustody: string
  }
  
  // Step 4: Lab Test Upload
  labTests: {
    testTypes: string[]
    testResults: File[]
    certificates: File[]
    testDate: string
    laboratoryName: string
    technicianName: string
    notes: string
  }
  
  // Step 5: Results & Verification
  results: {
    summary: string
    recommendations: string
    tags: string[]
    publiclyVisible: boolean
    researchPurpose: string
  }
}

// Initial form data
const initialFormData: ConservationFormData = {
  location: {
    locationName: '',
    waterBody: '',
    depth: 0,
    waterTemperature: 0,
    salinity: 0,
    ph: 0,
    dissolvedOxygen: 0,
    weather: '',
    notes: ''
  },
  species: {
    scientificName: '',
    commonName: '',
    family: '',
    photos: [],
    characteristics: '',
    estimatedAge: '',
    size: { length: 0, weight: 0 },
    condition: ''
  },
  sampling: {
    method: '',
    equipment: [],
    collectionDate: '',
    collectionTime: '',
    sampleSize: 0,
    preservationMethod: '',
    chainOfCustody: ''
  },
  labTests: {
    testTypes: [],
    testResults: [],
    certificates: [],
    testDate: '',
    laboratoryName: '',
    technicianName: '',
    notes: ''
  },
  results: {
    summary: '',
    recommendations: '',
    tags: [],
    publiclyVisible: true,
    researchPurpose: ''
  }
}

// Step configuration
const steps = [
  {
    id: 1,
    title: 'Location & Environment',
    description: 'Geographic location and environmental conditions',
    icon: MapPin,
    component: LocationEnvironmentalStep
  },
  {
    id: 2,
    title: 'Species Identification',  
    description: 'Species details and characteristics',
    icon: Fish,
    component: SpeciesIdentificationStep
  },
  {
    id: 3,
    title: 'Sampling Methods',
    description: 'Collection techniques and equipment',
    icon: FlaskConical,
    component: SamplingMethodsStep
  },
  {
    id: 4,
    title: 'Lab Test Upload',
    description: 'Test results and documentation',
    icon: Upload,
    component: LabTestUploadStep
  },
  {
    id: 5,
    title: 'Results & Verification',
    description: 'Final review and submission',
    icon: CheckCircle,
    component: ResultsVerificationStep
  }
]

interface ConservationFormWizardProps {
  onClose?: () => void
  initialData?: Partial<ConservationFormData>
  mode?: 'create' | 'edit'
  recordId?: string
  onSubmit?: (formData: ConservationFormData) => Promise<void>
  onSaveDraft?: (draftData: Partial<ConservationFormData>) => Promise<void>
}

export default function ConservationFormWizard({ 
  onClose, 
  initialData, 
  mode = 'create',
  recordId,
  onSubmit,
  onSaveDraft 
}: ConservationFormWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<ConservationFormData>({
    ...initialFormData,
    ...initialData
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Calculate progress
  const progress = (currentStep / steps.length) * 100

  // Update form data
  const updateFormData = useCallback((stepData: Partial<ConservationFormData>) => {
    setFormData(prev => ({ ...prev, ...stepData }))
  }, [])

  // Navigation handlers
  const goToNextStep = useCallback(() => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep])

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= steps.length) {
      setCurrentStep(step)
    }
  }, [])

  // Save draft
  const saveDraft = async () => {
    setIsSaving(true)
    try {
      if (onSaveDraft) {
        await onSaveDraft(formData)
      } else {
        // Fallback to local storage or other method
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      }
      
      toast({
        title: "Draft Saved",
        description: "Your progress has been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Could not save draft. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Submit form
  const submitForm = async () => {
    setIsSubmitting(true)
    try {
      if (onSubmit) {
        await onSubmit(formData as ConservationFormData)
      } else {
        // Fallback behavior
        console.log('Submitting conservation record:', formData)
        await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
        
        toast({
          title: "Record Submitted!",
          description: "Conservation record has been submitted for review.",
        })
        
        onClose?.()
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Could not submit record. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentStepConfig = steps[currentStep - 1]
  const StepComponent = currentStepConfig.component

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {mode === 'edit' ? 'Edit Conservation Record' : 'New Conservation Record'}
              </h1>
              <p className="text-gray-600">
                Step {currentStep} of {steps.length}: {currentStepConfig.title}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={saveDraft}
                disabled={isSaving}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Draft'}
              </Button>
              {onClose && (
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isActive = step.id === currentStep
              const isCompleted = step.id < currentStep
              const Icon = step.icon
              
              return (
                <div
                  key={step.id}
                  className="flex items-center cursor-pointer"
                  onClick={() => goToStep(step.id)}
                >
                  <div
                    className={`
                      flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200
                      ${isActive 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : isCompleted
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  {index < steps.length - 1 && (
                    <div 
                      className={`
                        w-12 h-0.5 mx-2 transition-all duration-200
                        ${isCompleted ? 'bg-green-600' : 'bg-gray-300'}
                      `}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step content */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <currentStepConfig.icon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">{currentStepConfig.title}</CardTitle>
                <CardDescription>{currentStepConfig.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div
              key={currentStep}
              className="animate-in slide-in-from-right-2 duration-200"
            >
              <StepComponent
                data={formData}
                updateData={updateFormData}
                onNext={goToNextStep}
                onPrevious={goToPreviousStep}
              />
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={goToPreviousStep}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              Step {currentStep} of {steps.length}
            </Badge>
          </div>

          {currentStep === steps.length ? (
            <Button
              onClick={submitForm}
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <FileCheck className="h-4 w-4" />
                  Submit Record
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={goToNextStep}
              className="gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}