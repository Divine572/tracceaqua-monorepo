

import { useState, useRef, useCallback, useEffect } from 'react'
import jsQR, { QRCode } from 'jsqr'

// Extended interfaces for camera capabilities not fully supported in TypeScript
interface ExtendedMediaTrackCapabilities extends MediaTrackCapabilities {
  torch?: boolean[]
}

interface ExtendedMediaTrackSettings extends MediaTrackSettings {
  torch?: boolean
}

interface ExtendedMediaTrackConstraints extends MediaTrackConstraints {
  torch?: boolean | ConstrainBoolean
}

export interface UseQRScannerOptions {
  onScan?: (data: string) => void
  onError?: (error: string) => void
  facingMode?: 'user' | 'environment'
  scanCooldown?: number // milliseconds between successful scans
  scanRate?: number // scans per second
  enableSound?: boolean
  autoStart?: boolean // automatically start scanning when hook mounts
  validateTracceAqua?: boolean // only accept TracceAqua QR codes
}

export interface QRScannerState {
  isScanning: boolean
  hasPermission: boolean | null
  error: string
  torchSupported: boolean
  torchEnabled: boolean
  isProcessing: boolean
  lastScanned: string
  scanCount: number
  deviceCount: number
  currentDeviceId: string | null
}

export interface QRScannerActions {
  startScanning: () => Promise<void>
  stopScanning: () => void
  toggleTorch: () => Promise<void>
  switchCamera: () => Promise<void>
  resetError: () => void
  retryPermission: () => Promise<void>
}

export interface QRScannerRefs {
  videoRef: React.RefObject<HTMLVideoElement>
  canvasRef: React.RefObject<HTMLCanvasElement>
}

