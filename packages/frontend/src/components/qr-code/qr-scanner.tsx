"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Camera, 
  CameraOff, 
  RotateCcw, 
  Flashlight, 
  FlashlightOff,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Volume2,
  VolumeX
} from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import jsQR from 'jsqr'

interface QRScannerProps {
  onScan?: (productId: string, fullUrl: string) => void
  onError?: (error: string) => void
  className?: string
}

interface ScanHistory {
  productId: string
  scannedAt: Date
  productName?: string
}

export function QRScanner({ onScan, onError, className = "" }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [error, setError] = useState<string>("")
  const [torchSupported, setTorchSupported] = useState(false)
  const [torchEnabled, setTorchEnabled] = useState(false)
  const [lastScanned, setLastScanned] = useState<string>("")
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([])
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number>()
  const lastScanTime = useRef<number>(0)
  const scanCooldown = 2000 // 2 seconds cooldown between scans
  const router = useRouter()

  // Load scan history from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('tracceaqua-scan-history')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setScanHistory(parsed.map((item: any) => ({
          ...item,
          scannedAt: new Date(item.scannedAt)
        })))
      } catch (e) {
        console.error('Failed to load scan history:', e)
      }
    }
  }, [])

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        
        // Check for torch support
        const track = stream.getVideoTracks()[0]
        const capabilities = track.getCapabilities?.()
        if ((capabilities as any)?.torch) {
          setTorchSupported(true)
        }
      }
      
      setHasPermission(true)
      setError("")
      return true
    } catch (err: any) {
      console.error("Camera permission denied:", err)
      setHasPermission(false)
      let errorMessage = "Camera permission denied. Please enable camera access to scan QR codes."
      
      if (err.name === 'NotAllowedError') {
        errorMessage = "Camera access was denied. Please allow camera permissions and try again."
      } else if (err.name === 'NotFoundError') {
        errorMessage = "No camera found. Please ensure you have a working camera."
      } else if (err.name === 'NotReadableError') {
        errorMessage = "Camera is already in use by another application."
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = "Camera constraints could not be satisfied. Trying with default settings..."
        // Retry with basic constraints
        try {
          const basicStream = await navigator.mediaDevices.getUserMedia({ video: true })
          if (videoRef.current) {
            videoRef.current.srcObject = basicStream
            streamRef.current = basicStream
          }
          setHasPermission(true)
          setError("")
          return true
        } catch (basicErr) {
          errorMessage = "Camera access failed with basic settings."
        }
      }
      
      setError(errorMessage)
      return false
    }
  }

  const startScanning = async () => {
    const hasCamera = await requestCameraPermission()
    if (!hasCamera) return
    
    setIsScanning(true)
    setIsProcessing(false)
    
    // Start the scanning loop after video is ready
    const startScanLoop = () => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        scanLoop()
      } else {
        // Wait for video to be ready
        setTimeout(startScanLoop, 100)
      }
    }
    
    startScanLoop()
  }

  const stopScanning = () => {
    setIsScanning(false)
    setIsProcessing(false)
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (torchEnabled) {
      setTorchEnabled(false)
    }
  }

  const toggleTorch = async () => {
    if (!streamRef.current || !torchSupported) return
    
    try {
      const track = streamRef.current.getVideoTracks()[0]
      await track.applyConstraints({
        advanced: [{ torch: !torchEnabled }] as any
      })
      setTorchEnabled(!torchEnabled)
    } catch (err) {
      console.error("Failed to toggle torch:", err)
      toast.error("Failed to toggle flashlight")
    }
  }

  const switchCamera = async () => {
    stopScanning()
    setFacingMode(facingMode === 'user' ? 'environment' : 'user')
    // Restart scanning after a brief delay
    setTimeout(() => {
      if (hasPermission) {
        startScanning()
      }
    }, 500)
  }

  const playBeepSound = () => {
    if (!soundEnabled) return
    
    try {
      // Create a beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (error) {
      // Fallback: try to play a system sound or just continue silently
      console.warn('Could not play beep sound:', error)
    }
  }

  const detectQRCode = (imageData: ImageData): string | null => {
    try {
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert"
      })
      
      return code ? code.data : null
    } catch (error) {
      console.warn('QR detection error:', error)
      return null
    }
  }

  const scanLoop = () => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return
    
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx && !isProcessing) {
      // Set canvas size to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Get image data for QR detection
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      
      // Detect QR code using jsQR
      try {
        const qrResult = detectQRCode(imageData)
        const now = Date.now()
        
        if (qrResult && qrResult !== lastScanned && (now - lastScanTime.current) > scanCooldown) {
          setIsProcessing(true)
          lastScanTime.current = now
          handleQRDetected(qrResult)
          setLastScanned(qrResult)
        }
      } catch (scanError) {
        console.error("QR scan error:", scanError)
      }
    }
    
    // Continue scanning
    animationFrameRef.current = requestAnimationFrame(scanLoop)
  }

  const handleQRDetected = (qrData: string) => {
    try {
      // Play success sound
      playBeepSound()
      
      let productId: string
      
      // Check if it's a TracceAqua URL
      if (qrData.includes('trace/')) {
        const url = new URL(qrData)
        const pathParts = url.pathname.split('/')
        const traceIndex = pathParts.indexOf('trace')
        
        if (traceIndex !== -1 && pathParts.length > traceIndex + 1) {
          productId = pathParts[traceIndex + 1]
        } else {
          throw new Error("Invalid TracceAqua QR code format")
        }
      } else if (qrData.match(/^[A-Z0-9-_]+$/)) {
        // Direct product ID format
        productId = qrData
      } else {
        throw new Error("Not a TracceAqua QR code")
      }

      if (productId) {
        // Add to scan history
        const newScan: ScanHistory = {
          productId,
          scannedAt: new Date()
        }
        
        const updatedHistory = [newScan, ...scanHistory.slice(0, 9)] // Keep last 10
        setScanHistory(updatedHistory)
        localStorage.setItem('tracceaqua-scan-history', JSON.stringify(updatedHistory))
        
        toast.success(`QR Code detected: ${productId}`)
        
        if (onScan) {
          onScan(productId, qrData)
        } else {
          // Auto-navigate after brief delay to show success
          setTimeout(() => {
            router.push(`/trace/${productId}`)
          }, 1000)
        }
        
        // Stop scanning after successful detection
        setTimeout(() => {
          stopScanning()
        }, 1500)
      }
    } catch (err: any) {
      console.error('QR processing error:', err)
      const errorMsg = err.message || "Invalid QR code - not a TracceAqua product code"
      setError(errorMsg)
      if (onError) onError(errorMsg)
      toast.error(errorMsg)
      
      // Clear processing state to continue scanning
      setIsProcessing(false)
      
      // Clear error after a few seconds
      setTimeout(() => {
        setError("")
      }, 3000)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  const renderScanHistory = () => {
    if (scanHistory.length === 0) return null
    
    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3 text-blue-900">Recent Scans</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {scanHistory.slice(0, 5).map((scan, index) => (
            <div 
              key={`${scan.productId}-${scan.scannedAt.getTime()}`}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => router.push(`/trace/${scan.productId}`)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {scan.productId}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {scan.scannedAt.toLocaleTimeString()}
                  </span>
                </div>
                {scan.productName && (
                  <p className="text-sm font-medium mt-1">{scan.productName}</p>
                )}
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold text-blue-900">
          QR Code Scanner
        </CardTitle>
        <CardDescription>
          Scan TracceAqua product QR codes to trace their journey
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isProcessing && (
          <Alert>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              QR Code detected! Processing...
            </AlertDescription>
          </Alert>
        )}

        {/* Camera View */}
        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
          {isScanning ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Scanning overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-4 border-2 border-blue-500 rounded-lg">
                  {/* Corner markers */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                </div>
                
                {/* Scanning line animation */}
                <div className="absolute inset-4 overflow-hidden rounded-lg">
                  <div className="absolute w-full h-0.5 bg-blue-500 animate-pulse scanning-line"></div>
                </div>
              </div>

              {/* Camera controls */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-2">
                {torchSupported && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={toggleTorch}
                    className="bg-black/50 hover:bg-black/70 text-white border-0"
                  >
                    {torchEnabled ? <FlashlightOff className="h-4 w-4" /> : <Flashlight className="h-4 w-4" />}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={switchCamera}
                  className="bg-black/50 hover:bg-black/70 text-white border-0"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="bg-black/50 hover:bg-black/70 text-white border-0"
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              {hasPermission === false ? (
                <>
                  <CameraOff className="h-12 w-12 mb-2" />
                  <p className="text-sm text-center px-4">Camera access denied</p>
                  <p className="text-xs text-center px-4 mt-1 text-muted-foreground">
                    Please enable camera permissions in your browser settings
                  </p>
                </>
              ) : (
                <>
                  <Camera className="h-12 w-12 mb-2" />
                  <p className="text-sm text-center px-4">
                    Press 'Start Scanning' to begin
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex gap-2">
          {!isScanning ? (
            <Button 
              onClick={startScanning} 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={hasPermission === false}
            >
              <Camera className="h-4 w-4 mr-2" />
              Start Scanning
            </Button>
          ) : (
            <Button 
              onClick={stopScanning} 
              variant="destructive"
              className="flex-1"
            >
              <CameraOff className="h-4 w-4 mr-2" />
              Stop Scanning
            </Button>
          )}
        </div>

        {/* Instructions */}
        <div className="text-center text-sm text-muted-foreground border-t pt-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Position QR code within the frame</span>
          </div>
          <p>Make sure the QR code is well-lit and clearly visible</p>
          <p className="text-xs mt-1">
            {facingMode === 'environment' ? 'Back camera' : 'Front camera'} • 
            Sound {soundEnabled ? 'on' : 'off'}
          </p>
        </div>

        {/* Recent Scans History */}
        {renderScanHistory()}
      </CardContent>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </Card>
  )
}

