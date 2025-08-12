// packages/frontend/src/app/(dashboard)/scan/page.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  QrCode, 
  Camera, 
  Upload, 
  Type, 
  AlertCircle, 
  CheckCircle2,
  Loader2,
  X,
  RefreshCw
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ScanResult {
  productId: string
  productName: string
  batchNumber: string
  origin: string
  harvestDate: string
  status: 'valid' | 'invalid' | 'expired'
}

export default function ScanPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('camera')
  const [isScanning, setIsScanning] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'pending'>('pending')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Initialize camera when camera tab is active
  useEffect(() => {
    if (activeTab === 'camera') {
      initializeCamera()
    } else {
      stopCamera()
    }

    return () => stopCamera()
  }, [activeTab])

  const initializeCamera = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      
      setCameraPermission('granted')
    } catch (err) {
      console.error('Camera access error:', err)
      setCameraPermission('denied')
      setError('Camera access denied. Please allow camera permissions and try again.')
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
  }

  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) return

    setIsScanning(true)
    setError(null)

    try {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext('2d')

      if (!context) throw new Error('Canvas context not available')

      // Set canvas size to video size
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Simulate QR code scanning (replace with actual QR scanning library)
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Mock scan result
      const mockResult: ScanResult = {
        productId: 'TRA-2024-001234',
        productName: 'Fresh Atlantic Salmon',
        batchNumber: 'LAG-2024-0156',
        origin: 'Lagos Fish Farm, Nigeria',
        harvestDate: '2024-08-10',
        status: 'valid'
      }

      setScanResult(mockResult)
    } catch (err) {
      setError('Failed to scan QR code. Please try again.')
    } finally {
      setIsScanning(false)
    }
  }

  const handleManualScan = async () => {
    if (!manualCode.trim()) {
      setError('Please enter a product code')
      return
    }

    setIsScanning(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Mock result based on code
      const mockResult: ScanResult = {
        productId: manualCode,
        productName: 'Fresh Tilapia',
        batchNumber: 'ABJ-2024-0089',
        origin: 'Abuja Aquaculture Center',
        harvestDate: '2024-08-08',
        status: manualCode.includes('EXP') ? 'expired' : 'valid'
      }

      setScanResult(mockResult)
    } catch (err) {
      setError('Product not found. Please check the code and try again.')
    } finally {
      setIsScanning(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsScanning(true)
    setError(null)

    // Simulate file processing
    setTimeout(() => {
      const mockResult: ScanResult = {
        productId: 'TRA-2024-005678',
        productName: 'Frozen Shrimp',
        batchNumber: 'PHC-2024-0234',
        origin: 'Port Harcourt Fisheries',
        harvestDate: '2024-08-05',
        status: 'valid'
      }

      setScanResult(mockResult)
      setIsScanning(false)
    }, 2000)
  }

  const viewFullTrace = () => {
    if (scanResult) {
      router.push(`/trace/${scanResult.productId}`)
    }
  }

  const resetScan = () => {
    setScanResult(null)
    setError(null)
    setManualCode('')
  }

  if (scanResult) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Scan Result</h1>
          <Button variant="outline" onClick={resetScan}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Scan Again
          </Button>
        </div>

        <Card className={`border-2 ${
          scanResult.status === 'valid' ? 'border-green-200 bg-green-50' :
          scanResult.status === 'expired' ? 'border-red-200 bg-red-50' :
          'border-yellow-200 bg-yellow-50'
        }`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {scanResult.status === 'valid' ? (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600" />
              )}
              {scanResult.productName}
            </CardTitle>
            <CardDescription>
              Product ID: {scanResult.productId}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Batch Number</p>
                <p className="text-sm">{scanResult.batchNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Origin</p>
                <p className="text-sm">{scanResult.origin}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Harvest Date</p>
                <p className="text-sm">{scanResult.harvestDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className={`text-sm font-medium ${
                  scanResult.status === 'valid' ? 'text-green-600' :
                  scanResult.status === 'expired' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {scanResult.status.toUpperCase()}
                </p>
              </div>
            </div>

            <div className="pt-4">
              <Button onClick={viewFullTrace} className="w-full">
                View Complete Traceability Journey
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <QrCode className="w-6 h-6 text-blue-600" />
          Scan Product
        </h1>
        <p className="text-gray-600">
          Scan a QR code or enter a product code to trace its journey
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="camera">
            <Camera className="w-4 h-4 mr-2" />
            Camera
          </TabsTrigger>
          <TabsTrigger value="upload">
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="manual">
            <Type className="w-4 h-4 mr-2" />
            Manual
          </TabsTrigger>
        </TabsList>

        <TabsContent value="camera" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Camera Scanner</CardTitle>
              <CardDescription>
                Point your camera at a QR code to scan it
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full max-w-md mx-auto rounded-lg bg-gray-100"
                  autoPlay
                  playsInline
                  muted
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                
                {cameraPermission === 'denied' && (
                  <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <Camera className="w-12 h-12 text-gray-400 mx-auto" />
                      <p className="text-sm text-gray-600">Camera access required</p>
                      <Button onClick={initializeCamera} size="sm">
                        Enable Camera
                      </Button>
                    </div>
                  </div>
                )}

                {isScanning && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <div className="text-center text-white space-y-2">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                      <p className="text-sm">Scanning...</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center">
                <Button 
                  onClick={captureAndScan}
                  disabled={isScanning || cameraPermission !== 'granted'}
                  size="lg"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4 mr-2" />
                      Scan QR Code
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload QR Code Image</CardTitle>
              <CardDescription>
                Upload an image containing a QR code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                <div className="text-center space-y-4">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, or WEBP (max 5MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="qr-upload"
                  />
                  <label htmlFor="qr-upload">
                    <Button variant="outline" asChild>
                      <span>Choose File</span>
                    </Button>
                  </label>
                </div>
              </div>

              {isScanning && (
                <div className="text-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Processing image...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enter Product Code</CardTitle>
              <CardDescription>
                Manually enter the product code if scanning is not available
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Enter product code (e.g., TRA-2024-001234)"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="text-center text-lg font-mono"
                />
                <p className="text-xs text-gray-500 text-center">
                  Product codes are usually found printed below the QR code
                </p>
              </div>

              <Button 
                onClick={handleManualScan}
                disabled={isScanning || !manualCode.trim()}
                className="w-full"
                size="lg"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Looking up...
                  </>
                ) : (
                  <>
                    <Type className="w-4 h-4 mr-2" />
                    Trace Product
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">How to Scan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 text-sm">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-sm font-bold text-blue-600">1</span>
              </div>
              <p className="font-medium">Find the QR code on your seafood product packaging</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-sm font-bold text-blue-600">2</span>
              </div>
              <p className="font-medium">Use your camera to scan the code or upload an image</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-sm font-bold text-blue-600">3</span>
              </div>
              <p className="font-medium">View the complete traceability journey</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}