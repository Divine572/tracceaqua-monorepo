'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  MapPin, 
  Calendar, 
  User, 
  Package, 
  Truck, 
  Store, 
  Factory, 
  Fish, 
  Waves, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Eye,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  QrCode,
  Shield
} from 'lucide-react'

export type SourceType = 'FARMED' | 'WILD_CAPTURE'
export type StageStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'

interface StageData {
  id: string
  name: string
  status: StageStatus
  startedAt?: string
  completedAt?: string
  location?: string
  responsible?: string
  data?: Record<string, any>
  photos?: string[]
  documents?: string[]
  notes?: string
  description?: string
}

interface ProductJourneyData {
  productId: string
  batchId?: string
  sourceType: SourceType
  species: {
    scientificName: string
    commonName: string
  }
  quantity: number
  unit: string
  origin: {
    location: string
    coordinates?: string
    facility?: string
  }
  stages: StageData[]
  currentStage: string
  creator: {
    name: string
    organization?: string
  }
  qrCodeGenerated: boolean
  blockchainRecorded: boolean
  createdAt: string
  updatedAt: string
}

interface ProductJourneyVisualizationProps {
  data: ProductJourneyData
  mode?: 'full' | 'consumer' | 'compact'
  showTimeline?: boolean
  showDetails?: boolean
  onStageClick?: (stageId: string) => void
}

const stageIcons = {
  'hatchery': Factory,
  'growout': Fish,
  'harvest': Waves,
  'fishing': MapPin,
  'processing': Factory,
  'distribution': Truck,
  'retail': Store,
} as const

const stageColors = {
  'COMPLETED': 'bg-green-600 text-white border-green-600',
  'IN_PROGRESS': 'bg-blue-600 text-white border-blue-600',
  'PENDING': 'bg-gray-400 text-white border-gray-400',
} as const

