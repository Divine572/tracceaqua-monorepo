'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// Import our components
import SupplyChainDashboard from './SupplyChainDashboard'
import SourceTypeSelector, { type SourceType } from './SourceTypeSelector'
import SupplyChainWorkflowForm from './SupplyChainWorkflowForm'

type ViewMode = 'dashboard' | 'sourceSelect' | 'createFarmed' | 'createWildCapture' | 'edit' | 'view'

interface SupplyChainFormData {
  productId: string
  batchId: string
  sourceType: SourceType
  species: {
    scientificName: string
    commonName: string
  }
  estimatedQuantity: number
  unit: string
  stages: Record<string, {
    completed: boolean
    startDate?: string
    completedDate?: string
    location?: string
    responsible?: string
    data: Record<string, any>
    photos: File[]
    documents: File[]
    notes?: string
  }>
  tags: string[]
  publiclyVisible: boolean
  qrCodeGenerated: boolean
}

interface SupplyChainRecord {
  id: string
  productId: string
  batchId: string
  sourceType: SourceType
  currentStage: string
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'REJECTED'
  product: {
    species: {
      scientificName: string
      commonName: string
    }
    quantity: number
    unit: string
  }
  origin: {
    location: string
    coordinates?: string
    facility?: string
  }
  stages: Array<{
    name: string
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
    completedAt?: string
    location?: string
  }>
  createdAt: string
  updatedAt: string
  creator: {
    name: string
    organization: string
    role: string
  }
  qrCodeGenerated: boolean
  blockchainRecorded: boolean
}

interface SupplyChainPageState {
  mode: ViewMode
  selectedRecordId?: string
  selectedRecord?: SupplyChainRecord
  selectedSourceType?: SourceType
  isLoading: boolean
  error: string | null
}

