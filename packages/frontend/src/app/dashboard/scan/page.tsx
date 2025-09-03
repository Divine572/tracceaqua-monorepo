"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  QrCode, 
  Camera, 
  Keyboard,
  Search,
  History,
  ArrowRight,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock,
  Fish
} from 'lucide-react'
import { QRScanner } from '@/components/qr-code/qr-scanner'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { validateQRCode, getBasicProductInfo } from '@/lib/traceability'

interface ScanHistory {
  productId: string
  productName?: string
  speciesName?: string
  sourceType?: 'FARMED' | 'WILD_CAPTURE'
  scannedAt: Date
  location?: string
}

export default function ScanPage() {
  const [activeTab, setActiveTab] = useState('scanner')
  const [manualCode, setManualCode] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([])
  const [lastScanResult, setLastScanResult] = useState<any>(null)
  const router = useRouter()

  // Load scan history on component mount
  React.useEffect(() => {
    const saved = localStorage.getItem('tracceaqua-scan-history')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setScanHistory(parsed.map((item: any) => ({
          ...item,
          scannedAt: new Date(item.scannedAt)
        })).slice(0, 10)) // Keep last 10 scans
      } catch (e) {
        console.error('Failed to load scan history:', e)
      }
    }
  }, [])

  const addToScanHistory = async (productId: string) => {
    try {
      // Get basic product info for history
      const productInfo = await getBasicProductInfo(productId)

      const newScan: ScanHistory = {
        productId,
        productName: productInfo.productName,
        speciesName: productInfo.speciesName,
        sourceType: productInfo.sourceType,
        scannedAt: new Date(),
        location: 'Manual Entry'
      }
      
      const updatedHistory = [newScan, ...scanHistory.slice(0, 9)]
      setScanHistory(updatedHistory)
      localStorage.setItem('tracceaqua-scan-history', JSON.stringify(updatedHistory))
    } catch (error) {
      // Still add to history even if we can't get product info
      const newScan: ScanHistory = {
        productId,
        scannedAt: new Date(),
        location: 'Manual Entry'
      }
      
      const updatedHistory = [newScan, ...scanHistory.slice(0, 9)]
      setScanHistory(updatedHistory)
      localStorage.setItem('tracceaqua-scan-history', JSON.stringify(updatedHistory))
    }
  }

  const handleManualTrace = async () => {
    if (!manualCode.trim()) {
      toast.error('Please enter a product code or URL')
      return
    }

    setIsValidating(true)

    try {
      let productId = manualCode.trim()

      // Check if it's a URL
      if (manualCode.includes('trace/')) {
        const validation = validateQRCode(manualCode)
        if (validation.isValid && validation.productId) {
          productId = validation.productId
        } else {
          throw new Error('Invalid trace URL format')
        }
      }

      // Validate product exists
      await getBasicProductInfo(productId)

      // Add to history
      await addToScanHistory(productId)

      // Navigate to trace page
      router.push(`/trace/${productId}`)
    } catch (error) {
      console.error('Manual trace error:', error)
      toast.error('Product not found or invalid code format')
    } finally {
      setIsValidating(false)
    }
  }

  const handleQRScan = async (productId: string, fullUrl: string) => {
    try {
      // Add to history with QR scan location
      const productInfo = await getBasicProductInfo(productId)

      const newScan: ScanHistory = {
        productId,
        productName: productInfo.productName,
        speciesName: productInfo.speciesName,
        sourceType: productInfo.sourceType,
        scannedAt: new Date(),
        location: 'QR Scan'
      }

      const updatedHistory = [newScan, ...scanHistory.slice(0, 9)]
      setScanHistory(updatedHistory)
      localStorage.setItem('tracceaqua-scan-history', JSON.stringify(updatedHistory))

      setLastScanResult(productInfo)

      // Auto-navigate after brief delay to show scan result
      setTimeout(() => {
        router.push(`/trace/${productId}`)
      }, 1500)
    } catch (error) {
      console.error('QR scan processing error:', error)
    }
  }

  const renderScanHistory = () => {
    if (scanHistory.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No recent scans</p>
          <p className="text-sm">Your scan history will appear here</p>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {scanHistory.map((scan, index) => (
          <Card
            key={`${scan.productId}-${scan.scannedAt.getTime()}`}
            className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500"
            onClick={() => router.push(`/trace/${scan.productId}`)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Fish className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-sm">
                      {scan.productName || 'Unknown Product'}
                    </span>
                    {scan.sourceType && (
                      <Badge variant="outline" className="text-xs">
                        {scan.sourceType === 'FARMED' ? 'Aquaculture' : 'Wild Capture'}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="font-mono">{scan.productId}</span>
                    <span>{scan.scannedAt.toLocaleDateString()}</span>
                    <span>{scan.location}</span>
                  </div>

                  {scan.speciesName && (
                    <p className="text-sm text-muted-foreground italic mt-1">
                      {scan.speciesName}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    #{index + 1}
                  </Badge>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-blue-900">
          Trace Seafood Products
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Scan QR codes or enter product codes manually to trace the complete journey
          of seafood products from source to your plate.
        </p>
      </div>

      {/* Last Scan Result */}
      {lastScanResult && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Successfully scanned:</strong> {lastScanResult.productName}
            ({lastScanResult.speciesName}) - Redirecting to trace page...
          </AlertDescription>
        </Alert>
      )}

      {/* Main Scanning Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scanner" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            QR Scanner
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Keyboard className="h-4 w-4" />
            Manual Entry
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Recent Scans
          </TabsTrigger>
        </TabsList>

        {/* QR Scanner Tab */}
        <TabsContent value="scanner" className="space-y-6">
          <QRScanner
            onScan={handleQRScan}
            onError={(error) => toast.error(error)}
            className="mx-auto"
          />

          {/* Scanner Instructions */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                How to Scan QR Codes
              </h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p>📱 <strong>On Mobile:</strong> Point your device's camera at the QR code</p>
                <p>💻 <strong>On Desktop:</strong> Use your webcam or external camera</p>
                <p>💡 <strong>Tips:</strong> Ensure good lighting and hold steady for best results</p>
                <p>✅ <strong>Look for:</strong> TracceAqua QR codes on product packaging</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manual Entry Tab */}
        <TabsContent value="manual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Keyboard className="h-5 w-5" />
                Enter Product Code or URL
              </CardTitle>
              <CardDescription>
                Manually enter a product ID or paste a trace URL to view product journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="manual-code">Product Code or Trace URL</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="manual-code"
                    placeholder="e.g. FISH-2024-001 or https://tracceaqua.com/trace/FISH-2024-001"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleManualTrace()}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleManualTrace}
                    disabled={isValidating || !manualCode.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isValidating ? (
                      <Clock className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    {isValidating ? 'Validating...' : 'Trace'}
                  </Button>
                </div>
              </div>

              {/* Format Examples */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Accepted Formats:</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>• Product ID: <code className="text-xs bg-white px-1 rounded">FISH-2024-001</code></p>
                  <p>• Trace URL: <code className="text-xs bg-white px-1 rounded">https://tracceaqua.com/trace/FISH-2024-001</code></p>
                  <p>• Short URL: <code className="text-xs bg-white px-1 rounded">tracceaqua.com/trace/FISH-2024-001</code></p>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <Label className="text-sm text-muted-foreground">Quick Actions</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setManualCode('DEMO-FISH-001')}
                  >
                    Try Demo Product
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.readText().then(text => {
                        if (text.includes('trace/') || text.match(/^[A-Z0-9-]+$/)) {
                          setManualCode(text)
                          toast.success('Pasted from clipboard')
                        } else {
                          toast.error('No valid code found in clipboard')
                        }
                      }).catch(() => {
                        toast.error('Could not read clipboard')
                      })
                    }}
                  >
                    Paste from Clipboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scan History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Scans
              </CardTitle>
              <CardDescription>
                Your recently scanned products (stored locally on your device)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderScanHistory()}

              {scanHistory.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      Showing {scanHistory.length} recent scan{scanHistory.length > 1 ? 's' : ''}
                    </p>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setScanHistory([])
                        localStorage.removeItem('tracceaqua-scan-history')
                        toast.success('Scan history cleared')
                      }}
                    >
                      Clear History
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Public Statistics */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              TracceAqua Impact
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">1,250+</div>
                <p className="text-muted-foreground">Products Traced</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">8,500+</div>
                <p className="text-muted-foreground">Journey Stages</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">98.5%</div>
                <p className="text-muted-foreground">Verification Rate</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">14</div>
                <p className="text-muted-foreground">Avg. Journey Days</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Join thousands of consumers making informed choices about sustainable seafood
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}