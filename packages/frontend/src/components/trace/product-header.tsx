"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Fish, 
  MapPin, 
  Calendar,
  Share2,
  Heart,
  Building,
  Award,
  Waves
} from 'lucide-react'
import { format } from 'date-fns'

interface ProductHeaderProps {
  productData: {
    productId: string
    productName: string
    speciesName: string
    sourceType: 'FARMED' | 'WILD_CAPTURE'
    qualityGrade?: string
    status: string
    createdAt: string
    creator: {
      organization?: string
      role: string
    }
  }
  onShare?: () => void
  onToggleFavorite?: () => void
  isFavorited?: boolean
}

export function ProductHeader({ 
  productData, 
  onShare, 
  onToggleFavorite,
  isFavorited = false 
}: ProductHeaderProps) {
  return (
    <Card className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1">
            {/* Product name and species */}
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Fish className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {productData.productName}
                </h1>
                <p className="text-xl text-blue-100 mb-3">
                  <em>{productData.speciesName}</em>
                </p>
                
                {/* Source type and quality badges */}
                <div className="flex items-center gap-3 mb-4">
                  <Badge 
                    variant="secondary" 
                    className="bg-white/20 text-white border-white/30 text-sm"
                  >
                    {productData.sourceType === 'FARMED' ? (
                      <>
                        <Building className="h-3 w-3 mr-1" />
                        Aquaculture
                      </>
                    ) : (
                      <>
                        <Waves className="h-3 w-3 mr-1" />
                        Wild Capture
                      </>
                    )}
                  </Badge>
                  
                  {productData.qualityGrade && (
                    <Badge 
                      variant="secondary"
                      className="bg-amber-500/20 text-amber-100 border-amber-300/30"
                    >
                      <Award className="h-3 w-3 mr-1" />
                      {productData.qualityGrade} Grade
                    </Badge>
                  )}
                  
                  <Badge 
                    variant="secondary"
                    className={`${
                      productData.status === 'ACTIVE' 
                        ? 'bg-green-500/20 text-green-100 border-green-300/30' 
                        : 'bg-gray-500/20 text-gray-100 border-gray-300/30'
                    }`}
                  >
                    {productData.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Product details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-200" />
                <div>
                  <p className="text-blue-200">Journey Started</p>
                  <p className="font-medium">
                    {format(new Date(productData.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-200" />
                <div>
                  <p className="text-blue-200">Source</p>
                  <p className="font-medium">
                    {productData.creator.organization || productData.creator.role}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Fish className="h-4 w-4 text-blue-200" />
                <div>
                  <p className="text-blue-200">Product ID</p>
                  <p className="font-mono font-medium text-xs">
                    {productData.productId}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="lg"
                onClick={onToggleFavorite}
                className={`text-white hover:bg-white/20 ${
                  isFavorited ? 'text-red-300' : ''
                }`}
              >
                <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
              </Button>
            )}
            
            {onShare && (
              <Button
                variant="secondary"
                size="lg"
                onClick={onShare}
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Journey
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
