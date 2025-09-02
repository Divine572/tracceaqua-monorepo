'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// Import our components
import ConservationDashboard from './ConservationDashboard'
import ConservationFormWizard from './ConservationFormWizard'
import conservationApi, { ConservationFormData, ConservationRecord } from '../../services/conservationApi'

type ViewMode = 'dashboard' | 'create' | 'edit' | 'view'

interface ConservationPageState {
  mode: ViewMode
  selectedRecordId?: string
  isLoading: boolean
  error: string | null
  selectedRecord?: ConservationRecord
}

export default function ConservationPage() {
  const [state, setState] = useState<ConservationPageState>({
    mode: 'dashboard',
    isLoading: false,
    error: null
  })
  
  const [formData, setFormData] = useState<Partial<ConservationFormData>>({})
  const { toast } = useToast()

  // Handle creating new record
  const handleCreateNew = () => {
    setState(prev => ({
      ...prev,
      mode: 'create',
      selectedRecordId: undefined,
      selectedRecord: undefined,
      error: null
    }))
    setFormData({}) // Reset form data
  }

  // Handle editing existing record
  const handleEditRecord = async (recordId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const record = await conservationApi.getRecord(recordId)
      
      // Convert record to form data format
      const convertedFormData: Partial<ConservationFormData> = {
        location: {
          locationName: record.location.name,
          waterBody: record.location.waterBody,
          latitude: record.location.coordinates ? parseFloat(record.location.coordinates.split(',')[0]) : undefined,
          longitude: record.location.coordinates ? parseFloat(record.location.coordinates.split(',')[1]) : undefined,
          depth: record.location.depth || 0,
          waterTemperature: record.location.environmentalData?.waterTemperature || 0,
          salinity: record.location.environmentalData?.salinity || 0,
          ph: record.location.environmentalData?.ph || 0,
          dissolvedOxygen: record.location.environmentalData?.dissolvedOxygen || 0,
          weather: record.location.environmentalData?.weather || '',
          notes: record.location.environmentalData?.notes || ''
        },
        species: {
          scientificName: record.species.scientificName,
          commonName: record.species.commonName,
          family: record.species.family,
          photos: [], // Files will be handled separately
          characteristics: record.species.characteristics || '',
          estimatedAge: record.species.size?.length ? 'Adult' : 'Unknown',
          size: record.species.size || { length: 0, weight: 0 },
          condition: record.species.condition || ''
        },
        sampling: {
          method: record.sampling.method,
          equipment: record.sampling.equipment,
          collectionDate: record.sampling.collectionDate,
          collectionTime: '12:00', // Default time if not available
          sampleSize: record.sampling.sampleSize,
          preservationMethod: record.sampling.preservationMethod || '',
          chainOfCustody: ''
        },
        labTests: {
          testTypes: record.labTests.testTypes,
          testResults: [], // Files will be handled separately
          certificates: [], // Files will be handled separately
          testDate: record.labTests.testDate || '',
          laboratoryName: record.labTests.laboratoryName || '',
          technicianName: '',
          notes: ''
        },
        results: {
          summary: record.results.summary,
          recommendations: record.results.recommendations || '',
          tags: record.results.tags,
          publiclyVisible: record.results.publiclyVisible,
          researchPurpose: ''
        }
      }
      
      setFormData(convertedFormData)
      setState(prev => ({
        ...prev,
        mode: 'edit',
        selectedRecordId: recordId,
        selectedRecord: record,
        isLoading: false
      }))
      
    } catch (error) {
      console.error('Error loading record for editing:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load record'
      }))
      
      toast({
        title: "Error Loading Record",
        description: "Could not load the record for editing. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Handle viewing record details
  const handleViewRecord = async (recordId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const record = await conservationApi.getRecord(recordId)
      
      setState(prev => ({
        ...prev,
        mode: 'view',
        selectedRecordId: recordId,
        selectedRecord: record,
        isLoading: false
      }))
      
    } catch (error) {
      console.error('Error loading record:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load record'
      }))
      
      toast({
        title: "Error Loading Record",
        description: "Could not load the record. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Handle closing form/view and returning to dashboard
  const handleCloseToDashboard = () => {
    setState(prev => ({
      ...prev,
      mode: 'dashboard',
      selectedRecordId: undefined,
      selectedRecord: undefined,
      error: null
    }))
    setFormData({})
  }

  // Handle form submission (create or update)
  const handleFormSubmit = async (submittedFormData: ConservationFormData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      if (state.mode === 'create') {
        // Creating new record
        const newRecord = await conservationApi.submitRecordWithFiles(submittedFormData)
        
        toast({
          title: "Record Created!",
          description: `Conservation record ${newRecord.samplingId} has been submitted successfully.`,
        })
        
        // Return to dashboard
        handleCloseToDashboard()
        
      } else if (state.mode === 'edit' && state.selectedRecordId) {
        // Updating existing record
        const updateData = {
          id: state.selectedRecordId,
          // Convert form data to update format
          locationName: submittedFormData.location.locationName,
          waterBody: submittedFormData.location.waterBody,
          latitude: submittedFormData.location.latitude,
          longitude: submittedFormData.location.longitude,
          depth: submittedFormData.location.depth,
          waterTemperature: submittedFormData.location.waterTemperature,
          salinity: submittedFormData.location.salinity,
          ph: submittedFormData.location.ph,
          dissolvedOxygen: submittedFormData.location.dissolvedOxygen,
          weather: submittedFormData.location.weather,
          locationNotes: submittedFormData.location.notes,
          scientificName: submittedFormData.species.scientificName,
          commonName: submittedFormData.species.commonName,
          family: submittedFormData.species.family,
          characteristics: submittedFormData.species.characteristics,
          estimatedAge: submittedFormData.species.estimatedAge,
          length: submittedFormData.species.size.length,
          weight: submittedFormData.species.size.weight,
          condition: submittedFormData.species.condition,
          method: submittedFormData.sampling.method,
          collectionDate: submittedFormData.sampling.collectionDate,
          collectionTime: submittedFormData.sampling.collectionTime,
          sampleSize: submittedFormData.sampling.sampleSize,
          equipment: submittedFormData.sampling.equipment,
          preservationMethod: submittedFormData.sampling.preservationMethod,
          chainOfCustody: submittedFormData.sampling.chainOfCustody,
          testTypes: submittedFormData.labTests.testTypes,
          testDate: submittedFormData.labTests.testDate,
          laboratoryName: submittedFormData.labTests.laboratoryName,
          technicianName: submittedFormData.labTests.technicianName,
          labNotes: submittedFormData.labTests.notes,
          summary: submittedFormData.results.summary,
          recommendations: submittedFormData.results.recommendations,
          tags: submittedFormData.results.tags,
          publiclyVisible: submittedFormData.results.publiclyVisible,
          researchPurpose: submittedFormData.results.researchPurpose
        }
        
        const updatedRecord = await conservationApi.updateRecord(updateData)
        
        toast({
          title: "Record Updated!",
          description: `Conservation record ${updatedRecord.samplingId} has been updated successfully.`,
        })
        
        // Return to dashboard
        handleCloseToDashboard()
      }
      
    } catch (error) {
      console.error('Error submitting record:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to submit record'
      }))
      
      toast({
        title: "Submission Failed",
        description: "Could not submit the conservation record. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Handle saving draft
  const handleSaveDraft = async (draftData: Partial<ConservationFormData>) => {
    try {
      await conservationApi.saveDraft(draftData)
      
      toast({
        title: "Draft Saved",
        description: "Your progress has been saved successfully.",
      })
      
    } catch (error) {
      console.error('Error saving draft:', error)
      toast({
        title: "Save Failed",
        description: "Could not save draft. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Loading screen
  if (state.isLoading && state.mode === 'dashboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg font-semibold mb-2">Loading Conservation Records</h3>
            <p className="text-gray-600">Please wait while we load your data...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (state.error && state.mode === 'dashboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
        <div className="max-w-2xl mx-auto pt-16">
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {state.error}
            </AlertDescription>
          </Alert>
          
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-4">Something went wrong</h3>
              <p className="text-gray-600 mb-4">
                We encountered an error while loading the conservation module.
              </p>
              <Button 
                onClick={() => setState(prev => ({ ...prev, error: null }))}
                className="gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Render based on current mode
  switch (state.mode) {
    case 'create':
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
          <ConservationFormWizard
            mode="create"
            onClose={handleCloseToDashboard}
            initialData={formData}
            onSubmit={handleFormSubmit}
            onSaveDraft={handleSaveDraft}
          />
        </div>
      )

    case 'edit':
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
          <ConservationFormWizard
            mode="edit"
            recordId={state.selectedRecordId}
            onClose={handleCloseToDashboard}
            initialData={formData}
            onSubmit={handleFormSubmit}
            onSaveDraft={handleSaveDraft}
          />
        </div>
      )

    case 'view':
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <Button variant="outline" onClick={handleCloseToDashboard} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Conservation Record Details
                </h1>
                <p className="text-gray-600">
                  {state.selectedRecord?.samplingId} - {state.selectedRecord?.species.commonName}
                </p>
              </div>
            </div>

            {/* Record Details */}
            {state.selectedRecord && (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Scientific Name:</Label>
                          <p className="font-medium italic">{state.selectedRecord.species.scientificName}</p>
                        </div>
                        <div>
                          <Label>Common Name:</Label>
                          <p className="font-medium">{state.selectedRecord.species.commonName}</p>
                        </div>
                        <div>
                          <Label>Location:</Label>
                          <p className="font-medium">{state.selectedRecord.location.name}</p>
                        </div>
                        <div>
                          <Label>Status:</Label>
                          <Badge 
                            variant={
                              state.selectedRecord.status === 'VERIFIED' ? 'default' :
                              state.selectedRecord.status === 'SUBMITTED' ? 'secondary' :
                              'outline'
                            }
                          >
                            {state.selectedRecord.status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Summary */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Summary</h3>
                      <p className="text-gray-700">{state.selectedRecord.results.summary}</p>
                    </div>

                    {/* Tags */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {state.selectedRecord.results.tags.map((tag) => (
                          <Badge key={tag} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                      {(state.selectedRecord.status === 'DRAFT' || state.selectedRecord.status === 'REJECTED') && (
                        <Button 
                          variant="outline" 
                          onClick={() => handleEditRecord(state.selectedRecord!.id)}
                        >
                          Edit Record
                        </Button>
                      )}
                      <Button variant="outline" onClick={handleCloseToDashboard}>
                        Close
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )

    default:
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
          <div className="max-w-7xl mx-auto">
            <ConservationDashboard
              onCreateNew={handleCreateNew}
              onEditRecord={handleEditRecord}
              onViewRecord={handleViewRecord}
            />
          </div>
        </div>
      )
  }
}

// Helper components
function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-sm font-medium text-gray-600">{children}</span>
}

function Badge({ children, variant = 'default' }: { 
  children: React.ReactNode
  variant?: 'default' | 'secondary' | 'outline'
}) {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
  const variantClasses = {
    default: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 text-gray-800", 
    outline: "border border-gray-300 text-gray-700"
  }
  
  return (
    <span className={`${baseClasses} ${variantClasses[variant]}`}>
      {children}
    </span>
  )
}