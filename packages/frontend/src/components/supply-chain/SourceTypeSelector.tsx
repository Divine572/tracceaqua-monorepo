'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Fish, MapPin, Waves, Factory, Truck, Store, Clock } from 'lucide-react'

export type SourceType = 'FARMED' | 'WILD_CAPTURE'

interface SourceTypeSelectorProps {
  onSelect: (sourceType: SourceType) => void
  onBack?: () => void
}

const farmedStages = [
  { name: 'Hatchery', icon: Factory, description: 'Spawning and larval rearing' },
  { name: 'Grow-out', icon: Fish, description: 'Growth to market size' },
  { name: 'Harvest', icon: Waves, description: 'Collection from farm' },
  { name: 'Processing', icon: Factory, description: 'Cleaning and packaging' },
  { name: 'Distribution', icon: Truck, description: 'Transportation to markets' },
  { name: 'Retail', icon: Store, description: 'Sale to consumers' }
]

const wildCaptureStages = [
  { name: 'Fishing', icon: MapPin, description: 'Wild capture operations' },
  { name: 'Processing', icon: Factory, description: 'Sorting and preparation' },
  { name: 'Distribution', icon: Truck, description: 'Transport to markets' },
  { name: 'Retail', icon: Store, description: 'Consumer sales' }
]

export default function SourceTypeSelector({ onSelect, onBack }: SourceTypeSelectorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {onBack && (
              <Button variant="outline" onClick={onBack} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Select Source Type</h1>
              <p className="text-gray-600">Choose the origin of your shellfish products to begin traceability tracking</p>
            </div>
          </div>
        </div>

        {/* Source Type Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Farmed Aquaculture */}
          <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-blue-300" 
                onClick={() => onSelect('FARMED')}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Fish className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl text-blue-900">Farmed Aquaculture</CardTitle>
              <CardDescription className="text-lg">
                Products from controlled aquaculture operations
              </CardDescription>
              <div className="flex justify-center gap-2 mt-2">
                <Badge variant="secondary" className="gap-1">
                  <Clock className="h-3 w-3" />
                  6 Stages
                </Badge>
                <Badge variant="outline">Controlled Environment</Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Traceability Journey:</h4>
                {farmedStages.map((stage, index) => {
                  const Icon = stage.icon
                  return (
                    <div key={stage.name} className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="h-4 w-4 text-gray-600" />
                          <span className="font-medium text-gray-900">{stage.name}</span>
                        </div>
                        <p className="text-sm text-gray-600">{stage.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="border-t pt-4 mt-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">Ideal for:</p>
                    <ul className="text-gray-600 mt-1 space-y-1">
                      <li>• Oyster farms</li>
                      <li>• Mussel cultivation</li>
                      <li>• Shrimp ponds</li>
                      <li>• Intensive systems</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Features:</p>
                    <ul className="text-gray-600 mt-1 space-y-1">
                      <li>• Growth monitoring</li>
                      <li>• Feed tracking</li>
                      <li>• Water quality logs</li>
                      <li>• Batch management</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button className="w-full mt-6 py-6 text-lg" onClick={() => onSelect('FARMED')}>
                Start Farmed Product Journey
                <Fish className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>

          {/* Wild Capture */}
          <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-green-300" 
                onClick={() => onSelect('WILD_CAPTURE')}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-900">Wild-capture Fisheries</CardTitle>
              <CardDescription className="text-lg">
                Products from natural marine environments
              </CardDescription>
              <div className="flex justify-center gap-2 mt-2">
                <Badge variant="secondary" className="gap-1">
                  <Clock className="h-3 w-3" />
                  4 Stages
                </Badge>
                <Badge variant="outline">Natural Harvest</Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Traceability Journey:</h4>
                {wildCaptureStages.map((stage, index) => {
                  const Icon = stage.icon
                  return (
                    <div key={stage.name} className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 text-sm font-semibold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="h-4 w-4 text-gray-600" />
                          <span className="font-medium text-gray-900">{stage.name}</span>
                        </div>
                        <p className="text-sm text-gray-600">{stage.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="border-t pt-4 mt-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">Ideal for:</p>
                    <ul className="text-gray-600 mt-1 space-y-1">
                      <li>• Commercial fishing</li>
                      <li>• Artisanal catch</li>
                      <li>• Diving operations</li>
                      <li>• Beach collection</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Features:</p>
                    <ul className="text-gray-600 mt-1 space-y-1">
                      <li>• Catch location GPS</li>
                      <li>• Vessel information</li>
                      <li>• Fishing method logs</li>
                      <li>• Landing records</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button className="w-full mt-6 py-6 text-lg bg-green-600 hover:bg-green-700" 
                      onClick={() => onSelect('WILD_CAPTURE')}>
                Start Wild-capture Journey
                <MapPin className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Comparison Overview</CardTitle>
            <CardDescription>
              Key differences between farmed and wild-capture traceability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <h4 className="font-semibold text-gray-900 mb-2">Timeline</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <span className="text-sm">Farmed</span>
                    <Badge variant="outline">6-18 months</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm">Wild-capture</span>
                    <Badge variant="outline">1-7 days</Badge>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <h4 className="font-semibold text-gray-900 mb-2">Complexity</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <span className="text-sm">Farmed</span>
                    <div className="flex gap-1">
                      {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="w-2 h-2 bg-blue-600 rounded-full" />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm">Wild-capture</span>
                    <div className="flex gap-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="w-2 h-2 bg-green-600 rounded-full" />
                      ))}
                      <div className="w-2 h-2 bg-gray-300 rounded-full" />
                      <div className="w-2 h-2 bg-gray-300 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <h4 className="font-semibold text-gray-900 mb-2">Traceability Depth</h4>
                <div className="space-y-2">
                  <div className="p-2 bg-blue-50 rounded">
                    <span className="text-sm font-medium text-blue-800">Comprehensive</span>
                    <p className="text-xs text-blue-600 mt-1">Full lifecycle tracking</p>
                  </div>
                  <div className="p-2 bg-green-50 rounded">
                    <span className="text-sm font-medium text-green-800">Essential</span>
                    <p className="text-xs text-green-600 mt-1">Key checkpoint data</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Why Choose TracceAqua?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <div className="w-6 h-6 rounded bg-gradient-to-r from-blue-500 to-purple-600"></div>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Blockchain Security</h4>
                <p className="text-sm text-gray-600">Immutable records stored on Ethereum blockchain</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Factory className="h-6 w-6 text-orange-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">IPFS Storage</h4>
                <p className="text-sm text-gray-600">Decentralized file storage for documents and photos</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Waves className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Real-time Updates</h4>
                <p className="text-sm text-gray-600">Live tracking as products move through supply chain</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Store className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Consumer Access</h4>
                <p className="text-sm text-gray-600">QR codes provide instant product history to consumers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}