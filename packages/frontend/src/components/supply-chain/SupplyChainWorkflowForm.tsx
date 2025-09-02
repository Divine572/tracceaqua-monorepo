'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ChevronLeft, ChevronRight, Save, ArrowLeft, Factory, Fish, Waves, MapPin, Truck, Store, Calendar, Package, User, AlertCircle, CheckCircle, Upload, Navigation } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export type SourceType = 'FARMED' | 'WILD_CAPTURE'

// Stage definitions
const FARMED_STAGES = [
  { 
    id: 'hatchery', 
    name: 'Hatchery', 
    icon: Factory,
    description: 'Spawning, fertilization, and larval rearing',
    fields: ['broodstock', 'spawningDate', 'fertilizationRate', 'larvaeCount', 'waterQuality', 'feedType']
  },
  { 
    id: 'growout', 
    name: 'Grow-out', 
    icon: Fish,
    description: 'Growth and development to market size',
    fields: ['growthSite', 'stockingDate', 'stockingDensity', 'feedSchedule', 'growthRate', 'mortality']
  },
  { 
    id: 'harvest', 
    name: 'Harvest', 
    icon: Waves,
    description: 'Collection and initial handling',
    fields: ['harvestDate', 'harvestMethod', 'quantity', 'size', 'quality', 'handlingProcedure']
  },
  { 
    id: 'processing', 
    name: 'Processing', 
    icon: Factory,
    description: 'Cleaning, sorting, and packaging',
    fields: ['processingFacility', 'processDate', 'processMethod', 'packagingType', 'grades', 'certificates']
  },
  { 
    id: 'distribution', 
    name: 'Distribution', 
    icon: Truck,
    description: 'Transportation and logistics',
    fields: ['distributionCenter', 'shipDate', 'transportMethod', 'temperature', 'destinations', 'deliveryDate']
  },
  { 
    id: 'retail', 
    name: 'Retail', 
    icon: Store,
    description: 'Final sale to consumers',
    fields: ['retailOutlet', 'receivedDate', 'displayMethod', 'pricePoint', 'soldDate', 'consumerFeedback']
  }
]

const WILD_CAPTURE_STAGES = [
  { 
    id: 'fishing', 
    name: 'Fishing', 
    icon: MapPin,
    description: 'Wild capture operations at sea',
    fields: ['vessel', 'fishingDate', 'location', 'method', 'catchQuantity', 'species']
  },
  { 
    id: 'processing', 
    name: 'Processing', 
    icon: Factory,
    description: 'Landing, sorting, and initial processing',
    fields: ['landingPort', 'landingDate', 'processMethod', 'grades', 'packagingType', 'certificates']
  },
  { 
    id: 'distribution', 
    name: 'Distribution', 
    icon: Truck,
    description: 'Transportation to markets',
    fields: ['distributionCenter', 'shipDate', 'transportMethod', 'temperature', 'destinations', 'deliveryDate']
  },
  { 
    id: 'retail', 
    name: 'Retail', 
    icon: Store,
    description: 'Consumer sales',
    fields: ['retailOutlet', 'receivedDate', 'displayMethod', 'pricePoint', 'soldDate', 'consumerFeedback']
  }
]

interface SupplyChainFormData {
  // Basic product info
  productId: string
  batchId: string
  sourceType: SourceType
  species: {
    scientificName: string
    commonName: string
  }
  estimatedQuantity: number
  unit: string
  
  // Stage data - dynamic based on source type
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
  
  // General info
  tags: string[]
  publiclyVisible: boolean
  qrCodeGenerated: boolean
}

interface SupplyChainWorkflowFormProps {
  sourceType: SourceType
  initialData?: Partial<SupplyChainFormData>
  mode?: 'create' | 'edit'
  onSubmit?: (data: SupplyChainFormData) => Promise<void>
  onSaveDraft?: (data: Partial<SupplyChainFormData>) => Promise<void>
  onBack?: () => void
  onClose?: () => void
}

