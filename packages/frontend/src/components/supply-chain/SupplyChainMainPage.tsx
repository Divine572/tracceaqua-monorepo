'use client'

import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertTriangle, CheckCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// Import our components
import SupplyChainDashboard from './SupplyChainDashboard'
import { supplyChainApi } from '@/services/supplyChainApi'
import type { SupplyChainFormData, SupplyChainRecord, CreateSupplyChainRequest, UpdateSupplyChainRequest } from '@/services/supplyChainApi'

type ViewMode = 'dashboard' | 'create' | 'edit' | 'view'

interface SupplyChainPageState {
  mode: ViewMode
  selectedRecordId?: string
  isLoading: boolean
  error: string | null
  selectedRecord?: SupplyChainRecord
}

export default function SupplyChainMainPage() {
  const [state, setState] = useState<SupplyChainPageState>({
    mode: 'dashboard',
    isLoading: false,
    error: null
  })
  
  const [formData, setFormData] = useState<Partial<SupplyChainFormData>>({})
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
      const record = await supplyChainApi.getRecord(recordId)
      
      const convertedFormData: Partial<SupplyChainFormData> = {
        productId: record.productId,
        batchId: record.batchId || undefined,
        sourceType: record.sourceType,
        species: {
          scientificName: record.product?.species?.scientificName || '',
          commonName: record.product?.species?.commonName || ''
        },
        estimatedQuantity: record.product?.quantity || 0,
        unit: record.product?.unit || 'pieces',
        stages: record.stages?.reduce((acc: any, stage) => {
          acc[stage.name] = {
            completed: stage.status === 'COMPLETED',
            startDate: stage.startedAt,
            completedDate: stage.completedAt,
            location: stage.location,
            responsible: stage.responsible,
            data: stage.data || {},
            photos: [], // Files will be handled separately
            documents: [], // Files will be handled separately
            notes: stage.notes
          }
          return acc
        }, {}) || {},
        tags: record.tags || [],
        publiclyVisible: record.publiclyVisible,
        qrCodeGenerated: record.qrCodeGenerated || false
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
      const record = await supplyChainApi.getRecord(recordId)
      
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
  const handleFormSubmit = async (formData: SupplyChainFormData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      if (state.mode === 'create') {
        // Convert SupplyChainFormData to CreateSupplyChainRequest
        const createRequest: CreateSupplyChainRequest = {
          productId: formData.productId,
          batchId: formData.batchId,
          sourceType: formData.sourceType,
          scientificName: formData.species.scientificName,
          commonName: formData.species.commonName,
          estimatedQuantity: formData.estimatedQuantity,
          unit: formData.unit,
          originLocation: 'Unknown Location', // This should come from form
          initialStage: 'Initial', // This should come from form
          stageLocation: 'Unknown Location', // This should come from form
          responsible: 'Unknown', // This should come from form
          startDate: new Date().toISOString(),
          tags: formData.tags,
          publiclyVisible: formData.publiclyVisible,
          notes: 'Created from form'
        }

        const newRecord = await supplyChainApi.createRecord(createRequest)
        
        toast({
          title: "Record Created",
          description: `Supply chain record ${newRecord.productId} has been created successfully.`,
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
        // Convert SupplyChainFormData to UpdateSupplyChainRequest
        const updateRequest: UpdateSupplyChainRequest = {
          id: state.selectedRecordId,
          productId: formData.productId,
          batchId: formData.batchId,
          sourceType: formData.sourceType,
          scientificName: formData.species.scientificName,
          commonName: formData.species.commonName,
          estimatedQuantity: formData.estimatedQuantity,
          unit: formData.unit,
          tags: formData.tags,
          publiclyVisible: formData.publiclyVisible
        }

        const updatedRecord = await supplyChainApi.updateRecord(updateRequest)
        
        toast({
          title: "Record Updated",
          description: `Supply chain record ${updatedRecord.productId} has been updated successfully.`,
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
                Please wait while we fetch the record data.
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
          <h1 className="text-2xl font-bold">Create New Supply Chain Record</h1>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Supply chain creation form will be implemented in the next phase. For now, you can manage existing records.
          </AlertDescription>
        </Alert>

        {/* Placeholder for form component */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-gray-500">Form component coming soon...</p>
              <Button className="mt-4" onClick={handleBackToDashboard}>
                Return to Dashboard
              </Button>
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
            Edit Record: {state.selectedRecord?.productId}
          </h1>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Supply chain edit form will be implemented in the next phase. Record data has been loaded successfully.
          </AlertDescription>
        </Alert>

        {/* Show loaded record data */}
        {state.selectedRecord && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Loaded Record Data:</h3>
                  <pre className="mt-2 p-4 bg-gray-50 rounded text-sm overflow-auto">
                    {JSON.stringify(state.selectedRecord, null, 2)}
                  </pre>
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
            View Record: {state.selectedRecord?.productId}
          </h1>
        </div>

        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Supply chain view component will be implemented in the next phase. Record data has been loaded successfully.
          </AlertDescription>
        </Alert>

        {/* Show record details */}
        {state.selectedRecord && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Record Details:</h3>
                  <div className="mt-2 grid gap-2">
                    <div><strong>Product ID:</strong> {state.selectedRecord.productId}</div>
                    <div><strong>Batch ID:</strong> {state.selectedRecord.batchId || 'N/A'}</div>
                    <div><strong>Source Type:</strong> {state.selectedRecord.sourceType}</div>
                    <div><strong>Species:</strong> {state.selectedRecord.product?.species?.commonName}</div>
                    <div><strong>Quantity:</strong> {state.selectedRecord.product?.quantity} {state.selectedRecord.product?.unit}</div>
                    <div><strong>Current Stage:</strong> {state.selectedRecord.currentStage}</div>
                    <div><strong>Status:</strong> {state.selectedRecord.status}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleEditRecord(state.selectedRecord!.id)}
                    disabled={state.selectedRecord.status === 'COMPLETED'}
                  >
                    Edit Record
                  </Button>
                  <Button variant="outline" onClick={handleBackToDashboard}>
                    Return to Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // **DEFAULT DASHBOARD MODE**
  return (
    <div className="space-y-6">
      <SupplyChainDashboard
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