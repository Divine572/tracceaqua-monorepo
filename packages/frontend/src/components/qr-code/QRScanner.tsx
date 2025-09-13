'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Scanner } from '@yudiel/react-qr-scanner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { Camera, CameraOff, RotateCw, Flashlight, FlashlightOff } from 'lucide-react'

interface QRScannerProps {
  onScan?: (result: string) => void
  onError?: (error: string) => void
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [flashEnabled, setFlashEnabled] = useState(false)
  const [lastScan, setLastScan] = useState<string>('')
  const router = useRouter()
  const { toast } = useToast()

  // Request camera permission
  const requestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop())
      setHasPermission(true)
      setIsScanning(true)
    } catch (error) {
      setHasPermission(false)
      onError?.('Camera permission denied or not available')
      toast({
        title: "Camera Access Required",
        description: "Please allow camera access to scan QR codes.",
        variant: "destructive",
      })
    }
  }

  const handleScanResult = (result: string) => {
    // Prevent duplicate scans
    if (result === lastScan) return
    setLastScan(result)

    // Extract product ID from TracceAqua URLs
    const tracceAquaPattern = /\/trace\/([a-zA-Z0-9-_]+)/
    const match = result.match(tracceAquaPattern)
    
    if (match) {
      const productId = match[1]
      onScan?.(productId)
      router.push(`/trace/${productId}`)
      toast({
        title: "QR Code Scanned",
        description: `Redirecting to product trace: ${productId}`,
      })
    } else {
      // Handle external URLs or other QR codes
      onScan?.(result)
      toast({
        title: "QR Code Detected",
        description: "Non-TracceAqua QR code detected.",
      })
    }
  }

  const handleScanError = (error: Error) => {
    console.error('QR Scanner error:', error)
    onError?.(error.message)
  }

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')
  }

  const toggleFlash = () => {
    setFlashEnabled(prev => !prev)
  }

  const stopScanning = () => {
    setIsScanning(false)
    setLastScan('')
  }

  if (hasPermission === false) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Camera Permission Required</CardTitle>
          <CardDescription>
            Please allow camera access to scan QR codes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Camera className="h-4 w-4" />
            <AlertDescription>
              Camera access is required to scan QR codes. Please click "Allow" when prompted by your browser.
            </AlertDescription>
          </Alert>
          <Button onClick={requestPermission} className="w-full mt-4">
            <Camera className="h-4 w-4 mr-2" />
            Enable Camera
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>QR Code Scanner</CardTitle>
        <CardDescription>
          Position a QR code within the camera view to scan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isScanning ? (
          <div className="space-y-4">
            {/* Scanner View */}
            <div className="relative aspect-square w-full overflow-hidden rounded-lg border">
              <Scanner
                onScan={handleScanResult}
                // onError={handleScanError}
                constraints={{
                  facingMode: facingMode,
                  advanced: [{ torch: flashEnabled }] as any,
                }}
                ViewFinder={() => (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-primary rounded-lg relative">
                      {/* Corner brackets */}
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary" />
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary" />
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary" />
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary" />
                      
                      {/* Scanning line animation */}
                      <div className="absolute top-0 left-0 w-full h-0.5 bg-primary opacity-75 animate-pulse" 
                           style={{ 
                             animation: 'scan-line 2s linear infinite',
                           }} />
                    </div>
                  </div>
                )}
              />
            </div>

            {/* Scanner Controls */}
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleCamera}
                title="Switch Camera"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={toggleFlash}
                title="Toggle Flash"
              >
                {flashEnabled ? (
                  <FlashlightOff className="h-4 w-4" />
                ) : (
                  <Flashlight className="h-4 w-4" />
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={stopScanning}
              >
                <CameraOff className="h-4 w-4 mr-2" />
                Stop Scanning
              </Button>
            </div>

            {/* Instructions */}
            <Alert>
              <Camera className="h-4 w-4" />
              <AlertDescription>
                Hold your device steady and position the QR code within the scanner frame.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-24 h-24 mx-auto bg-muted rounded-lg flex items-center justify-center">
              <Camera className="h-12 w-12 text-muted-foreground" />
            </div>
            <Button onClick={requestPermission} className="w-full">
              <Camera className="h-4 w-4 mr-2" />
              Start Scanning
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}