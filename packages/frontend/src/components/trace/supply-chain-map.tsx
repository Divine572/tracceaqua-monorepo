"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin,
  ArrowRight,
  Fish,
  Building,
  Truck,
  Store
} from 'lucide-react'

interface StageData {
  id: string
  stage: string
  status: string
  location?: string
  actor: {
    organization?: string
    role: string
  }
}

interface SupplyChainMapProps {
  stages: StageData[]
}

export function SupplyChainMap({ stages }: SupplyChainMapProps) {
  const getStageIcon = (stage: string) => {
    const icons: Record<string, React.ReactNode> = {
      'HATCHERY': <Fish className="h-4 w-4" />,
      'GROW_OUT': <Fish className="h-4 w-4" />,
      'FISHING': <Fish className="h-4 w-4" />,
      'PROCESSING': <Building className="h-4 w-4" />,
      'DISTRIBUTION': <Truck className="h-4 w-4" />,
      'RETAIL': <Store className="h-4 w-4" />,
    }
    return icons[stage] || <MapPin className="h-4 w-4" />
  }

  const getStageColor = (status: string) => {
    const colors: Record<string, string> = {
      'COMPLETED': 'text-green-600 bg-green-100',
      'ACTIVE': 'text-blue-600 bg-blue-100',
      'PENDING': 'text-gray-600 bg-gray-100',
      'FAILED': 'text-red-600 bg-red-100',
    }
    return colors[status] || 'text-gray-600 bg-gray-100'
  }

  return (
    <div className="space-y-4">
      {/* Map visualization placeholder */}
      <div className="aspect-video bg-gradient-to-b from-blue-100 to-green-100 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-300">
        <div className="text-center text-blue-600">
          <MapPin className="h-12 w-12 mx-auto mb-2" />
          <p className="text-sm">Interactive supply chain map</p>
          <p className="text-xs text-muted-foreground mt-1">
            Geographic visualization of product journey
          </p>
        </div>
      </div>

      {/* Stage pathway */}
      <div className="flex flex-wrap items-center gap-2 justify-center">
        {stages.map((stage, index) => (
          <React.Fragment key={stage.id}>
            <div className="flex items-center gap-2 p-3 bg-white rounded-lg shadow-sm border">
              <div className={`p-2 rounded-full ${getStageColor(stage.status)}`}>
                {getStageIcon(stage.stage)}
              </div>
              <div className="text-left">
                <p className="font-medium text-sm">
                  {stage.stage.replace('_', ' ')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stage.location || stage.actor.organization || stage.actor.role}
                </p>
              </div>
            </div>
            
            {index < stages.length - 1 && (
              <ArrowRight className="h-4 w-4 text-gray-400" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}