export default function SupplyChainMainPage() {
  const [state, setState] = useState<SupplyChainPageState>({
    mode: 'dashboard',
    isLoading: false,
    error: null
  })
  
  const [formData, setFormData] = useState<Partial<SupplyChainFormData>>({})
  const { toast } = useToast()

  // Navigation handlers
  const handleCreateNew = () => {
    setState(prev => ({
      ...prev,
      mode: 'sourceSelect',
      selectedRecordId: undefined,
      selectedRecord: undefined,
      error: null
    }))
    setFormData({}) // Reset form data
  }

  const handleSourceTypeSelect = (sourceType: SourceType) => {
    setState(prev => ({
      ...prev,
      mode: sourceType === 'FARMED' ? 'createFarmed' : 'createWildCapture',
      selectedSourceType: sourceType,
      error: null
    }))
    setFormData({ sourceType })
  }

  const handleEditRecord = async (recordId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      // TODO: Fetch record from API
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      // Mock record data conversion to form data
      const mockFormData: Partial<SupplyChainFormData> = {
        productId: 'SC-2025-001',
        batchId: 'BATCH-001',
        sourceType: 'FARMED' as SourceType,
        species: {
          scientificName: 'Crassostrea gasar',
          commonName: 'West African Oyster'
        },
        estimatedQuantity: 5000,
        unit: 'pieces'
      }
      
      setFormData(mockFormData)
      setState(prev => ({
        ...prev,
        mode: mockFormData.sourceType === 'FARMED' ? 'createFarmed' : 'createWildCapture',
        selectedRecordId: recordId,
        selectedSourceType: mockFormData.sourceType,
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

  const handleViewRecord = async (recordId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      // TODO: Fetch record from API
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      // Mock record data
      const mockRecord: SupplyChainRecord = {
        id: recordId,
        productId: 'SC-2025-001',
        batchId: 'BATCH-001',
        sourceType: 'FARMED',
        currentStage: 'Processing',
        status: 'ACTIVE',
        product: {
          species: {
            scientificName: 'Crassostrea gasar',
            commonName: 'West African Oyster'
          },
          quantity: 5000,
          unit: 'pieces'
        },
        origin: {
          location: 'Lagos Lagoon Oyster Farm',
          coordinates: '6.4541, 3.3947',
          facility: 'Aqua-Tech Farms Ltd'
        },
        stages: [
          { name: 'Hatchery', status: 'COMPLETED', completedAt: '2025-06-01', location: 'Lagos Hatchery' },
          { name: 'Grow-out', status: 'COMPLETED', completedAt: '2025-08-15', location: 'Lagos Lagoon Farm' },
          { name: 'Harvest', status: 'COMPLETED', completedAt: '2025-08-20', location: 'Lagos Lagoon Farm' },
          { name: 'Processing', status: 'IN_PROGRESS', location: 'Marina Processing Plant' },
          { name: 'Distribution', status: 'PENDING' },
          { name: 'Retail', status: 'PENDING' }
        ],
        createdAt: '2025-06-01T08:00:00Z',
        updatedAt: '2025-08-21T14:30:00Z',
        creator: {
          name: 'John Okafor',
          organization: 'Aqua-Tech Farms Ltd',
          role: 'Farm Manager'
        },
        qrCodeGenerated: true,
        blockchainRecorded: false
      }
      
      setState(prev => ({
        ...prev,
        mode: 'view',
        selectedRecordId: recordId,
        selectedRecord: mockRecord,
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

  const handleCloseToDashboard = () => {
    setState(prev => ({
      ...prev,
      mode: 'dashboard',
      selectedRecordId: undefined,
      selectedRecord: undefined,
      selectedSourceType: undefined,
      error: null
    }))
    setFormData({})
  }

  const handleBackToSourceSelect = () => {
    setState(prev => ({
      ...prev,
      mode: 'sourceSelect',
      selectedSourceType: undefined,
      error: null
    }))
  }

  // Handle form submission (create or update)
  const handleFormSubmit = async (submittedFormData: SupplyChainFormData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      if (state.selectedRecordId) {
        // Update existing record
        console.log('Updating supply chain record:', submittedFormData)
        await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
        
        toast({
          title: "Record Updated!",
          description: `Supply chain record ${submittedFormData.productId} has been updated successfully.`,
        })
        
      } else {
        // Create new record
        console.log('Creating supply chain record:', submittedFormData)
        await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
        
        toast({
          title: "Record Created!",
          description: `Supply chain record ${submittedFormData.productId} has been created successfully.`,
        })
      }
      
      // Return to dashboard
      handleCloseToDashboard()
      
    } catch (error) {
      console.error('Error submitting record:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to submit record'
      }))
      
      toast({
        title: "Submission Failed",
        description: "Could not submit the supply chain record. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Handle saving draft
  const handleSaveDraft = async (draftData: Partial<SupplyChainFormData>) => {
    try {
      console.log('Saving draft:', draftData)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
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

  // Loading screen for dashboard
  if (state.isLoading && state.mode === 'dashboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg font-semibold mb-2">Loading Supply Chain Records</h3>
            <p className="text-gray-600">Please wait while we load your data...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state for dashboard
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
                We encountered an error while loading the supply chain module.
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
    case 'sourceSelect':
      return (
        <SourceTypeSelector
          onSelect={handleSourceTypeSelect}
          onBack={handleCloseToDashboard}
        />
      )

    case 'createFarmed':
    case 'createWildCapture':
      return (
        <SupplyChainWorkflowForm
          sourceType={state.selectedSourceType!}
          initialData={formData}
          mode={state.selectedRecordId ? 'edit' : 'create'}
          onSubmit={handleFormSubmit}
          onSaveDraft={handleSaveDraft}
          onBack={handleBackToSourceSelect}
          onClose={handleCloseToDashboard}
        />
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
                  Product Journey Details
                </h1>
                <p className="text-gray-600">
                  {state.selectedRecord?.productId} - {state.selectedRecord?.product.species.commonName}
                </p>
              </div>
            </div>

            {/* Record Details */}
            {state.selectedRecord && (
              <div className="space-y-6">
                {/* Product Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Product Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Product Information</h4>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium">Product ID:</span> {state.selectedRecord.productId}</div>
                          <div><span className="font-medium">Batch ID:</span> {state.selectedRecord.batchId}</div>
                          <div><span className="font-medium">Scientific Name:</span> <em>{state.selectedRecord.product.species.scientificName}</em></div>
                          <div><span className="font-medium">Common Name:</span> {state.selectedRecord.product.species.commonName}</div>
                          <div><span className="font-medium">Quantity:</span> {state.selectedRecord.product.quantity} {state.selectedRecord.product.unit}</div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Origin Information</h4>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium">Source Type:</span> {state.selectedRecord.sourceType === 'FARMED' ? 'Farmed' : 'Wild-capture'}</div>
                          <div><span className="font-medium">Origin Location:</span> {state.selectedRecord.origin.location}</div>
                          {state.selectedRecord.origin.facility && (
                            <div><span className="font-medium">Facility:</span> {state.selectedRecord.origin.facility}</div>
                          )}
                          {state.selectedRecord.origin.coordinates && (
                            <div><span className="font-medium">Coordinates:</span> {state.selectedRecord.origin.coordinates}</div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Current Status</h4>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium">Current Stage:</span> {state.selectedRecord.currentStage}</div>
                          <div><span className="font-medium">Status:</span> 
                            <span className={`ml-1 px-2 py-1 rounded text-xs font-medium ${
                              state.selectedRecord.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' :
                              state.selectedRecord.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {state.selectedRecord.status}
                            </span>
                          </div>
                          <div><span className="font-medium">QR Code:</span> {state.selectedRecord.qrCodeGenerated ? '✅ Generated' : '❌ Pending'}</div>
                          <div><span className="font-medium">Blockchain:</span> {state.selectedRecord.blockchainRecorded ? '✅ Recorded' : '❌ Pending'}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Journey Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle>Product Journey Timeline</CardTitle>
                    <CardDescription>Track the product through each stage of the supply chain</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {state.selectedRecord.stages.map((stage, index) => (
                        <div key={stage.name} className="flex items-center gap-4 p-4 rounded-lg border">
                          <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold
                            ${stage.status === 'COMPLETED' ? 'bg-green-600' :
                              stage.status === 'IN_PROGRESS' ? 'bg-blue-600' : 
                              'bg-gray-400'}
                          `}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-gray-900">{stage.name}</h4>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                stage.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                stage.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {stage.status.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                              {stage.location && <span>📍 {stage.location}</span>}
                              {stage.completedAt && <span>📅 {new Date(stage.completedAt).toLocaleDateString()}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                  {(state.selectedRecord.status === 'DRAFT' || state.selectedRecord.status === 'ACTIVE') && (
                    <Button 
                      variant="outline" 
                      onClick={() => handleEditRecord(state.selectedRecord!.id)}
                    >
                      Update Record
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleCloseToDashboard}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )

    default:
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
          <div className="max-w-7xl mx-auto">
            <SupplyChainDashboard
              onCreateNew={handleCreateNew}
              onEditRecord={handleEditRecord}
              onViewRecord={handleViewRecord}
            />
          </div>
        </div>
      )
  }
}