export default function ProductJourneyVisualization({
  data,
  mode = 'full',
  showTimeline = true,
  showDetails = true,
  onStageClick
}: ProductJourneyVisualizationProps) {
  const [selectedStage, setSelectedStage] = useState<StageData | null>(null)

  // Calculate progress
  const completedStages = data.stages.filter(stage => stage.status === 'COMPLETED').length
  const totalStages = data.stages.length
  const progressPercentage = totalStages > 0 ? (completedStages / totalStages) * 100 : 0

  // Get current stage index
  const currentStageIndex = data.stages.findIndex(stage => stage.name === data.currentStage)

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get stage icon
  const getStageIcon = (stageId: string) => {
    const iconKey = stageId.toLowerCase() as keyof typeof stageIcons
    return stageIcons[iconKey] || Package
  }

  // Handle stage click
  const handleStageClick = (stage: StageData) => {
    if (onStageClick) {
      onStageClick(stage.id)
    } else {
      setSelectedStage(stage)
    }
  }

  // Render compact view for mobile or embedded use
  if (mode === 'compact') {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-semibold text-gray-900">{data.productId}</h4>
              <p className="text-sm text-gray-600">{data.species.commonName}</p>
            </div>
            <Badge variant="outline" className="gap-1">
              {data.sourceType === 'FARMED' ? <Fish className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
              {data.sourceType === 'FARMED' ? 'Farmed' : 'Wild-capture'}
            </Badge>
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{completedStages}/{totalStages} stages</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-gray-700">Current Stage:</span>
            <Badge variant="secondary">{data.currentStage}</Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{data.productId}</CardTitle>
              <CardDescription className="text-base">
                {data.species.commonName} ({data.species.scientificName})
              </CardDescription>
              {data.batchId && (
                <p className="text-sm text-gray-600 mt-1">Batch ID: {data.batchId}</p>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <Badge variant="outline" className="gap-1">
                {data.sourceType === 'FARMED' ? <Fish className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                {data.sourceType === 'FARMED' ? 'Farmed Aquaculture' : 'Wild-capture'}
              </Badge>
              
              <div className="flex gap-2">
                {data.qrCodeGenerated && (
                  <Badge variant="secondary" className="gap-1">
                    <QrCode className="h-3 w-3" />
                    QR Code
                  </Badge>
                )}
                {data.blockchainRecorded && (
                  <Badge variant="secondary" className="gap-1">
                    <Shield className="h-3 w-3" />
                    Blockchain
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Product Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Quantity</p>
              <p className="text-lg">{data.quantity} {data.unit}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700">Origin</p>
              <p className="text-sm">{data.origin.location}</p>
              {data.origin.facility && (
                <p className="text-xs text-gray-500">{data.origin.facility}</p>
              )}
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700">Progress</p>
              <div className="flex items-center gap-2">
                <Progress value={progressPercentage} className="h-2 flex-1" />
                <span className="text-sm font-medium">{Math.round(progressPercentage)}%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{completedStages} of {totalStages} stages</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700">Current Stage</p>
              <Badge variant="outline" className="mt-1">{data.currentStage}</Badge>
            </div>
          </div>

          {/* Creator Info */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>Created by {data.creator.name}</span>
              {data.creator.organization && <span>• {data.creator.organization}</span>}
              <span>• {formatDate(data.createdAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      {showTimeline && (
        <Card>
          <CardHeader>
            <CardTitle>Product Journey Timeline</CardTitle>
            <CardDescription>
              Track the product through each stage of the supply chain
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {data.stages.map((stage, index) => {
              const StageIcon = getStageIcon(stage.id)
              const isActive = index === currentStageIndex
              const isCompleted = stage.status === 'COMPLETED'
              const isInProgress = stage.status === 'IN_PROGRESS'
              const isPending = stage.status === 'PENDING'

              return (
                <div key={stage.id} className="relative">
                  {/* Connection line */}
                  {index < data.stages.length - 1 && (
                    <div className={`absolute left-6 top-12 bottom-0 w-0.5 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-300'
                    }`} />
                  )}

                  {/* Stage content */}
                  <div 
                    className={`flex items-start gap-4 p-4 rounded-lg border transition-all duration-200 ${
                      isActive ? 'border-blue-300 bg-blue-50' : 
                      isCompleted ? 'border-green-200 bg-green-50' :
                      'border-gray-200 hover:border-gray-300'
                    } ${onStageClick || stage.photos?.length || stage.documents?.length ? 'cursor-pointer' : ''}`}
                    onClick={() => handleStageClick(stage)}
                  >
                    {/* Stage icon */}
                    <div className={`
                      flex items-center justify-center w-12 h-12 rounded-full border-2 flex-shrink-0
                      ${stageColors[stage.status]}
                    `}>
                      <StageIcon className="h-6 w-6" />
                    </div>

                    {/* Stage info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className={`font-semibold ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                            {stage.name}
                          </h4>
                          {stage.description && (
                            <p className="text-sm text-gray-600 mt-1">{stage.description}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          {stage.photos && stage.photos.length > 0 && (
                            <Badge variant="outline" className="gap-1">
                              <ImageIcon className="h-3 w-3" />
                              {stage.photos.length}
                            </Badge>
                          )}
                          
                          {stage.documents && stage.documents.length > 0 && (
                            <Badge variant="outline" className="gap-1">
                              <FileText className="h-3 w-3" />
                              {stage.documents.length}
                            </Badge>
                          )}

                          <Badge 
                            variant={isCompleted ? 'default' : isInProgress ? 'secondary' : 'outline'}
                            className="gap-1"
                          >
                            {isCompleted && <CheckCircle className="h-3 w-3" />}
                            {isInProgress && <Clock className="h-3 w-3" />}
                            {isPending && <AlertCircle className="h-3 w-3" />}
                            {stage.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>

                      {/* Stage details */}
                      {showDetails && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          {stage.location && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{stage.location}</span>
                            </div>
                          )}
                          
                          {stage.responsible && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <User className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{stage.responsible}</span>
                            </div>
                          )}
                          
                          {(stage.startedAt || stage.completedAt) && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">
                                {stage.completedAt 
                                  ? `Completed: ${formatDate(stage.completedAt)}`
                                  : stage.startedAt
                                  ? `Started: ${formatDate(stage.startedAt)}`
                                  : 'Pending'
                                }
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Stage notes */}
                      {stage.notes && showDetails && (
                        <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
                          <strong>Notes:</strong> {stage.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Stage Detail Modal */}
      {selectedStage && (
        <Dialog open={!!selectedStage} onOpenChange={() => setSelectedStage(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {React.createElement(getStageIcon(selectedStage.id), { className: "h-5 w-5" })}
                {selectedStage.name} Details
              </DialogTitle>
              <DialogDescription>
                Detailed information for this stage of the supply chain
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Status and timing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Status Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <Badge variant={selectedStage.status === 'COMPLETED' ? 'default' : 'secondary'}>
                        {selectedStage.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    {selectedStage.startedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Started:</span>
                        <span className="text-sm">{formatDate(selectedStage.startedAt)}</span>
                      </div>
                    )}
                    
                    {selectedStage.completedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Completed:</span>
                        <span className="text-sm">{formatDate(selectedStage.completedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Location & Responsibility</h4>
                  <div className="space-y-2">
                    {selectedStage.location && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{selectedStage.location}</span>
                      </div>
                    )}
                    
                    {selectedStage.responsible && (
                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{selectedStage.responsible}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stage-specific data */}
              {selectedStage.data && Object.keys(selectedStage.data).length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Stage Data</h4>
                  <div className="bg-gray-50 p-3 rounded space-y-2">
                    {Object.entries(selectedStage.data).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                        <span className="text-sm font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Files */}
              {((selectedStage.photos && selectedStage.photos.length > 0) || 
                (selectedStage.documents && selectedStage.documents.length > 0)) && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Attached Files</h4>
                  <div className="space-y-2">
                    {selectedStage.photos && selectedStage.photos.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Photos ({selectedStage.photos.length})</p>
                        <div className="flex gap-2">
                          {selectedStage.photos.slice(0, 3).map((photo, index) => (
                            <div key={index} className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-gray-500" />
                            </div>
                          ))}
                          {selectedStage.photos.length > 3 && (
                            <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">
                              +{selectedStage.photos.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {selectedStage.documents && selectedStage.documents.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Documents ({selectedStage.documents.length})</p>
                        <div className="flex gap-2">
                          {selectedStage.documents.slice(0, 3).map((doc, index) => (
                            <Button key={index} variant="outline" size="sm" className="gap-1">
                              <FileText className="h-3 w-3" />
                              Doc {index + 1}
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedStage.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm text-gray-700">
                    {selectedStage.notes}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}