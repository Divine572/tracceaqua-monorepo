'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Thermometer,
  Users,
  Truck,
  Package,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Share2,
  Download
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'

interface TraceRecord {
  stage: string
  location: string
  timestamp: string
  actor: string
  temperature?: string
  notes?: string
  documents?: string[]
  status: 'completed' | 'in_progress' | 'pending'
}

interface ProductTrace {
  productId: string
  productName: string
  batchNumber: string
  currentStatus: 'fresh' | 'expired' | 'recalled'
  harvestDate: string
  expiryDate: string
  origin: {
    farm: string
    location: string
    coordinates: { lat: number; lng: number }
  }
  currentLocation: string
  qualityScore: number
  certifications: string[]
  journey: TraceRecord[]
}

export default function TracePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [productTrace, setProductTrace] = useState<ProductTrace | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simulate API call to fetch product trace
    const fetchProductTrace = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Mock data based on product ID
        const mockTrace: ProductTrace = {
          productId: params.id,
          productName: 'Fresh Atlantic Salmon',
          batchNumber: 'LAG-2024-0156',
          currentStatus: 'fresh',
          harvestDate: '2024-08-10T06:00:00Z',
          expiryDate: '2024-08-17T23:59:59Z',
          origin: {
            farm: 'Lagos Fish Farm',
            location: 'Lagos State, Nigeria',
            coordinates: { lat: 6.5244, lng: 3.3792 }
          },
          currentLocation: 'Fresh Market Lagos, Victoria Island',
          qualityScore: 94,
          certifications: ['MSC Certified', 'Organic', 'Sustainable Fishing'],
          journey: [
            {
              stage: 'Harvest',
              location: 'Lagos Fish Farm, Lagos State',
              timestamp: '2024-08-10T06:00:00Z',
              actor: 'John Fisherman (Fisherman)',
              temperature: '2°C',
              notes: 'Fresh harvest from sustainable aquaculture. Water quality excellent.',
              status: 'completed'
            },
            {
              stage: 'Quality Control',
              location: 'Lagos Fish Farm Processing Center',
              timestamp: '2024-08-10T08:30:00Z',
              actor: 'Dr. Sarah Johnson (Quality Inspector)',
              temperature: '1°C',
              notes: 'Passed all quality checks. No parasites detected. Premium grade.',
              documents: ['quality-report-LAG-2024-0156.pdf'],
              status: 'completed'
            },
            {
              stage: 'Processing',
              location: 'Lagos Central Processing Facility',
              timestamp: '2024-08-10T14:00:00Z',
              actor: 'Lagos Seafood Processing Ltd.',
              temperature: '0°C',
              notes: 'Cleaned, filleted, and packaged. Cold chain maintained.',
              status: 'completed'
            },
            {
              stage: 'Distribution',
              location: 'Cold Storage Warehouse, Ikeja',
              timestamp: '2024-08-11T09:00:00Z',
              actor: 'FreshTrans Logistics',
              temperature: '-1°C',
              notes: 'Loaded for distribution to retail locations.',
              status: 'completed'
            },
            {
              stage: 'Retail',
              location: 'Fresh Market Lagos, Victoria Island',
              timestamp: '2024-08-12T07:00:00Z',
              actor: 'Fresh Market Lagos',
              temperature: '2°C',
              notes: 'Received and displayed in refrigerated section.',
              status: 'completed'
            }
          ]
        }

        setProductTrace(mockTrace)
      } catch (err) {
        setError('Failed to load product trace. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProductTrace()
  }, [params.id])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fresh':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'recalled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStageIcon = (stage: string) => {
    switch (stage.toLowerCase()) {
      case 'harvest':
        return '🎣'
      case 'quality control':
        return '🔬'
      case 'processing':
        return '🏭'
      case 'distribution':
        return '🚛'
      case 'retail':
        return '🏪'
      default:
        return '📦'
    }
  }

  const getStageStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'in_progress':
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-gray-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">Product Traceability</h1>
        </div>
        
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product trace...</p>
        </div>
      </div>
    )
  }

  if (error || !productTrace) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">Product Traceability</h1>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error || 'Product not found. Please check the product ID and try again.'}
              </AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
              <Button onClick={() => router.push('/dashboard/scan')}>
                Try Another Product
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Product Traceability</h1>
            <p className="text-gray-600">Complete journey from source to shelf</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Product Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{productTrace.productName}</CardTitle>
              <CardDescription className="mt-1">
                Batch: {productTrace.batchNumber} • ID: {productTrace.productId}
              </CardDescription>
            </div>
            <Badge variant="outline" className={getStatusColor(productTrace.currentStatus)}>
              {productTrace.currentStatus.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Origin</p>
                <p className="text-sm text-gray-600">{productTrace.origin.farm}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Harvest Date</p>
                <p className="text-sm text-gray-600">
                  {new Date(productTrace.harvestDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Current Location</p>
                <p className="text-sm text-gray-600">{productTrace.currentLocation}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Quality Score</p>
                <p className="text-sm text-green-600 font-semibold">{productTrace.qualityScore}%</p>
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium mb-2">Certifications</p>
            <div className="flex flex-wrap gap-2">
              {productTrace.certifications.map((cert, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {cert}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supply Chain Journey */}
      <Card>
        <CardHeader>
          <CardTitle>Supply Chain Journey</CardTitle>
          <CardDescription>
            Complete traceability from harvest to current location
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {productTrace.journey.map((record, index) => (
              <div key={index} className="relative">
                {/* Timeline line */}
                {index < productTrace.journey.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                )}
                
                <div className="flex gap-4">
                  {/* Stage Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-lg">
                      {getStageIcon(record.stage)}
                    </div>
                  </div>
                  
                  {/* Stage Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{record.stage}</h3>
                        {getStageStatusIcon(record.status)}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDistanceToNow(new Date(record.timestamp))} ago
                      </div>
                    </div>
                    
                    <div className="grid gap-2 sm:grid-cols-2 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{record.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{record.actor}</span>
                      </div>
                      {record.temperature && (
                        <div className="flex items-center gap-1">
                          <Thermometer className="w-3 h-3" />
                          <span>Temperature: {record.temperature}</span>
                        </div>
                      )}
                    </div>
                    
                    {record.notes && (
                      <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                        {record.notes}
                      </p>
                    )}
                    
                    {record.documents && record.documents.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-500 mb-1">Documents:</p>
                        <div className="flex gap-2">
                          {record.documents.map((doc, docIndex) => (
                            <Button key={docIndex} variant="outline" size="sm" className="text-xs h-7">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              {doc}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quality & Sustainability */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quality Assurance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Overall Quality</span>
                <span className="font-semibold text-green-600">{productTrace.qualityScore}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${productTrace.qualityScore}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500">
                Based on temperature control, handling, and inspection results
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sustainability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Carbon Footprint</span>
                <span className="font-semibold text-blue-600">Low</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Fishing Method</span>
                <span className="font-semibold">Sustainable</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Traceability</span>
                <span className="font-semibold text-green-600">100%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}