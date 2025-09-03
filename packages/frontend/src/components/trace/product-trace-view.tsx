"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Fish, 
  MapPin, 
  Calendar, 
  Award, 
  Shield, 
  Thermometer,
  Scale,
  Clock,
  Building,
  Truck,
  Store,
  CheckCircle,
  AlertTriangle,
  Share2,
  Heart,
  Star,
  ExternalLink
} from 'lucide-react'
import { JourneyTimeline } from './journey-timeline'
import { ProductHeader } from './product-header'
import { QualityMetrics } from './quality-metrics'
import { CertificationBadges } from './certification-badges'
import { SupplyChainMap } from './supply-chain-map'

interface ProductTraceData {
  productId: string
  productName: string
  speciesName: string
  sourceType: 'FARMED' | 'WILD_CAPTURE'
  currentStage: string
  qualityGrade?: string
  status: string
  certifications: string[]
  createdAt: string
  creator: {
    id: string
    organization?: string
    role: string
  }
  stages: StageData[]
  qualityTests?: QualityTest[]
  conservationData?: ConservationData
  sustainability?: SustainabilityData
}

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
}

interface QualityTest {
  id: string
  type: string
  result: string
  value?: number
  unit?: string
  passedStandards: boolean
  testedBy: string
  timestamp: string
}

interface ConservationData {
  samplingLocation: string
  environmentalData: {
    waterTemp: number
    salinity: number
    ph: number
    oxygenLevel: number
  }
  speciesHealth: string
  populationStatus: string
}

interface SustainabilityData {
  carbonFootprint: number
  sustainabilityScore: number
  certificationStatus: string
  impactMetrics: {
    waterUsage: number
    energyConsumption: number
    wasteGenerated: number
  }
}

interface ProductTraceViewProps {
  traceData: ProductTraceData
}

export function ProductTraceView({ traceData }: ProductTraceViewProps) {
  const [activeTab, setActiveTab] = useState('journey')
  const [isFavorited, setIsFavorited] = useState(false)
  const [userRating, setUserRating] = useState(0)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Trace ${traceData.productName}`,
          text: `Check out the sustainable journey of this ${traceData.speciesName} from ${traceData.sourceType.toLowerCase().replace('_', ' ')} to plate.`,
          url: window.location.href,
        })
      } catch (error) {
        // User cancelled or share failed
        await navigator.clipboard.writeText(window.location.href)
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
    }
  }

  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited)
    // In a real app, this would update a user favorites list
  }

  const handleRating = (rating: number) => {
    setUserRating(rating)
    // In a real app, this would submit the rating to the backend
  }

  const getStageIcon = (stage: string) => {
    const icons: Record<string, React.ReactNode> = {
      'HATCHERY': <Fish className="h-4 w-4" />,
      'GROW_OUT': <Scale className="h-4 w-4" />,
      'FISHING': <Fish className="h-4 w-4" />,
      'PROCESSING': <Building className="h-4 w-4" />,
      'DISTRIBUTION': <Truck className="h-4 w-4" />,
      'RETAIL': <Store className="h-4 w-4" />,
    }
    return icons[stage] || <CheckCircle className="h-4 w-4" />
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      'ACTIVE': 'default',
      'COMPLETED': 'secondary',
      'FAILED': 'destructive',
      'PENDING': 'secondary'
    }
    
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.toLowerCase().replace('_', ' ')}
      </Badge>
    )
  }

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      {/* Product Header */}
      <ProductHeader 
        productData={traceData}
        onShare={handleShare}
        onToggleFavorite={handleToggleFavorite}
        isFavorited={isFavorited}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <p className="text-sm text-muted-foreground">Journey Time</p>
            <p className="font-semibold">
              {Math.ceil((new Date().getTime() - new Date(traceData.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <p className="text-sm text-muted-foreground">Origin</p>
            <p className="font-semibold">
              {traceData.sourceType === 'FARMED' ? 'Aquaculture' : 'Wild Capture'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <p className="text-sm text-muted-foreground">Certifications</p>
            <p className="font-semibold">{traceData.certifications.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 mx-auto mb-2 text-amber-600" />
            <p className="text-sm text-muted-foreground">Quality Grade</p>
            <p className="font-semibold">{traceData.qualityGrade || 'Premium'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="journey">Journey</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="sustainability">Sustainability</TabsTrigger>
          <TabsTrigger value="certifications">Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="journey" className="space-y-6">
          <JourneyTimeline stages={traceData.stages} />
          
          {/* Supply Chain Visualization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Supply Chain Journey
              </CardTitle>
              <CardDescription>
                Track the path from source to consumer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SupplyChainMap stages={traceData.stages} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          <QualityMetrics 
            tests={traceData.qualityTests || []}
            qualityGrade={traceData.qualityGrade}
          />
          
          {/* Temperature History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="h-5 w-5" />
                Cold Chain Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Temperature chart visualization</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sustainability" className="space-y-6">
          {traceData.sustainability && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Sustainability Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="text-4xl font-bold text-green-600">
                      {traceData.sustainability.sustainabilityScore}/100
                    </div>
                    <p className="text-muted-foreground">
                      This product meets high sustainability standards
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Carbon Footprint</p>
                        <p className="text-lg font-semibold">
                          {traceData.sustainability.carbonFootprint} kg CO₂
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Water Usage</p>
                        <p className="text-lg font-semibold">
                          {traceData.sustainability.impactMetrics.waterUsage} L
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Energy Used</p>
                        <p className="text-lg font-semibold">
                          {traceData.sustainability.impactMetrics.energyConsumption} kWh
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {traceData.conservationData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Fish className="h-5 w-5" />
                      Conservation Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium">Population Status</p>
                        <Badge variant={
                          traceData.conservationData.populationStatus === 'HEALTHY' 
                            ? 'default' : 'secondary'
                        }>
                          {traceData.conservationData.populationStatus}
                        </Badge>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium">Environmental Conditions</p>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                          <div>Water Temp: {traceData.conservationData.environmentalData.waterTemp}°C</div>
                          <div>Salinity: {traceData.conservationData.environmentalData.salinity}‰</div>
                          <div>pH Level: {traceData.conservationData.environmentalData.ph}</div>
                          <div>Oxygen: {traceData.conservationData.environmentalData.oxygenLevel}%</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="certifications" className="space-y-6">
          <CertificationBadges certifications={traceData.certifications} />
        </TabsContent>
      </Tabs>

      {/* Consumer Feedback Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Rate This Product
          </CardTitle>
          <CardDescription>
            Help others make informed choices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRating(star)}
                  className={`p-1 ${
                    star <= userRating 
                      ? 'text-yellow-400' 
                      : 'text-gray-300'
                  }`}
                >
                  <Star className="h-6 w-6 fill-current" />
                </button>
              ))}
            </div>
            {userRating > 0 && (
              <span className="text-sm text-muted-foreground">
                You rated this {userRating} star{userRating > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Support Sustainable Seafood
          </h3>
          <p className="text-blue-700 mb-4">
            By choosing traceable seafood, you're supporting sustainable fishing practices and ocean conservation.
          </p>
          <div className="flex gap-2 justify-center">
            <Button 
              variant="outline" 
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
              asChild
            >
              <a href="/dashboard" target="_blank">
                <ExternalLink className="h-4 w-4 mr-2" />
                Learn More
              </a>
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share This Journey
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