export default function SupplyChainWorkflowForm({
  sourceType,
  initialData,
  mode = 'create',
  onSubmit,
  onSaveDraft,
  onBack,
  onClose
}: SupplyChainWorkflowFormProps) {
  const stages = sourceType === 'FARMED' ? FARMED_STAGES : WILD_CAPTURE_STAGES
  const [currentStageIndex, setCurrentStageIndex] = useState(0)
  const [formData, setFormData] = useState<SupplyChainFormData>(() => ({
    productId: '',
    batchId: '',
    sourceType,
    species: { scientificName: '', commonName: '' },
    estimatedQuantity: 0,
    unit: 'kg',
    stages: stages.reduce((acc, stage) => ({
      ...acc,
      [stage.id]: {
        completed: false,
        data: {},
        photos: [],
        documents: [],
        notes: ''
      }
    }), {}),
    tags: [],
    publiclyVisible: true,
    qrCodeGenerated: false,
    ...initialData
  }))
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const currentStage = stages[currentStageIndex]
  const progress = ((currentStageIndex + 1) / stages.length) * 100
  
  // Get current location
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location Error",
        description: "Geolocation is not supported by this browser",
        variant: "destructive"
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        updateStageField(currentStage.id, 'location', `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
        
        toast({
          title: "Location Updated",
          description: `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        })
      },
      (error) => {
        toast({
          title: "Location Error",
          description: "Unable to get current location",
          variant: "destructive"
        })
      }
    )
  }

  // Update form data
  const updateFormData = (field: keyof SupplyChainFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const updateStageData = (stageId: string, data: any) => {
    setFormData(prev => ({
      ...prev,
      stages: {
        ...prev.stages,
        [stageId]: {
          ...prev.stages[stageId],
          ...data
        }
      }
    }))
  }

  const updateStageField = (stageId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      stages: {
        ...prev.stages,
        [stageId]: {
          ...prev.stages[stageId],
          data: {
            ...prev.stages[stageId].data,
            [field]: value
          }
        }
      }
    }))
  }

  // Navigation
  const goToNextStage = () => {
    if (currentStageIndex < stages.length - 1) {
      setCurrentStageIndex(prev => prev + 1)
    }
  }

  const goToPreviousStage = () => {
    if (currentStageIndex > 0) {
      setCurrentStageIndex(prev => prev - 1)
    }
  }

  const goToStage = (index: number) => {
    setCurrentStageIndex(index)
  }

  // Save draft
  const saveDraft = async () => {
    setIsSaving(true)
    try {
      if (onSaveDraft) {
        await onSaveDraft(formData)
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
        await onSubmit(formData)
      }
      toast({
        title: "Supply Chain Record Created!",
        description: "Product traceability record has been submitted successfully.",
      })
      onClose?.()
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

  // Validation
  const isCurrentStageValid = () => {
    const stageData = formData.stages[currentStage.id]
    return (
      stageData.location &&
      stageData.responsible &&
      stageData.startDate
    )
  }

  const isBasicInfoComplete = () => {
    return (
      formData.productId &&
      formData.species.scientificName &&
      formData.species.commonName &&
      formData.estimatedQuantity > 0
    )
  }

  // Render stage-specific fields
  const renderStageFields = () => {
    const stageData = formData.stages[currentStage.id]
    
    return (
      <div className="space-y-6">
        {/* Common stage fields */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Stage Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={stageData.startDate || ''}
                  onChange={(e) => updateStageData(currentStage.id, { startDate: e.target.value })}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="completedDate">Completed Date</Label>
                <Input
                  id="completedDate"
                  type="date"
                  value={stageData.completedDate || ''}
                  onChange={(e) => updateStageData(currentStage.id, { completedDate: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location *</Label>
                <div className="flex gap-2">
                  <Input
                    id="location"
                    placeholder="Enter location or coordinates"
                    value={stageData.location || ''}
                    onChange={(e) => updateStageData(currentStage.id, { location: e.target.value })}
                    className="mt-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    className="mt-1 gap-2"
                  >
                    <Navigation className="h-4 w-4" />
                    GPS
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="responsible">Responsible Person *</Label>
                <Input
                  id="responsible"
                  placeholder="Name of responsible person"
                  value={stageData.responsible || ''}
                  onChange={(e) => updateStageData(currentStage.id, { responsible: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stage-specific fields */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{currentStage.name} Details</CardTitle>
            <CardDescription>{currentStage.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {currentStage.id === 'hatchery' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="broodstock">Broodstock Source</Label>
                  <Input
                    id="broodstock"
                    placeholder="Origin of breeding stock"
                    value={stageData.data.broodstock || ''}
                    onChange={(e) => updateStageField(currentStage.id, 'broodstock', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="larvaeCount">Larvae Count</Label>
                  <Input
                    id="larvaeCount"
                    type="number"
                    placeholder="Number of larvae"
                    value={stageData.data.larvaeCount || ''}
                    onChange={(e) => updateStageField(currentStage.id, 'larvaeCount', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="fertilizationRate">Fertilization Rate (%)</Label>
                  <Input
                    id="fertilizationRate"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Success rate"
                    value={stageData.data.fertilizationRate || ''}
                    onChange={(e) => updateStageField(currentStage.id, 'fertilizationRate', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="feedType">Feed Type</Label>
                  <Select
                    value={stageData.data.feedType || ''}
                    onValueChange={(value) => updateStageField(currentStage.id, 'feedType', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select feed type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="algae">Algae</SelectItem>
                      <SelectItem value="micro-algae">Micro-algae</SelectItem>
                      <SelectItem value="artificial">Artificial Feed</SelectItem>
                      <SelectItem value="mixed">Mixed Diet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {currentStage.id === 'growout' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stockingDensity">Stocking Density</Label>
                  <Input
                    id="stockingDensity"
                    placeholder="Number per m²"
                    value={stageData.data.stockingDensity || ''}
                    onChange={(e) => updateStageField(currentStage.id, 'stockingDensity', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="growthRate">Growth Rate</Label>
                  <Input
                    id="growthRate"
                    placeholder="mm/month or g/month"
                    value={stageData.data.growthRate || ''}
                    onChange={(e) => updateStageField(currentStage.id, 'growthRate', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="mortality">Mortality Rate (%)</Label>
                  <Input
                    id="mortality"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Mortality percentage"
                    value={stageData.data.mortality || ''}
                    onChange={(e) => updateStageField(currentStage.id, 'mortality', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="feedSchedule">Feed Schedule</Label>
                  <Select
                    value={stageData.data.feedSchedule || ''}
                    onValueChange={(value) => updateStageField(currentStage.id, 'feedSchedule', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Feeding frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="twice-daily">Twice Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="natural">Natural Feeding Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {currentStage.id === 'harvest' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="harvestMethod">Harvest Method</Label>
                  <Select
                    value={stageData.data.harvestMethod || ''}
                    onValueChange={(value) => updateStageField(currentStage.id, 'harvestMethod', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Method used" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hand-picking">Hand Picking</SelectItem>
                      <SelectItem value="dredging">Dredging</SelectItem>
                      <SelectItem value="diving">Diving Collection</SelectItem>
                      <SelectItem value="mechanical">Mechanical Harvest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quantity">Harvest Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="Amount harvested"
                    value={stageData.data.quantity || ''}
                    onChange={(e) => updateStageField(currentStage.id, 'quantity', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="size">Average Size</Label>
                  <Input
                    id="size"
                    placeholder="Size range (mm)"
                    value={stageData.data.size || ''}
                    onChange={(e) => updateStageField(currentStage.id, 'size', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="quality">Quality Grade</Label>
                  <Select
                    value={stageData.data.quality || ''}
                    onValueChange={(value) => updateStageField(currentStage.id, 'quality', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Quality assessment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="grade-a">Grade A</SelectItem>
                      <SelectItem value="grade-b">Grade B</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {currentStage.id === 'fishing' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vessel">Vessel Information</Label>
                  <Input
                    id="vessel"
                    placeholder="Vessel name and registration"
                    value={stageData.data.vessel || ''}
                    onChange={(e) => updateStageField(currentStage.id, 'vessel', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="method">Fishing Method</Label>
                  <Select
                    value={stageData.data.method || ''}
                    onValueChange={(value) => updateStageField(currentStage.id, 'method', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Capture method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trawling">Trawling</SelectItem>
                      <SelectItem value="diving">Diving</SelectItem>
                      <SelectItem value="hand-collection">Hand Collection</SelectItem>
                      <SelectItem value="traps">Trap Fishing</SelectItem>
                      <SelectItem value="dredging">Dredging</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="catchQuantity">Catch Quantity</Label>
                  <Input
                    id="catchQuantity"
                    type="number"
                    placeholder="Amount caught"
                    value={stageData.data.catchQuantity || ''}
                    onChange={(e) => updateStageField(currentStage.id, 'catchQuantity', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="waterDepth">Water Depth (m)</Label>
                  <Input
                    id="waterDepth"
                    type="number"
                    placeholder="Fishing depth"
                    value={stageData.data.waterDepth || ''}
                    onChange={(e) => updateStageField(currentStage.id, 'waterDepth', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {currentStage.id === 'processing' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="processingFacility">Processing Facility</Label>
                  <Input
                    id="processingFacility"
                    placeholder="Facility name and location"
                    value={stageData.data.processingFacility || ''}
                    onChange={(e) => updateStageField(currentStage.id, 'processingFacility', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="processMethod">Process Method</Label>
                  <Select
                    value={stageData.data.processMethod || ''}
                    onValueChange={(value) => updateStageField(currentStage.id, 'processMethod', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Processing type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fresh">Fresh (Live)</SelectItem>
                      <SelectItem value="cleaned">Cleaned</SelectItem>
                      <SelectItem value="shucked">Shucked</SelectItem>
                      <SelectItem value="frozen">Frozen</SelectItem>
                      <SelectItem value="canned">Canned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="packagingType">Packaging Type</Label>
                  <Input
                    id="packagingType"
                    placeholder="Packaging description"
                    value={stageData.data.packagingType || ''}
                    onChange={(e) => updateStageField(currentStage.id, 'packagingType', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="temperature">Storage Temperature (°C)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    placeholder="Storage temp"
                    value={stageData.data.temperature || ''}
                    onChange={(e) => updateStageField(currentStage.id, 'temperature', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {currentStage.id === 'distribution' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="transportMethod">Transport Method</Label>
                  <Select
                    value={stageData.data.transportMethod || ''}
                    onValueChange={(value) => updateStageField(currentStage.id, 'transportMethod', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Transport type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="refrigerated-truck">Refrigerated Truck</SelectItem>
                      <SelectItem value="air-freight">Air Freight</SelectItem>
                      <SelectItem value="sea-freight">Sea Freight</SelectItem>
                      <SelectItem value="local-delivery">Local Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="temperature">Transport Temperature (°C)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    placeholder="Temperature during transport"
                    value={stageData.data.temperature || ''}
                    onChange={(e) => updateStageField(currentStage.id, 'temperature', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="destinations">Destinations</Label>
                  <Input
                    id="destinations"
                    placeholder="Delivery locations"
                    value={stageData.data.destinations || ''}
                    onChange={(e) => updateStageField(currentStage.id, 'destinations', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="deliveryDate">Expected Delivery</Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    value={stageData.data.deliveryDate || ''}
                    onChange={(e) => updateStageField(currentStage.id, 'deliveryDate', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {currentStage.id === 'retail' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="retailOutlet">Retail Outlet</Label>
                  <Input
                    id="retailOutlet"
                    placeholder="Store or market name"
                    value={stageData.data.retailOutlet || ''}
                    onChange={(e) => updateStageField(currentStage.id, 'retailOutlet', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="displayMethod">Display Method</Label>
                  <Select
                    value={stageData.data.displayMethod || ''}
                    onValueChange={(value) => updateStageField(currentStage.id, 'displayMethod', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="How products are displayed" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fresh-counter">Fresh Counter</SelectItem>
                      <SelectItem value="frozen-section">Frozen Section</SelectItem>
                      <SelectItem value="live-tanks">Live Tanks</SelectItem>
                      <SelectItem value="packaged-shelf">Packaged Shelf</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="pricePoint">Price per Unit</Label>
                  <Input
                    id="pricePoint"
                    placeholder="Selling price"
                    value={stageData.data.pricePoint || ''}
                    onChange={(e) => updateStageField(currentStage.id, 'pricePoint', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="soldDate">Sold Date</Label>
                  <Input
                    id="soldDate"
                    type="date"
                    value={stageData.data.soldDate || ''}
                    onChange={(e) => updateStageField(currentStage.id, 'soldDate', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Any additional information, observations, or notes for this stage..."
              value={stageData.notes || ''}
              onChange={(e) => updateStageData(currentStage.id, { notes: e.target.value })}
              rows={3}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={onBack} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {mode === 'edit' ? 'Update Supply Chain Record' : 'New Supply Chain Record'}
                </h1>
                <p className="text-gray-600">
                  {sourceType === 'FARMED' ? 'Farmed Aquaculture' : 'Wild-capture Fisheries'} - Stage {currentStageIndex + 1} of {stages.length}: {currentStage.name}
                </p>
              </div>
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
            </div>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Stage indicators */}
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {stages.map((stage, index) => {
              const isActive = index === currentStageIndex
              const isCompleted = index < currentStageIndex
              const Icon = stage.icon
              
              return (
                <div
                  key={stage.id}
                  className="flex items-center cursor-pointer"
                  onClick={() => goToStage(index)}
                >
                  <div
                    className={`
                      flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 flex-shrink-0
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
                  <div className="ml-2 mr-4 hidden md:block">
                    <p className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-700'}`}>
                      {stage.name}
                    </p>
                  </div>
                  {index < stages.length - 1 && (
                    <div 
                      className={`
                        w-8 h-0.5 mx-2 transition-all duration-200 flex-shrink-0
                        ${isCompleted ? 'bg-green-600' : 'bg-gray-300'}
                      `}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Basic Product Info (first time only) */}
        {currentStageIndex === 0 && !isBasicInfoComplete() && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Information
              </CardTitle>
              <CardDescription>Basic information about the product being tracked</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="productId">Product ID *</Label>
                  <Input
                    id="productId"
                    placeholder="e.g., SC-2025-001"
                    value={formData.productId}
                    onChange={(e) => updateFormData('productId', e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="batchId">Batch ID</Label>
                  <Input
                    id="batchId"
                    placeholder="e.g., BATCH-001"
                    value={formData.batchId}
                    onChange={(e) => updateFormData('batchId', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="scientificName">Scientific Name *</Label>
                  <Input
                    id="scientificName"
                    placeholder="e.g., Crassostrea gasar"
                    value={formData.species.scientificName}
                    onChange={(e) => updateFormData('species', { ...formData.species, scientificName: e.target.value })}
                    className="mt-1 italic"
                  />
                </div>
                
                <div>
                  <Label htmlFor="commonName">Common Name *</Label>
                  <Input
                    id="commonName"
                    placeholder="e.g., West African Oyster"
                    value={formData.species.commonName}
                    onChange={(e) => updateFormData('species', { ...formData.species, commonName: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="estimatedQuantity">Estimated Quantity *</Label>
                  <Input
                    id="estimatedQuantity"
                    type="number"
                    placeholder="Amount"
                    value={formData.estimatedQuantity}
                    onChange={(e) => updateFormData('estimatedQuantity', parseFloat(e.target.value))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="unit">Unit *</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => updateFormData('unit', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilograms (kg)</SelectItem>
                      <SelectItem value="pieces">Pieces</SelectItem>
                      <SelectItem value="tonnes">Tonnes</SelectItem>
                      <SelectItem value="liters">Liters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Stage Content */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <currentStage.icon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">{currentStage.name} Stage</CardTitle>
                <CardDescription>{currentStage.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {renderStageFields()}
          </CardContent>
        </Card>

        {/* Validation Summary */}
        <Card className="border-orange-200 bg-orange-50 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-900 mb-1">Stage Requirements</h4>
                <p className="text-sm text-orange-700 mb-2">
                  Complete the following to continue:
                </p>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li className="flex items-center gap-2">
                    {formData.productId ? '✅' : '❌'} Product ID
                  </li>
                  <li className="flex items-center gap-2">
                    {formData.species.scientificName ? '✅' : '❌'} Scientific Name
                  </li>
                  <li className="flex items-center gap-2">
                    {formData.species.commonName ? '✅' : '❌'} Common Name
                  </li>
                  <li className="flex items-center gap-2">
                    {formData.stages[currentStage.id]?.location ? '✅' : '❌'} Location
                  </li>
                  <li className="flex items-center gap-2">
                    {formData.stages[currentStage.id]?.responsible ? '✅' : '❌'} Responsible Person
                  </li>
                  <li className="flex items-center gap-2">
                    {formData.stages[currentStage.id]?.startDate ? '✅' : '❌'} Start Date
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={goToPreviousStage}
            disabled={currentStageIndex === 0}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous Stage
          </Button>

          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              Stage {currentStageIndex + 1} of {stages.length}
            </Badge>
          </div>

          {currentStageIndex === stages.length - 1 ? (
            <Button
              onClick={submitForm}
              disabled={isSubmitting || !isBasicInfoComplete() || !isCurrentStageValid()}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Complete Record
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={goToNextStage}
              disabled={!isBasicInfoComplete() || !isCurrentStageValid()}
              className="gap-2"
            >
              Next Stage
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}