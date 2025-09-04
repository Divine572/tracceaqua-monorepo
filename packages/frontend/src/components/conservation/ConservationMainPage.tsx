'use client'

import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertTriangle, CheckCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// Import our components
import ConservationDashboard from './ConservationDashboard'
import { conservationApi } from '@/services/conservationApi'
import type { ConservationFormData, ConservationRecord, CreateConservationRequest, UpdateConservationRequest } from '@/services/conservationApi'

type ViewMode = 'dashboard' | 'create' | 'edit' | 'view'

interface ConservationPageState {
  mode: ViewMode
  selectedRecordId?: string
  isLoading: boolean
  error: string | null
  selectedRecord?: ConservationRecord
}

export default function ConservationMainPage() {
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

  // Handle editing existing record - **REAL API INTEGRATION**
  const handleEditRecord = async (recordId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const record = await conservationApi.getRecord(recordId)
      
      // **REAL API DATA CONVERSION - NO MOCK DATA**
      const convertedFormData: Partial<ConservationFormData> = {
        location: {
          locationName: record.location.name,
          waterBody: record.location.waterBody,
          latitude: record.location.coordinates ? parseFloat(record.location.coordinates.split(',')[0].trim()) : undefined,
          longitude: record.location.coordinates ? parseFloat(record.location.coordinates.split(',')[1].trim()) : undefined,
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
          estimatedAge: '', // Not available in ConservationRecord
          size: {
            length: record.species.size?.length || 0,
            weight: record.species.size?.weight || 0
          },
          condition: record.species.condition || ''
        },
        sampling: {
          method: record.sampling.method,
          equipment: record.sampling.equipment || [],
          collectionDate: record.sampling.collectionDate,
          collectionTime: '', // Not available in ConservationRecord
          sampleSize: record.sampling.sampleSize,
          preservationMethod: record.sampling.preservationMethod || '',
          chainOfCustody: '' // Not available in ConservationRecord
        },
        labTests: {
          testTypes: record.labTests?.testTypes || [],
          testResults: [], // Files will be handled separately
          certificates: [], // Files will be handled separately
          testDate: record.labTests?.testDate || '',
          laboratoryName: record.labTests?.laboratoryName || '',
          technicianName: '', // Not available in ConservationRecord
          notes: '' // Not available in ConservationRecord
        },
        results: {
          summary: record.results.summary,
          recommendations: record.results.recommendations || '',
          tags: record.results.tags || [],
          publiclyVisible: record.results.publiclyVisible,
          researchPurpose: '' // Not available in ConservationRecord
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

  // Handle viewing record details - **REAL API INTEGRATION**
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
      console.error('Error loading record for viewing:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load record'
      }))
      
      toast({
        title: "Error Loading Record",
        description: "Could not load the record details. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Handle going back to dashboard
  const handleBackToDashboard = () => {
    setState(prev => ({
      ...prev,
      mode: 'dashboard',
      selectedRecordId: undefined,
      selectedRecord: undefined,
      error: null
    }))
    setFormData({})
  }

  // Handle form submission - **REAL API INTEGRATION**
  const handleFormSubmit = async (formData: ConservationFormData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      if (state.mode === 'create') {
        // Convert ConservationFormData to CreateConservationRequest
        const createRequest: CreateConservationRequest = {
          locationName: formData.location.locationName,
          waterBody: formData.location.waterBody,
          latitude: formData.location.latitude,
          longitude: formData.location.longitude,
          depth: formData.location.depth,
          waterTemperature: formData.location.waterTemperature,
          salinity: formData.location.salinity,
          ph: formData.location.ph,
          dissolvedOxygen: formData.location.dissolvedOxygen,
          weather: formData.location.weather,
          locationNotes: formData.location.notes,
          scientificName: formData.species.scientificName,
          commonName: formData.species.commonName,
          family: formData.species.family,
          characteristics: formData.species.characteristics,
          estimatedAge: formData.species.estimatedAge,
          length: formData.species.size.length,
          weight: formData.species.size.weight,
          condition: formData.species.condition,
          method: formData.sampling.method,
          collectionDate: formData.sampling.collectionDate,
          collectionTime: formData.sampling.collectionTime,
          sampleSize: formData.sampling.sampleSize,
          equipment: formData.sampling.equipment,
          preservationMethod: formData.sampling.preservationMethod,
          chainOfCustody: formData.sampling.chainOfCustody,
          testTypes: formData.labTests.testTypes,
          testDate: formData.labTests.testDate,
          laboratoryName: formData.labTests.laboratoryName,
          technicianName: formData.labTests.technicianName,
          labNotes: formData.labTests.notes,
          summary: formData.results.summary,
          recommendations: formData.results.recommendations,
          tags: formData.results.tags,
          publiclyVisible: formData.results.publiclyVisible,
          researchPurpose: formData.results.researchPurpose
        }

        const newRecord = await conservationApi.createRecord(createRequest)
        
        toast({
          title: "Record Created",
          description: `Conservation record ${newRecord.samplingId} has been created successfully.`,
        })
        
        // Navigate to view mode for the new record
        setState(prev => ({
          ...prev,
          mode: 'view',
          selectedRecordId: newRecord.id,
          selectedRecord: newRecord,
          isLoading: false
        }))
        
      } else if (state.mode === 'edit' && state.selectedRecordId) {
        // Convert ConservationFormData to UpdateConservationRequest
        const updateRequest: UpdateConservationRequest = {
          id: state.selectedRecordId,
          locationName: formData.location.locationName,
          waterBody: formData.location.waterBody,
          latitude: formData.location.latitude,
          longitude: formData.location.longitude,
          depth: formData.location.depth,
          waterTemperature: formData.location.waterTemperature,
          salinity: formData.location.salinity,
          ph: formData.location.ph,
          dissolvedOxygen: formData.location.dissolvedOxygen,
          weather: formData.location.weather,
          locationNotes: formData.location.notes,
          scientificName: formData.species.scientificName,
          commonName: formData.species.commonName,
          family: formData.species.family,
          characteristics: formData.species.characteristics,
          estimatedAge: formData.species.estimatedAge,
          length: formData.species.size.length,
          weight: formData.species.size.weight,
          condition: formData.species.condition,
          method: formData.sampling.method,
          collectionDate: formData.sampling.collectionDate,
          collectionTime: formData.sampling.collectionTime,
          sampleSize: formData.sampling.sampleSize,
          equipment: formData.sampling.equipment,
          preservationMethod: formData.sampling.preservationMethod,
          chainOfCustody: formData.sampling.chainOfCustody,
          testTypes: formData.labTests.testTypes,
          testDate: formData.labTests.testDate,
          laboratoryName: formData.labTests.laboratoryName,
          technicianName: formData.labTests.technicianName,
          labNotes: formData.labTests.notes,
          summary: formData.results.summary,
          recommendations: formData.results.recommendations,
          tags: formData.results.tags,
          publiclyVisible: formData.results.publiclyVisible,
          researchPurpose: formData.results.researchPurpose
        }
        
        const updatedRecord = await conservationApi.updateRecord(updateRequest)
        
        toast({
          title: "Record Updated",
          description: `Conservation record ${updatedRecord.samplingId} has been updated successfully.`,
        })
        
        // Navigate to view mode for the updated record
        setState(prev => ({
          ...prev,
          mode: 'view',
          selectedRecord: updatedRecord,
          isLoading: false
        }))
      }
      
    } catch (error) {
      console.error('Error saving record:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save record'

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))
      
      toast({
        title: state.mode === 'create' ? "Creation Failed" : "Update Failed",
        description: errorMessage,
        variant: "destructive"
      })
    }
  }

  // Handle record submission for verification - **REAL API INTEGRATION**
  const handleSubmitForVerification = async (recordId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const submittedRecord = await conservationApi.submitRecord(recordId)
      
      toast({
        title: "Record Submitted",
        description: `Conservation record ${submittedRecord.samplingId} has been submitted for verification.`,
      })
      
      setState(prev => ({
        ...prev,
        selectedRecord: submittedRecord,
        isLoading: false
      }))

    } catch (error) {
      console.error('Error submitting record:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to submit record'
      }))

      toast({
        title: "Submission Failed",
        description: "Could not submit record for verification. Please try again.",
        variant: "destructive"
      })
    }
  }

  // **ERROR STATE WITH RETRY**
  if (state.error && state.mode !== 'dashboard') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBackToDashboard}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Error Loading Record</h3>
              <p className="mt-1 text-sm text-gray-500">
                {state.error}
              </p>
              <div className="mt-4 space-x-2">
                <Button
                  onClick={() => {
                    if (state.selectedRecordId) {
                      if (state.mode === 'edit') {
                        handleEditRecord(state.selectedRecordId)
                      } else if (state.mode === 'view') {
                        handleViewRecord(state.selectedRecordId)
                      }
                    }
                  }}
                  disabled={state.isLoading}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${state.isLoading ? 'animate-spin' : ''}`} />
                  Retry
                </Button>
                <Button variant="outline" onClick={handleBackToDashboard}>
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // **LOADING STATE**
  if (state.isLoading && state.mode !== 'dashboard') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBackToDashboard} disabled>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Loader2 className="mx-auto h-12 w-12 text-blue-600 animate-spin" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                {state.mode === 'edit' ? 'Loading Record for Editing...' : 'Loading Record Details...'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Please wait while we fetch the conservation record data.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // **FORM MODES - PLACEHOLDER FOR NOW**
  if (state.mode === 'create') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBackToDashboard}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Create New Conservation Record</h1>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Conservation creation wizard will be implemented in the next phase. This will include the 5-step form for sampling data, species identification, lab tests, and more.
          </AlertDescription>
        </Alert>

        {/* Placeholder for form wizard */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="space-y-4">
                <p className="text-gray-500">5-Step Conservation Form Wizard coming soon:</p>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                  <div className="p-3 bg-blue-50 rounded">Step 1: Location & Environmental Data</div>
                  <div className="p-3 bg-blue-50 rounded">Step 2: Species Identification</div>
                  <div className="p-3 bg-blue-50 rounded">Step 3: Sampling Methods</div>
                  <div className="p-3 bg-blue-50 rounded">Step 4: Lab Test Upload</div>
                  <div className="p-3 bg-blue-50 rounded">Step 5: Results & Verification</div>
                </div>
                <Button className="mt-4" onClick={handleBackToDashboard}>
                  Return to Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (state.mode === 'edit') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBackToDashboard}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">
            Edit Record: {state.selectedRecord?.samplingId}
          </h1>
        </div>

        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Conservation edit form will be implemented in the next phase. Record data has been loaded successfully from the API.
          </AlertDescription>
        </Alert>

        {/* Show loaded record data */}
        {state.selectedRecord && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Successfully Loaded Record Data:</h3>
                  <div className="mt-2 grid gap-2 text-sm">
                    <div><strong>Sampling ID:</strong> {state.selectedRecord.samplingId}</div>
                    <div><strong>Location:</strong> {state.selectedRecord.location.name}</div>
                    <div><strong>Water Body:</strong> {state.selectedRecord.location.waterBody}</div>
                    <div><strong>Species:</strong> {state.selectedRecord.species.commonName} ({state.selectedRecord.species.scientificName})</div>
                    <div><strong>Status:</strong> {state.selectedRecord.status}</div>
                    <div><strong>Created:</strong> {new Date(state.selectedRecord.createdAt).toLocaleDateString()}</div>
                  </div>
                  <details className="mt-4">
                    <summary className="cursor-pointer font-medium">View Full Record Data (JSON)</summary>
                    <pre className="mt-2 p-4 bg-gray-50 rounded text-xs overflow-auto max-h-64">
                      {JSON.stringify(state.selectedRecord, null, 2)}
                    </pre>
                  </details>
                </div>
                <Button onClick={handleBackToDashboard}>
                  Return to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  if (state.mode === 'view') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBackToDashboard}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">
            View Record: {state.selectedRecord?.samplingId}
          </h1>
        </div>

        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Conservation record viewer will be implemented in the next phase. Record data has been loaded successfully.
          </AlertDescription>
        </Alert>

        {/* Show record details */}
        {state.selectedRecord && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">Record Information</h3>
                    <div className="mt-2 space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div><strong>Sampling ID:</strong> {state.selectedRecord.samplingId}</div>
                        <div><strong>Status:</strong>
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${state.selectedRecord.status === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                            state.selectedRecord.status === 'SUBMITTED' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                            {state.selectedRecord.status}
                          </span>
                        </div>
                        <div><strong>Created:</strong> {new Date(state.selectedRecord.createdAt).toLocaleDateString()}</div>
                        <div><strong>Updated:</strong> {new Date(state.selectedRecord.updatedAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium">Location Details</h4>
                    <div className="mt-1 text-sm space-y-1">
                      <div><strong>Name:</strong> {state.selectedRecord.location.name}</div>
                      <div><strong>Water Body:</strong> {state.selectedRecord.location.waterBody}</div>
                      {state.selectedRecord.location.coordinates && (
                        <div><strong>Coordinates:</strong> {state.selectedRecord.location.coordinates}</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium">Species Information</h4>
                    <div className="mt-1 text-sm space-y-1">
                      <div><strong>Common Name:</strong> {state.selectedRecord.species.commonName}</div>
                      <div><strong>Scientific Name:</strong> <em>{state.selectedRecord.species.scientificName}</em></div>
                      <div><strong>Family:</strong> {state.selectedRecord.species.family}</div>
                    </div>
                  </div>

                  {state.selectedRecord.sampling && (
                    <div>
                      <h4 className="font-medium">Sampling Details</h4>
                      <div className="mt-1 text-sm space-y-1">
                        <div><strong>Method:</strong> {state.selectedRecord.sampling.method}</div>
                        <div><strong>Collection Date:</strong> {new Date(state.selectedRecord.sampling.collectionDate).toLocaleDateString()}</div>
                        <div><strong>Sample Size:</strong> {state.selectedRecord.sampling.sampleSize}</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">Research Results</h3>
                    <div className="mt-2 text-sm">
                      <div><strong>Summary:</strong></div>
                      <div className="mt-1 p-2 bg-gray-50 rounded text-xs">{state.selectedRecord.results.summary}</div>
                      {state.selectedRecord.results.recommendations && (
                        <>
                          <div className="mt-2"><strong>Recommendations:</strong></div>
                          <div className="mt-1 p-2 bg-gray-50 rounded text-xs">{state.selectedRecord.results.recommendations}</div>
                        </>
                      )}
                    </div>
                  </div>

                  {state.selectedRecord.results.tags && state.selectedRecord.results.tags.length > 0 && (
                    <div>
                      <h4 className="font-medium">Tags</h4>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {state.selectedRecord.results.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {state.selectedRecord.creator && (
                    <div>
                      <h4 className="font-medium">Created By</h4>
                      <div className="mt-1 text-sm">
                        <div><strong>Name:</strong> {state.selectedRecord.creator.name}</div>
                        {state.selectedRecord.creator.organization && (
                          <div><strong>Organization:</strong> {state.selectedRecord.creator.organization}</div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 pt-4">
                    {(state.selectedRecord.status === 'DRAFT' || state.selectedRecord.status === 'REJECTED') && (
                      <Button 
                        onClick={() => handleEditRecord(state.selectedRecord!.id)}
                        disabled={state.isLoading}
                      >
                        Edit Record
                      </Button>
                    )}

                    {state.selectedRecord.status === 'DRAFT' && (
                      <Button
                        variant="outline"
                        onClick={() => handleSubmitForVerification(state.selectedRecord!.id)}
                        disabled={state.isLoading}
                      >
                        Submit for Verification
                      </Button>
                    )}

                    <Button variant="outline" onClick={handleBackToDashboard}>
                      Return to Dashboard
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    )
  }

  // **DEFAULT DASHBOARD MODE**
  return (
    <div className="space-y-6">
      <ConservationDashboard
        onCreateNew={handleCreateNew}
        onEditRecord={handleEditRecord}
        onViewRecord={handleViewRecord}
      />

      {/* Show any errors */}
      {state.error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {state.error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}