export function useQRScanner(options: UseQRScannerOptions = {}) {
  // State management
  const [state, setState] = useState<QRScannerState>({
    isScanning: false,
    hasPermission: null,
    error: "",
    torchSupported: false,
    torchEnabled: false,
    isProcessing: false,
    lastScanned: "",
    scanCount: 0,
    deviceCount: 0,
    currentDeviceId: null,
  })
  
  // Refs for DOM elements and internal state
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number>()
  const lastScanTime = useRef<number>(0)
  const lastScannedData = useRef<string>("")
  const devicesRef = useRef<MediaDeviceInfo[]>([])
  
  // Configuration
  const scanCooldown = options.scanCooldown || 2000 // 2 seconds
  const scanRate = options.scanRate || 10 // 10 FPS
  const scanInterval = 1000 / scanRate
  const enableSound = options.enableSound ?? true
  const validateTracceAqua = options.validateTracceAqua ?? true

  // Real QR code detection using jsQR
  const detectQRCode = useCallback((imageData: ImageData): QRCode | null => {
    try {
      const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "attemptBoth", // Try both normal and inverted for better detection
      })
      
      return qrCode
    } catch (error) {
      console.warn('QR detection error:', error)
      return null
    }
  }, [])

  // Validate TracceAqua QR codes
  const validateTracceAquaQR = useCallback((qrData: string): {
    isValid: boolean
    productId?: string
    error?: string
  } => {
    try {
      let productId: string
      const cleanData = qrData.trim()

      // Check if it's a TracceAqua URL
      if (cleanData.includes('trace/')) {
        try {
          const url = new URL(cleanData)

          // Validate TracceAqua domains
          const validDomains = [
            'tracceaqua.com',
            'tracceaqua.vercel.app',
            'localhost:3000',
            'localhost'
          ]

          const isValidDomain = validDomains.some(domain =>
            url.hostname.includes(domain) || url.hostname === domain
          )

          if (!isValidDomain) {
            return { isValid: false, error: 'Not a TracceAqua domain' }
          }

          const pathParts = url.pathname.split('/')
          const traceIndex = pathParts.indexOf('trace')

          if (traceIndex !== -1 && pathParts.length > traceIndex + 1) {
            productId = pathParts[traceIndex + 1]
          } else {
            return { isValid: false, error: 'Invalid trace URL structure' }
          }
        } catch (urlError) {
          return { isValid: false, error: 'Invalid URL format' }
        }
      } else if (cleanData.match(/^[A-Z0-9-_]+$/i)) {
        // Direct product ID format
        productId = cleanData.toUpperCase()
      } else {
        return { isValid: false, error: 'Invalid QR code format' }
      }

      // Validate product ID
      if (!productId || productId.length < 3 || productId.length > 50) {
        return { isValid: false, error: 'Invalid product ID length' }
      }

      // TracceAqua specific validation
      const hasLetter = /[A-Z]/i.test(productId)
      const hasNumberOrHyphen = /[0-9-]/i.test(productId)
      const validChars = /^[A-Z0-9-_]+$/i.test(productId)
      const validStructure = !/^[-_]|[-_]$/.test(productId)

      if (!hasLetter || !hasNumberOrHyphen || !validChars || !validStructure) {
        return { isValid: false, error: 'Invalid TracceAqua product ID format' }
      }

      return { isValid: true, productId }
    } catch (error: any) {
      return { isValid: false, error: `Validation error: ${error.message}` }
    }
  }, [])

  // Play sound feedback
  const playSound = useCallback((type: 'success' | 'error') => {
    if (!enableSound) return

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      if (type === 'success') {
        // Pleasant success sound
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(960, audioContext.currentTime + 0.1)
        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01)
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.2)
      } else {
        // Subtle error sound
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime + 0.1)
        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.05, audioContext.currentTime + 0.01)
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.15)
      }
    } catch (error) {
      console.warn(`Could not play ${type} sound:`, error)
    }
  }, [enableSound])

  // Draw detection outline on canvas
  const drawDetectionOutline = useCallback((ctx: CanvasRenderingContext2D, qrCode: QRCode) => {
    try {
      const { topLeftCorner, topRightCorner, bottomLeftCorner, bottomRightCorner } = qrCode.location

      // Draw green outline
      ctx.strokeStyle = '#10B981'
      ctx.lineWidth = 4
      ctx.beginPath()

      ctx.moveTo(topLeftCorner.x, topLeftCorner.y)
      ctx.lineTo(topRightCorner.x, topRightCorner.y)
      ctx.lineTo(bottomRightCorner.x, bottomRightCorner.y)
      ctx.lineTo(bottomLeftCorner.x, bottomLeftCorner.y)
      ctx.lineTo(topLeftCorner.x, topLeftCorner.y)

      ctx.stroke()

      // Add corner markers
      const cornerSize = 8
      const corners = [topLeftCorner, topRightCorner, bottomLeftCorner, bottomRightCorner]

      ctx.fillStyle = '#10B981'
      corners.forEach(corner => {
        ctx.fillRect(
          corner.x - cornerSize / 2,
          corner.y - cornerSize / 2,
          cornerSize,
          cornerSize
        )
      })
    } catch (error) {
      console.warn('Failed to draw QR detection outline:', error)
    }
  }, [])

  // Main scanning loop with real QR detection
  const scanLoop = useCallback(() => {
    if (!state.isScanning || !videoRef.current || !canvasRef.current || state.isProcessing) {
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    const now = Date.now()

    // Control scan rate for performance
    if (now - lastScanTime.current < scanInterval) {
      animationFrameRef.current = requestAnimationFrame(scanLoop)
      return
    }

    lastScanTime.current = now

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      try {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Get image data for QR detection
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        // Real QR code detection
        const qrCode = detectQRCode(imageData)

        if (qrCode && qrCode.data) {
          const qrData = qrCode.data.trim()

          // Prevent scanning same code repeatedly
          if (qrData !== lastScannedData.current) {
            lastScannedData.current = qrData

            // Validate QR code if TracceAqua validation is enabled
            if (validateTracceAqua) {
              const validation = validateTracceAquaQR(qrData)

              if (validation.isValid) {
                // Valid TracceAqua QR code detected
                setState(prev => ({
                  ...prev,
                  isProcessing: true,
                  lastScanned: qrData,
                  scanCount: prev.scanCount + 1
                }))

                // Draw detection outline
                drawDetectionOutline(ctx, qrCode)

                // Play success sound
                playSound('success')

        // Trigger callback
                options.onScan?.(qrData)

                // Reset processing state after cooldown
                setTimeout(() => {
                  setState(prev => ({ ...prev, isProcessing: false }))
                  lastScannedData.current = ""
                }, scanCooldown)
              } else {
                // Invalid TracceAqua QR code
                const errorMsg = validation.error || 'Invalid TracceAqua QR code'
                setState(prev => ({ ...prev, error: errorMsg }))

                playSound('error')
                options.onError?.(errorMsg)

                // Clear error and reset after short delay
                setTimeout(() => {
                  setState(prev => ({ ...prev, error: "" }))
                  lastScannedData.current = ""
                }, 1500)
              }
            } else {
              // Accept any QR code without validation
              setState(prev => ({
                ...prev,
                isProcessing: true,
                lastScanned: qrData,
                scanCount: prev.scanCount + 1
              }))

              drawDetectionOutline(ctx, qrCode)
              playSound('success')
              options.onScan?.(qrData)

              setTimeout(() => {
                setState(prev => ({ ...prev, isProcessing: false }))
                lastScannedData.current = ""
              }, scanCooldown)
            }
          }
        }
      } catch (error: any) {
        console.warn('Scan loop error:', error)
      // Don't stop scanning for minor errors
      }
    }
    
    // Continue scanning
    animationFrameRef.current = requestAnimationFrame(scanLoop)
  }, [
    state.isScanning,
    state.isProcessing,
    scanInterval,
    detectQRCode,
    validateTracceAqua,
    validateTracceAquaQR,
    drawDetectionOutline,
    playSound,
    options,
    scanCooldown
  ])

  // Get available camera devices
  const getDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      devicesRef.current = videoDevices

      setState(prev => ({ ...prev, deviceCount: videoDevices.length }))
      return videoDevices
    } catch (error) {
      console.warn('Failed to enumerate devices:', error)
      return []
    }
  }, [])

  // Request camera permission and start stream
  const requestCameraPermission = useCallback(async () => {
    try {
      const constraints: MediaStreamConstraints = {
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
        const capabilities = track.getCapabilities?.() as ExtendedMediaTrackCapabilities
        const settings = track.getSettings()

        setState(prev => ({
          ...prev,
          hasPermission: true,
          torchSupported: !!(capabilities?.torch),
          currentDeviceId: settings.deviceId || null,
          error: ""
        }))

        // Get available devices
        await getDevices()
      }

      return true
    } catch (err: any) {
      console.error("Camera permission error:", err)
      
      let errorMessage = "Camera access denied"
      
      switch (err.name) {
        case 'NotAllowedError':
          errorMessage = "Camera permission denied. Please allow camera access and try again."
          break
        case 'NotFoundError':
          errorMessage = "No camera found. Please ensure you have a working camera."
          break
        case 'NotReadableError':
          errorMessage = "Camera is already in use by another application."
          break
        case 'OverconstrainedError':
          errorMessage = "Camera constraints could not be satisfied. Trying with basic settings..."
          // Try with basic constraints
          try {
            const basicStream = await navigator.mediaDevices.getUserMedia({ video: true })
            if (videoRef.current) {
              videoRef.current.srcObject = basicStream
              streamRef.current = basicStream
            }
            setState(prev => ({ ...prev, hasPermission: true, error: "" }))
            return true
          } catch {
            errorMessage = "Camera access failed with basic settings."
          }
          break
        default:
          errorMessage = `Camera error: ${err.message}`
      }
      
      setState(prev => ({ ...prev, hasPermission: false, error: errorMessage }))
      options.onError?.(errorMessage)
      return false
    }
  }, [options, getDevices])

  // Start scanning
  const startScanning = useCallback(async () => {
    const hasCamera = await requestCameraPermission()
    if (!hasCamera) return
    
    setState(prev => ({ ...prev, isScanning: true, isProcessing: false }))
    lastScannedData.current = ""
    
    // Wait for video to be ready
    const waitForVideo = () => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        scanLoop()
      } else {
        setTimeout(waitForVideo, 100)
      }
    }
    
    waitForVideo()
  }, [requestCameraPermission, scanLoop])

  // Stop scanning
  const stopScanning = useCallback(() => {
    setState(prev => ({
      ...prev,
      isScanning: false,
      isProcessing: false,
      torchEnabled: false
    }))
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = undefined
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    lastScannedData.current = ""
  }, [])

  // Toggle torch
  const toggleTorch = useCallback(async () => {
    if (!streamRef.current || !state.torchSupported) return
    
    try {
      const track = streamRef.current.getVideoTracks()[0]
      await track.applyConstraints({
        advanced: [{ torch: !state.torchEnabled }] as any
      })

      setState(prev => ({ ...prev, torchEnabled: !prev.torchEnabled }))
    } catch (err: any) {
      const errorMsg = "Failed to toggle flashlight"
      setState(prev => ({ ...prev, error: errorMsg }))
      options.onError?.(errorMsg)
    }
  }, [state.torchSupported, state.torchEnabled, options])

  // Switch camera
  const switchCamera = useCallback(async () => {
    if (devicesRef.current.length <= 1) return

    const currentDeviceIndex = devicesRef.current.findIndex(
      device => device.deviceId === state.currentDeviceId
    )

    const nextDeviceIndex = (currentDeviceIndex + 1) % devicesRef.current.length
    const nextDevice = devicesRef.current[nextDeviceIndex]

    if (nextDevice) {
      stopScanning()

      // Update facing mode based on device
      const newFacingMode = nextDevice.label.toLowerCase().includes('front') ? 'user' : 'environment'

      setTimeout(async () => {
        try {
          const constraints: MediaStreamConstraints = {
            video: { deviceId: { exact: nextDevice.deviceId } }
          }

          const stream = await navigator.mediaDevices.getUserMedia(constraints)

          if (videoRef.current) {
            videoRef.current.srcObject = stream
            streamRef.current = stream

            const track = stream.getVideoTracks()[0]
            const capabilities = track.getCapabilities?.() as ExtendedMediaTrackCapabilities

            setState(prev => ({
              ...prev,
              hasPermission: true,
              torchSupported: !!(capabilities?.torch),
              torchEnabled: false,
              currentDeviceId: nextDevice.deviceId,
              error: ""
            }))

            // Restart scanning
            if (state.isScanning) {
              setState(prev => ({ ...prev, isScanning: true }))
              scanLoop()
            }
          }
        } catch (error: any) {
          const errorMsg = `Failed to switch camera: ${error.message}`
          setState(prev => ({ ...prev, error: errorMsg }))
          options.onError?.(errorMsg)
        }
      }, 500)
    }
  }, [state.currentDeviceId, state.isScanning, stopScanning, scanLoop, options])

  // Reset error
  const resetError = useCallback(() => {
    setState(prev => ({ ...prev, error: "" }))
  }, [])

  // Retry permission
  const retryPermission = useCallback(async () => {
    setState(prev => ({ ...prev, hasPermission: null, error: "" }))
    await requestCameraPermission()
  }, [requestCameraPermission])

  // Auto-start scanning if enabled
  useEffect(() => {
    if (options.autoStart) {
      startScanning()
    }

    return () => {
      stopScanning()
    }
  }, [options.autoStart]) // Only run on mount/unmount

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [stopScanning])

  // Actions object
  const actions: QRScannerActions = {
    startScanning,
    stopScanning,
    toggleTorch,
    switchCamera,
    resetError,
    retryPermission,
  }

  // Refs object
  const refs: QRScannerRefs = {
    videoRef,
    canvasRef,
  }

  return {
    // State
    ...state,
    
    // Actions
    ...actions,

    // Refs
    ...refs,
    
    // Additional utilities
    devices: devicesRef.current,
    canSwitchCamera: devicesRef.current.length > 1,
    scanStats: {
      scanRate,
      scanInterval,
      scanCooldown,
      lastScanTime: lastScanTime.current
    }
  }
}