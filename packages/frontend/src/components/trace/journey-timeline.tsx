"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Fish, 
  MapPin, 
  Calendar, 
  Thermometer,
  Building,
  Truck,
  Store,
  CheckCircle,
  AlertTriangle,
  Clock,
  Eye,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Shield,
  User
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'

interface StageData {
  id: string
  stage: string
  status: 'COMPLETED' | 'ACTIVE' | 'PENDING' | 'FAILED'
  location?: string
  temperature?: number
  humidity?: number
  notes?: string
  images?: string[]
  timestamp: string
  actor: {
    organization?: string
    role: string
  }
  verifications?: {
    type: string
    status: string
    verifiedBy: string
    timestamp: string
  }[]
  qualityChecks?: {
    type: string
    result: string
    value?: number
    unit?: string
  }[]
  duration?: number // hours spent in this stage
}

interface JourneyTimelineProps {
  stages: StageData[]
  className?: string
}

export function JourneyTimeline({ stages, className = "" }: JourneyTimelineProps) {
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set())

  const toggleStageExpansion = (stageId: string) => {
    const newExpanded = new Set(expandedStages)
    if (newExpanded.has(stageId)) {
      newExpanded.delete(stageId)
    } else {
      newExpanded.add(stageId)
    }
    setExpandedStages(newExpanded)
  }

  const getStageIcon = (stage: string) => {
    const icons: Record<string, React.ReactNode> = {
      'HATCHERY': <Fish className="h-5 w-5 text-blue-600" />,
      'GROW_OUT': <Fish className="h-5 w-5 text-green-600" />,
      'FISHING': <Fish className="h-5 w-5 text-blue-800" />,
      'HARVEST': <Fish className="h-5 w-5 text-amber-600" />,
      'PROCESSING': <Building className="h-5 w-5 text-purple-600" />,
      'DISTRIBUTION': <Truck className="h-5 w-5 text-orange-600" />,
      'RETAIL': <Store className="h-5 w-5 text-red-600" />,
    }
    return icons[stage] || <CheckCircle className="h-5 w-5 text-gray-500" />
  }

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      'COMPLETED': <CheckCircle className="h-4 w-4 text-green-600" />,
      'ACTIVE': <Clock className="h-4 w-4 text-blue-600 animate-pulse" />,
      'PENDING': <Clock className="h-4 w-4 text-gray-400" />,
      'FAILED': <AlertTriangle className="h-4 w-4 text-red-600" />,
    }
    return icons[status] || <Clock className="h-4 w-4 text-gray-400" />
  }

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      'COMPLETED': 'bg-green-100 text-green-800 border-green-200',
      'ACTIVE': 'bg-blue-100 text-blue-800 border-blue-200',
      'PENDING': 'bg-gray-100 text-gray-800 border-gray-200',
      'FAILED': 'bg-red-100 text-red-800 border-red-200',
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getStageName = (stage: string) => {
    const names: Record<string, string> = {
      'HATCHERY': 'Hatchery Operations',
      'GROW_OUT': 'Grow-out & Rearing',
      'FISHING': 'Fishing Operations',
      'HARVEST': 'Harvest',
      'PROCESSING': 'Processing & Packaging',
      'DISTRIBUTION': 'Distribution & Transport',
      'RETAIL': 'Retail & Sale',
    }
    return names[stage] || stage.replace('_', ' ')
  }

  const formatDuration = (hours: number) => {
    if (hours < 24) {
      return `${Math.round(hours)} hours`
    } else {
      const days = Math.floor(hours / 24)
      const remainingHours = Math.round(hours % 24)
      return `${days} day${days > 1 ? 's' : ''}${remainingHours > 0 ? ` ${remainingHours}h` : ''}`
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Product Journey Timeline
          </CardTitle>
          <CardDescription>
            Complete journey from source to consumer with verified checkpoints
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-600 via-green-500 to-red-500"></div>

        {stages.map((stage, index) => {
          const isExpanded = expandedStages.has(stage.id)
          const isLast = index === stages.length - 1
          
          return (
            <div key={stage.id} className="relative flex gap-6 pb-8">
              {/* Timeline dot */}
              <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-white border-4 border-current shadow-lg">
                {getStageIcon(stage.stage)}
              </div>

              {/* Stage content */}
              <div className="flex-1 min-w-0">
                <Card className="w-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {getStageName(stage.stage)}
                          </h3>
                          <Badge className={getStatusBadgeColor(stage.status)}>
                            {stage.status.toLowerCase()}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(stage.timestamp), 'MMM d, yyyy HH:mm')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatDistanceToNow(new Date(stage.timestamp), { addSuffix: true })}
                          </span>
                          {stage.duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Duration: {formatDuration(stage.duration)}
                            </span>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStageExpansion(stage.id)}
                        className="ml-2"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {/* Quick info row */}
                    <div className="flex items-center gap-4 pt-2">
                      {stage.location && (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {stage.location}
                        </span>
                      )}
                      
                      {stage.temperature !== undefined && (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Thermometer className="h-4 w-4" />
                          {stage.temperature}°C
                        </span>
                      )}

                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        {stage.actor.organization || stage.actor.role}
                      </span>

                      {stage.verifications && stage.verifications.length > 0 && (
                        <span className="flex items-center gap-1 text-sm text-green-600">
                          <Shield className="h-4 w-4" />
                          Verified
                        </span>
                      )}
                    </div>
                  </CardHeader>

                  {/* Expanded content */}
                  {isExpanded && (
                    <CardContent className="pt-0 space-y-4">
                      {/* Stage notes */}
                      {stage.notes && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Stage Notes</h4>
                          <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                            {stage.notes}
                          </p>
                        </div>
                      )}

                      {/* Environmental conditions */}
                      {(stage.temperature !== undefined || stage.humidity !== undefined) && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Environmental Conditions</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {stage.temperature !== undefined && (
                              <div className="flex items-center gap-2">
                                <Thermometer className="h-4 w-4 text-blue-500" />
                                <span>Temperature: {stage.temperature}°C</span>
                              </div>
                            )}
                            {stage.humidity !== undefined && (
                              <div className="flex items-center gap-2">
                                <span>💧</span>
                                <span>Humidity: {stage.humidity}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Quality checks */}
                      {stage.qualityChecks && stage.qualityChecks.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Quality Checks</h4>
                          <div className="space-y-2">
                            {stage.qualityChecks.map((check, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 bg-green-50 rounded-md">
                                <span className="text-sm font-medium">{check.type}</span>
                                <span className="text-sm text-green-600">
                                  {check.result} {check.value && `(${check.value}${check.unit || ''})`}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Verifications */}
                      {stage.verifications && stage.verifications.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Verifications</h4>
                          <div className="space-y-2">
                            {stage.verifications.map((verification, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 bg-blue-50 rounded-md">
                                <div className="flex items-center gap-2">
                                  <Shield className="h-4 w-4 text-blue-600" />
                                  <span className="text-sm font-medium">{verification.type}</span>
                                </div>
                                <div className="text-right">
                                  <Badge 
                                    variant={verification.status === 'VERIFIED' ? 'default' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {verification.status}
                                  </Badge>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    by {verification.verifiedBy}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Images */}
                      {stage.images && stage.images.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Documentation</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {stage.images.map((image, idx) => (
                              <div key={idx} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                                <ImageIcon className="h-8 w-8 text-gray-400" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actor information */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">Handled By</h4>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                          <User className="h-4 w-4 text-gray-500" />
                          <div>
                            {stage.actor.organization && (
                              <p className="text-sm font-medium">{stage.actor.organization}</p>
                            )}
                            <p className="text-xs text-muted-foreground">{stage.actor.role}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </div>
            </div>
          )
        })}
      </div>

      {/* Journey summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50">
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Journey Complete! 🎉
            </h3>
            <p className="text-muted-foreground">
              This product has been tracked through {stages.length} verified stages
            </p>
            <div className="flex items-center justify-center gap-6 mt-4 text-sm">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                {stages.filter(s => s.status === 'COMPLETED').length} Completed
              </span>
              <span className="flex items-center gap-1">
                <Shield className="h-4 w-4 text-blue-600" />
                {stages.reduce((acc, stage) => acc + (stage.verifications?.length || 0), 0)} Verifications
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4 text-purple-600" />
                100% Transparent
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
