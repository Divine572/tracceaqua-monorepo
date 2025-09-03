"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
    Search,
    Filter,
    QrCode,
    Fish,
    Calendar,
    MapPin,
    TrendingUp,
    Eye,
  ExternalLink,
    Star,
    Clock,
    Building,
    Waves,
    Award
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface TracedProduct {
  productId: string
  productName: string
    speciesName: string
    sourceType: 'FARMED' | 'WILD_CAPTURE'
    qualityGrade?: string
    traceCount: number
    lastTraced: Date
    rating: number
    creator: {
        organization?: string
        role: string
  }
    location?: string
    thumbnail?: string
}

interface TraceStats {
    totalTraces: number
    uniqueProducts: number
    avgRating: number
    topSpecies: string
}

export default function TracePage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState('recent')
    const [tracedProducts, setTracedProducts] = useState<TracedProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
    const [stats, setStats] = useState<TraceStats>({
        totalTraces: 0,
        uniqueProducts: 0,
        avgRating: 0,
        topSpecies: 'Tilapia'
    })
    const router = useRouter()

    // Load traced products data
  useEffect(() => {
      loadTracedProducts()
  }, [])

    const loadTracedProducts = async () => {
      try {
        // In a real app, this would fetch from your API
        // For now, we'll use mock data and local storage
        const mockProducts: TracedProduct[] = [
            {
                productId: 'FISH-2024-001',
          productName: 'Fresh Atlantic Salmon',
              speciesName: 'Salmo salar',
              sourceType: 'FARMED',
              qualityGrade: 'Premium',
              traceCount: 125,
              lastTraced: new Date(Date.now() - 86400000),
              rating: 4.8,
              creator: {
                  organization: 'Norwegian Aquaculture Co.',
                  role: 'FARMER'
          },
              location: 'Norway',
              thumbnail: '/images/salmon.jpg'
          },
          {
            productId: 'FISH-2024-002',
            productName: 'Wild-Caught Tilapia',
            speciesName: 'Oreochromis niloticus',
            sourceType: 'WILD_CAPTURE',
            qualityGrade: 'Grade A',
            traceCount: 89,
            lastTraced: new Date(Date.now() - 172800000),
            rating: 4.6,
            creator: {
                organization: 'Lake Victoria Fishermen Coop',
                role: 'FISHERMAN'
            },
              location: 'Lake Victoria, Uganda',
          },
          {
            productId: 'FISH-2024-003',
            productName: 'Organic Catfish',
            speciesName: 'Clarias gariepinus',
            sourceType: 'FARMED',
            qualityGrade: 'Organic Premium',
            traceCount: 67,
            lastTraced: new Date(Date.now() - 259200000),
            rating: 4.9,
            creator: {
                organization: 'Green Waters Farm',
                role: 'FARMER'
            },
              location: 'Ogun State, Nigeria'
          }
      ]

          setTracedProducts(mockProducts)

          // Calculate stats
          const totalTraces = mockProducts.reduce((sum, p) => sum + p.traceCount, 0)
          const avgRating = mockProducts.reduce((sum, p) => sum + p.rating, 0) / mockProducts.length

          setStats({
              totalTraces,
              uniqueProducts: mockProducts.length,
              avgRating: Number(avgRating.toFixed(1)),
              topSpecies: 'Tilapia'
          })

          setIsLoading(false)
      } catch (error) {
          console.error('Failed to load traced products:', error)
          toast.error('Failed to load traced products')
          setIsLoading(false)
      }
  }

    const filteredProducts = tracedProducts.filter(product =>
        product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.speciesName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.creator.organization?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (activeTab) {
            case 'popular':
                return b.traceCount - a.traceCount
            case 'rating':
                return b.rating - a.rating
            case 'recent':
      default:
            return b.lastTraced.getTime() - a.lastTraced.getTime()
    }
  })

    const renderProductCard = (product: TracedProduct) => (
        <Card
            key={product.productId}
            className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-blue-500"
            onClick={() => router.push(`/trace/${product.productId}`)}
        >
            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    {/* Product Image/Icon */}
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        {product.thumbnail ? (
                            <img
                                src={product.thumbnail}
                                alt={product.productName}
                                className="w-full h-full object-cover rounded-lg"
                            />
                        ) : (
                            <Fish className="h-8 w-8 text-blue-600" />
                        )}
                    </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                          <div>
                              <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                  {product.productName}
                              </h3>
                              <p className="text-sm text-muted-foreground italic mb-2">
                                  {product.speciesName}
                              </p>
                          </div>

                          <div className="flex items-center gap-1 ml-4">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm font-medium">{product.rating}</span>
                          </div>
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" className="text-xs">
                              {product.productId}
                          </Badge>

                          <Badge
                              variant={product.sourceType === 'FARMED' ? 'default' : 'secondary'}
                              className="text-xs"
                          >
                              {product.sourceType === 'FARMED' ? (
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

                          {product.qualityGrade && (
                              <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">
                                  {product.qualityGrade}
                              </Badge>
                          )}
                      </div>

                      {/* Statistics */}
                      <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              <span>{product.traceCount.toLocaleString()} traces</span>
                          </div>

                          <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{product.lastTraced.toLocaleDateString()}</span>
                          </div>

                          <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span className="truncate">{product.location}</span>
                          </div>
                      </div>

                      {/* Source Organization */}
                      <div className="flex items-center justify-between">
                          <div className="text-sm">
                              <span className="text-muted-foreground">Source: </span>
                              <span className="font-medium">
                                  {product.creator.organization || product.creator.role}
                              </span>
                          </div>

                          <Button variant="ghost" size="sm" className="h-8 px-2">
                              <ExternalLink className="h-4 w-4" />
                          </Button>
                      </div>
                  </div>
              </div>
          </CardContent>
      </Card>
  )

    if (isLoading) {
        return (
            <div className="container max-w-6xl mx-auto p-6">
                <div className="space-y-6">
                    {/* Loading skeleton */}
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-20 bg-gray-200 rounded"></div>
                            ))}
            </div>
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
          </div>
      )
  }

    return (
        <div className="container max-w-6xl mx-auto p-6 space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-blue-900">
                      Product Traceability
                  </h1>
                  <p className="text-muted-foreground">
                      Explore traced seafood products and their sustainability journey
                  </p>
              </div>

              <div className="flex gap-2">
                  <Button asChild variant="outline">
                      <a href="/dashboard/scan">
                          <QrCode className="h-4 w-4 mr-2" />
                          Scan QR Code
                      </a>
                  </Button>
              </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                  <CardContent className="p-6 text-center">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <div className="text-2xl font-bold text-blue-600">
                          {stats.totalTraces.toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground">Total Traces</p>
                  </CardContent>
              </Card>

              <Card>
                  <CardContent className="p-6 text-center">
                      <Fish className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <div className="text-2xl font-bold text-green-600">
                          {stats.uniqueProducts}
            </div>
                      <p className="text-sm text-muted-foreground">Unique Products</p>
                  </CardContent>
              </Card>

              <Card>
                  <CardContent className="p-6 text-center">
                      <Star className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                      <div className="text-2xl font-bold text-yellow-600">
                          {stats.avgRating}
                      </div>
                      <p className="text-sm text-muted-foreground">Average Rating</p>
                  </CardContent>
              </Card>

              <Card>
                  <CardContent className="p-6 text-center">
                      <Award className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <div className="text-2xl font-bold text-purple-600">
                          {stats.topSpecies}
                      </div>
                      <p className="text-sm text-muted-foreground">Top Species</p>
                  </CardContent>
              </Card>
          </div>

          {/* Search and Filters */}
          <Card>
              <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                          <Label htmlFor="search" className="sr-only">Search products</Label>
                          <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                  id="search"
                                  placeholder="Search by product name, species, ID, or organization..."
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                  className="pl-10"
                              />
                          </div>
                      </div>

                      <Button variant="outline" className="flex items-center gap-2">
                          <Filter className="h-4 w-4" />
                          Filters
                      </Button>
          </div>
        </CardContent>
      </Card>

          {/* Products List */}
          <Card>
              <CardHeader>
                  <div className="flex items-center justify-between">
                      <div>
                          <CardTitle>Traced Products</CardTitle>
                          <CardDescription>
                              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                          </CardDescription>
                      </div>
                  </div>
              </CardHeader>
              <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="recent" className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Recent
                          </TabsTrigger>
                          <TabsTrigger value="popular" className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4" />
                              Popular
                          </TabsTrigger>
                          <TabsTrigger value="rating" className="flex items-center gap-2">
                              <Star className="h-4 w-4" />
                              Top Rated
                          </TabsTrigger>
                      </TabsList>

                      <TabsContent value={activeTab} className="mt-6">
                          {sortedProducts.length === 0 ? (
                              <div className="text-center py-12">
                                  <Fish className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                  <h3 className="text-lg font-semibold mb-2">No products found</h3>
                                  <p className="text-muted-foreground mb-4">
                                      {searchTerm
                                          ? 'Try adjusting your search terms'
                                          : 'No traced products available yet'
                                      }
                                  </p>
                                  {!searchTerm && (
                                      <Button asChild>
                                          <a href="/dashboard/scan">
                                              <QrCode className="h-4 w-4 mr-2" />
                                              Scan Your First Product
                                          </a>
                                      </Button>
                                  )}
                              </div>
                          ) : (
                              <div className="space-y-4">
                                  {sortedProducts.map(renderProductCard)}
                                  </div>
                          )}
                      </TabsContent>
                  </Tabs>
              </CardContent>
          </Card>

          {/* Call to Action */}
          <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
              <CardContent className="p-8 text-center">
                  <h3 className="text-xl font-semibold text-blue-900 mb-2">
                      Discover More Sustainable Seafood
                  </h3>
                  <p className="text-blue-700 mb-6 max-w-2xl mx-auto">
                      Join thousands of consumers making informed choices. Every scan helps
                      support transparency and sustainability in the seafood industry.
                  </p>
                  <div className="flex gap-4 justify-center">
                      <Button asChild className="bg-blue-600 hover:bg-blue-700">
                          <a href="/dashboard/scan">
                              <QrCode className="h-4 w-4 mr-2" />
                              Scan New Product
                          </a>
                      </Button>
                      <Button variant="outline" asChild>
                          <a href="/dashboard">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Learn More
                          </a>
                      </Button>
                  </div>
              </CardContent>
          </Card>
    </div>
  )
}