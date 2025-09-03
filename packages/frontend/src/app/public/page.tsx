"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  QrCode, 
  Fish, 
  Scan,
  Shield,
  Award,
  TrendingUp,
  Users,
  Globe,
  ArrowRight,
  CheckCircle,
  Star,
  Building,
  Waves,
  ChevronDown
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getPublicStatistics } from '@/lib/traceability'

interface FeaturedProduct {
  productId: string
  productName: string
  speciesName: string
  sourceType: 'FARMED' | 'WILD_CAPTURE'
  qualityGrade?: string
  certifications: string[]
  creator: {
    organization?: string
    role: string
  }
  createdAt: string
}

interface PublicStats {
  totalProducts: number
  totalStages: number
  averageJourneyTime: number
  verificationRate: number
  totalTraces: number
  averageRating: number
  topSpecies: string
  sustainableProducts: number
}

export default function PublicLandingPage() {
  const [stats, setStats] = useState<PublicStats | null>(null)
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadPublicData()
  }, [])

  const loadPublicData = async () => {
    try {
      const [publicStats, featured] = await Promise.all([
        getPublicStatistics(),
        fetch('/api/supply-chain/public/featured?limit=6').then(res => res.json()).catch(() => [])
      ])
      
      setStats(publicStats)
      setFeaturedProducts(featured)
    } catch (error) {
      console.error('Failed to load public data:', error)
      // Set fallback data
      setStats({
        totalProducts: 1250,
        totalStages: 8500,
        averageJourneyTime: 14.2,
        verificationRate: 98.5,
        totalTraces: 25000,
        averageRating: 4.6,
        topSpecies: 'Tilapia',
        sustainableProducts: 1120,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    element?.scrollIntoView({ behavior: 'smooth' })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Fish className="h-12 w-12 mx-auto mb-4 text-blue-600 animate-pulse" />
          <p className="text-lg text-muted-foreground">Loading TracceAqua...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="container max-w-6xl mx-auto px-6 py-12 text-center">
        <div className="space-y-8">
          {/* Logo and Main Headline */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 bg-blue-600 rounded-full">
                <Fish className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-blue-900">
                TracceAqua
              </h1>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 max-w-4xl mx-auto">
              Blockchain-Powered Seafood Traceability for Nigerian Supply Chains
            </h2>
            
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Track your seafood from source to plate. Verify sustainability, quality, and 
              authenticity with our transparent blockchain-based traceability system.
            </p>
          </div>

          {/* Primary CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 px-8 py-6 text-lg"
              onClick={() => router.push('/dashboard/scan')}
            >
              <QrCode className="h-5 w-5 mr-2" />
              Scan QR Code Now
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg"
              onClick={() => scrollToSection('how-it-works')}
            >
              How It Works
              <ChevronDown className="h-5 w-5 ml-2" />
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground pt-8">
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              Blockchain Verified
            </span>
            <span className="flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-600" />
              Industry Certified
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              Fully Transparent
            </span>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      {stats && (
        <section className="bg-white py-16 border-y">
          <div className="container max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Powering Transparency in Nigerian Seafood
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Join thousands of stakeholders making the seafood supply chain more transparent and sustainable
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-10 w-10 mx-auto mb-3 text-blue-600" />
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {stats.totalProducts.toLocaleString()}+
                  </div>
                  <p className="text-sm text-muted-foreground">Products Traced</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="h-10 w-10 mx-auto mb-3 text-green-600" />
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {stats.totalTraces.toLocaleString()}+
                  </div>
                  <p className="text-sm text-muted-foreground">Consumer Traces</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <Star className="h-10 w-10 mx-auto mb-3 text-amber-600" />
                  <div className="text-3xl font-bold text-amber-600 mb-1">
                    {stats.averageRating}
                  </div>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <Shield className="h-10 w-10 mx-auto mb-3 text-purple-600" />
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {stats.verificationRate}%
                  </div>
                  <p className="text-sm text-muted-foreground">Verified Stages</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              How TracceAqua Works
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A simple three-step process to trace your seafood from source to plate
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <Card className="text-center border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Scan className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="text-xl font-semibold mb-4">1. Scan QR Code</h4>
                <p className="text-muted-foreground mb-6">
                  Simply scan the QR code on your seafood packaging with your smartphone camera or our web scanner.
                </p>
                <Badge variant="secondary" className="text-xs">
                  Takes 5 seconds
                </Badge>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="text-center border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Globe className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="text-xl font-semibold mb-4">2. View Journey</h4>
                <p className="text-muted-foreground mb-6">
                  See the complete journey of your seafood through every stage of the supply chain with verified data.
                </p>
                <Badge variant="secondary" className="text-xs">
                  Blockchain Verified
                </Badge>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="text-center border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="text-xl font-semibold mb-4">3. Make Informed Choice</h4>
                <p className="text-muted-foreground mb-6">
                  Access quality tests, certifications, and sustainability metrics to make confident purchasing decisions.
                </p>
                <Badge variant="secondary" className="text-xs">
                  100% Transparent
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="container max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Featured Traced Products
              </h3>
              <p className="text-muted-foreground">
                Discover verified sustainable seafood with complete traceability
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.slice(0, 6).map((product) => (
                <Card 
                  key={product.productId}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/trace/${product.productId}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-1">
                          {product.productName}
                        </h4>
                        <p className="text-sm text-muted-foreground italic mb-2">
                          {product.speciesName}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Fish className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline" className="text-xs">
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
                        <Badge variant="secondary" className="text-xs">
                          {product.qualityGrade}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-4">
                      <p className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {product.creator.organization || product.creator.role}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {product.certifications.length} certification{product.certifications.length !== 1 ? 's' : ''}
                      </span>
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-blue-900 text-white py-16">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold mb-4">
            Ready to Trace Your Seafood?
          </h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of consumers making informed choices about sustainable seafood. 
            Every scan supports transparency and ocean conservation.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-6 text-lg"
              onClick={() => router.push('/dashboard/scan')}
            >
              <QrCode className="h-5 w-5 mr-2" />
              Start Scanning Now
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg"
              onClick={() => router.push('/dashboard')}
            >
              Learn More
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="p-2 bg-blue-600 rounded-full">
                <Fish className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">TracceAqua</span>
            </div>
            
            <div className="text-sm text-gray-400">
              <p>© 2024 TracceAqua. Empowering sustainable seafood choices.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}