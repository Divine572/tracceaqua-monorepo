import { useState, useRef, useCallback, useEffect } from 'react'
import jsQR from 'jsqr'

export interface UseQRScannerOptions {
  onScan?: (data: string) => void
  onError?: (error: string) => void
  facingMode?: 'user' | 'environment'
  scanCooldown?: number // milliseconds between successful scans
}

export function useQRScanner(options: UseQRScannerOptions = {}) {
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [error, setError] = useState<string>("")
  const [torchSupported, setTorchSupported] = useState(false)
  const [torchEnabled, setTorchEnabled] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number>()
  const lastScanTime = useRef<number>(0)
  const lastScannedData = useRef<string>("")
  
  const scanCooldown = options.scanCooldown || 2000 // Default 2 seconds

  const detectQRCode = useCallback((imageData: ImageData): string | null => {
    try {
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      })
      
      return code ? code.data : null
    } catch (error) {
      console.warn('QR detection error:', error)
      return null
    }
  }, [])

  const scanLoop = useCallback(() => {
    if (!isScanning || !videoRef.current || !canvasRef.current || isProcessing) return
    
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      // Set canvas size to match video dimensions
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Get image data for QR detection
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      
      // Detect QR code
      const qrResult = detectQRCode(imageData)
      const now = Date.now()
      
      if (
        qrResult && 
        qrResult !== lastScannedData.current && 
        (now - lastScanTime.current) > scanCooldown
      ) {
        setIsProcessing(true)
        lastScanTime.current = now
        lastScannedData.current = qrResult
        
        // Trigger callback
        options.onScan?.(qrResult)
        
        // Reset processing after a short delay
        setTimeout(() => {
          setIsProcessing(false)
        }, 1000)
      }
    }
    
    // Continue scanning
    animationFrameRef.current = requestAnimationFrame(scanLoop)
  }, [isScanning, isProcessing, detectQRCode, scanCooldown, options])

  const requestCameraPermission = useCallback(async () => {
    try {
      const constraints = {
        video: {
          facingMode: options.facingMode || 'environment',
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)

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
      console.error("Camera permission error:", err)
      setHasPermission(false)
      
      let errorMessage = "Camera access denied"
      
      switch (err.name) {
        case 'NotAllowedError':
          errorMessage = "Camera permission denied. Please allow camera access."
          break
        case 'NotFoundError':
          errorMessage = "No camera found. Please ensure you have a working camera."
          break
        case 'NotReadableError':
          errorMessage = "Camera is already in use by another application."
          break
        case 'OverconstrainedError':
          errorMessage = "Camera constraints could not be satisfied."
          // Try with basic constraints
          try {
            const basicStream = await navigator.mediaDevices.getUserMedia({ video: true })
            if (videoRef.current) {
              videoRef.current.srcObject = basicStream
              streamRef.current = basicStream
            }
            setHasPermission(true)
            setError("")
            return true
          } catch {
            errorMessage = "Camera access failed with basic settings."
          }
          break
        default:
          errorMessage = `Camera error: ${err.message}`
      }
      
      setError(errorMessage)
      options.onError?.(errorMessage)
      return false
    }
  }, [options])

  const startScanning = useCallback(async () => {
    const hasCamera = await requestCameraPermission()
    if (!hasCamera) return
    
    setIsScanning(true)
    setIsProcessing(false)
    lastScannedData.current = ""
    
    // Wait for video to be ready before starting scan loop
    const waitForVideo = () => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        scanLoop()
      } else {
        setTimeout(waitForVideo, 100)
      }
    }
    
    waitForVideo()
  }, [requestCameraPermission, scanLoop])

  const stopScanning = useCallback(() => {
    setIsScanning(false)
    setIsProcessing(false)
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = undefined
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (torchEnabled) {
      setTorchEnabled(false)
    }
    
    lastScannedData.current = ""
  }, [torchEnabled])

  const toggleTorch = useCallback(async () => {
    if (!streamRef.current || !torchSupported) return
    
    try {
      const track = streamRef.current.getVideoTracks()[0]
      await track.applyConstraints({
        advanced: [{ torch: !torchEnabled }] as any
      })
      setTorchEnabled(!torchEnabled)
    } catch (err) {
      const errorMsg = "Failed to toggle flashlight"
      setError(errorMsg)
      options.onError?.(errorMsg)
    }
  }, [torchEnabled, torchSupported, options])

  const resetError = useCallback(() => {
    setError("")
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [stopScanning])

  // Update scanning when facingMode changes
  useEffect(() => {
    if (isScanning) {
      stopScanning()
      setTimeout(() => {
        startScanning()
      }, 500)
    }
  }, [options.facingMode])

  return {
    // State
    isScanning,
    hasPermission,
    error,
    torchSupported,
    torchEnabled,
    isProcessing,
    
    // Refs
    videoRef,
    canvasRef,
    
    // Actions
    startScanning,
    stopScanning,
    toggleTorch,
    resetError,
    
    // Utilities
    detectQRCode
  }
}
