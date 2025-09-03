
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

export interface QRScannerOptions {
  video?: HTMLVideoElement
  canvas?: HTMLCanvasElement
  onScan?: (data: string) => void
  onError?: (error: Error) => void
  facingMode?: 'user' | 'environment'
  scanRate?: number // scans per second
  scanCooldown?: number // milliseconds between scans of same code
}

export interface QRDetectionOptions {
  inversionAttempts?: 'dontInvert' | 'onlyInvert' | 'attemptBoth' | 'invertFirst'
  canOverwriteImage?: boolean
}

export class QRScannerUtil {
  private video: HTMLVideoElement | null = null
  private canvas: HTMLCanvasElement | null = null
  private stream: MediaStream | null = null
  private animationFrame: number | null = null
  private isScanning = false
  private lastScanTime = 0
  private lastScannedData = ""
  
  private scanInterval: number
  private scanCooldown: number
  private detectionOptions: QRDetectionOptions

  constructor(private options: QRScannerOptions = {}) {
    this.video = options.video || null
    this.canvas = options.canvas || null
    this.scanInterval = 1000 / (options.scanRate || 10) // Default 10 FPS
    this.scanCooldown = options.scanCooldown || 2000 // 2 second cooldown

    // Default detection options for best performance with TracceAqua QR codes
    this.detectionOptions = {
      inversionAttempts: 'attemptBoth', // Try both normal and inverted for better detection
      canOverwriteImage: true // Allow jsQR to modify image data for better performance
    }
  }

  async startScanning(): Promise<void> {
    try {
      const constraints = {
        video: {
          facingMode: this.options.facingMode || 'environment',
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        }
      }

      this.stream = await navigator.mediaDevices.getUserMedia(constraints)
      
      if (this.video) {
        this.video.srcObject = this.stream

        // Wait for video metadata to load
        await new Promise((resolve, reject) => {
          if (this.video) {
            this.video.onloadedmetadata = resolve
            this.video.onerror = reject
          }
        })
        
        this.video.play()
        this.isScanning = true
        this.lastScannedData = ""
        this.scanLoop()
      }
    } catch (error: any) {
      this.options.onError?.(new Error(`Camera access failed: ${error.message}`))
    }
  }

  stopScanning(): void {
    this.isScanning = false
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
      this.stream = null
    }
    
    this.lastScannedData = ""
  }

  private scanLoop(): void {
    if (!this.isScanning || !this.video || !this.canvas) return

    const now = Date.now()
    
    // Control scan rate to prevent excessive CPU usage
    if (now - this.lastScanTime < this.scanInterval) {
      this.animationFrame = requestAnimationFrame(() => this.scanLoop())
      return
    }
    
    this.lastScanTime = now

    if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
      const ctx = this.canvas.getContext('2d')
      if (ctx) {
        // Set canvas size to match video dimensions
        this.canvas.width = this.video.videoWidth
        this.canvas.height = this.video.videoHeight
        
        // Draw current video frame to canvas
        ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height)
        
        // Detect QR code in the current frame
        this.detectQRCode(ctx)
      }
    }

    this.animationFrame = requestAnimationFrame(() => this.scanLoop())
  }

  private detectQRCode(ctx: CanvasRenderingContext2D): void {
    try {
      // Get image data from canvas
      const imageData = ctx.getImageData(0, 0, this.canvas!.width, this.canvas!.height)

      // Use jsQR to detect QR code
      const qrCode: QRCode | null = jsQR(
        imageData.data,
        imageData.width,
        imageData.height,
        {
          inversionAttempts: this.detectionOptions.inversionAttempts || 'attemptBoth'
        }
      )

      if (qrCode && qrCode.data) {
        const qrData = qrCode.data.trim()

        // Prevent scanning the same code repeatedly
        if (qrData !== this.lastScannedData) {
          this.lastScannedData = qrData

          // Validate if it's a TracceAqua QR code
          const validation = this.validateTracceAquaQR(qrData)

          if (validation.isValid) {
            // Draw detection outline on canvas for visual feedback
            this.drawDetectionOutline(ctx, qrCode)

            // Trigger success callback
            this.options.onScan?.(qrData)

            // Stop scanning after successful detection (optional)
            setTimeout(() => {
              this.lastScannedData = "" // Reset after cooldown
            }, this.scanCooldown)
          } else {
            // Invalid TracceAqua QR code
            this.options.onError?.(new Error(validation.error || 'Invalid TracceAqua QR code'))

            // Reset after short delay to continue scanning
            setTimeout(() => {
              this.lastScannedData = ""
            }, 1000)
          }
        }
      }
    } catch (error: any) {
      // Log detection errors but don't stop scanning
      console.warn('QR detection failed:', error.message)

      // Only trigger error callback for critical failures
      if (error.message.includes('Canvas') || error.message.includes('ImageData')) {
        this.options.onError?.(new Error('QR detection system error'))
      }
    }
  }

  private drawDetectionOutline(ctx: CanvasRenderingContext2D, qrCode: QRCode): void {
    try {
      // Draw a green outline around detected QR code
      const { topLeftCorner, topRightCorner, bottomLeftCorner, bottomRightCorner } = qrCode.location

      ctx.strokeStyle = '#10B981' // Green color
      ctx.lineWidth = 4
      ctx.beginPath()

      // Draw outline connecting the four corners
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
      // Silently fail outline drawing to not interrupt scanning
      console.warn('Failed to draw QR detection outline:', error)
    }
  }

  private validateTracceAquaQR(qrData: string): {
    isValid: boolean
    productId?: string
    error?: string
  } {
    try {
      let productId: string

      // Check if it's a TracceAqua URL
      if (qrData.includes('trace/')) {
        try {
          const url = new URL(qrData)
          const pathParts = url.pathname.split('/')
          const traceIndex = pathParts.indexOf('trace')

          if (traceIndex !== -1 && pathParts.length > traceIndex + 1) {
            productId = pathParts[traceIndex + 1]
          } else {
            return { isValid: false, error: 'Invalid TracceAqua URL format' }
          }
        } catch (urlError) {
          return { isValid: false, error: 'Invalid URL format' }
        }
      } else if (qrData.match(/^[A-Z0-9-_]+$/i)) {
        // Direct product ID format (letters, numbers, hyphens, underscores only)
        productId = qrData.toUpperCase()
      } else {
        return { isValid: false, error: 'Not a TracceAqua QR code format' }
      }

      // Validate product ID format and length
      if (!productId || productId.length < 3 || productId.length > 50) {
        return { isValid: false, error: 'Invalid product ID length' }
      }

      // Additional TracceAqua-specific validation
      if (!this.isValidProductIdFormat(productId)) {
        return { isValid: false, error: 'Invalid TracceAqua product ID format' }
      }

      return { isValid: true, productId }
    } catch (error: any) {
      return { isValid: false, error: `QR validation error: ${error.message}` }
    }
  }

  private isValidProductIdFormat(productId: string): boolean {
    // TracceAqua product ID validation rules
    // Examples: FISH-2024-001, SHRIMP-2024-ABC123, etc.

    // Must contain at least one letter and one number/hyphen
    const hasLetter = /[A-Z]/i.test(productId)
    const hasNumberOrHyphen = /[0-9-]/i.test(productId)

    // Should not contain special characters except hyphens and underscores
    const validChars = /^[A-Z0-9-_]+$/i.test(productId)

    // Should not start or end with hyphen/underscore
    const validStructure = !/^[-_]|[-_]$/.test(productId)

    return hasLetter && hasNumberOrHyphen && validChars && validStructure
  }

  async toggleTorch(): Promise<void> {
    if (!this.stream) return
    
    try {
      const track = this.stream.getVideoTracks()[0]
      const capabilities = track.getCapabilities?.() as ExtendedMediaTrackCapabilities
      
      if (capabilities?.torch) {
        const settings = track.getSettings() as ExtendedMediaTrackSettings
        await track.applyConstraints({
          advanced: [{ torch: !settings.torch }] as any
        })
      } else {
        throw new Error('Torch not supported on this device')
      }
    } catch (error: any) {
      this.options.onError?.(new Error(`Failed to toggle torch: ${error.message}`))
    }
  }

  async switchCamera(): Promise<void> {
    const currentFacingMode = this.options.facingMode || 'environment'
    this.options.facingMode = currentFacingMode === 'user' ? 'environment' : 'user'
    
    if (this.isScanning) {
      this.stopScanning()
      // Wait a moment before restarting to ensure camera is released
      setTimeout(() => {
        this.startScanning()
      }, 500)
    }
  }

  // Enhanced camera capabilities detection
  getCameraCapabilities(): ExtendedMediaTrackCapabilities | null {
    if (!this.stream) return null
    
    const track = this.stream.getVideoTracks()[0]
    return track.getCapabilities?.() as ExtendedMediaTrackCapabilities || null
  }

  getCameraSettings(): ExtendedMediaTrackSettings | null {
    if (!this.stream) return null
    
    const track = this.stream.getVideoTracks()[0]
    return track.getSettings?.() as ExtendedMediaTrackSettings || null
  }

  // Get supported camera modes
  getSupportedFacingModes(): string[] {
    const capabilities = this.getCameraCapabilities()
    return capabilities?.facingMode || ['environment']
  }

  // Check if torch is supported
  isTorchSupported(): boolean {
    const capabilities = this.getCameraCapabilities()
    return !!(capabilities?.torch)
  }

  // Get current torch state
  isTorchEnabled(): boolean {
    const settings = this.getCameraSettings()
    return !!(settings?.torch)
  }

  // Update detection options
  updateDetectionOptions(options: Partial<QRDetectionOptions>): void {
    this.detectionOptions = { ...this.detectionOptions, ...options }
  }

  // Get scan statistics
  getScanStatistics(): {
    isScanning: boolean
    hasStream: boolean
    videoReady: boolean
    lastScanTime: number
    scanInterval: number
    scanCooldown: number
  } {
    return {
      isScanning: this.isScanning,
      hasStream: !!this.stream,
      videoReady: this.video?.readyState === this.video?.HAVE_ENOUGH_DATA || false,
      lastScanTime: this.lastScanTime,
      scanInterval: this.scanInterval,
      scanCooldown: this.scanCooldown
    }
  }
}

// Standalone QR detection function for one-time use
export function detectQRCodeFromImageData(
  imageData: ImageData,
  options: QRDetectionOptions = {}
): { qrCode: QRCode | null; isTracceAqua: boolean; productId?: string; error?: string } {
  try {
    const qrCode = jsQR(
      imageData.data,
      imageData.width,
      imageData.height,
      {
        inversionAttempts: options.inversionAttempts || 'attemptBoth'
      }
    )

    if (!qrCode || !qrCode.data) {
      return { qrCode: null, isTracceAqua: false }
    }

    // Validate TracceAqua QR code
    const validation = validateTracceAquaQR(qrCode.data)

    return {
      qrCode,
      isTracceAqua: validation.isValid,
      productId: validation.productId,
      error: validation.error
    }
  } catch (error: any) {
    return {
      qrCode: null,
      isTracceAqua: false,
      error: `Detection failed: ${error.message}`
    }
  }
}

// Validation utility for TracceAqua QR codes (exported for reuse)
export function validateTracceAquaQR(qrData: string): { 
  isValid: boolean
  productId?: string
  error?: string 
} {
  try {
    let productId: string

    // Clean the QR data
    const cleanData = qrData.trim()

    // Check if it's a TracceAqua URL
    if (cleanData.includes('trace/')) {
      try {
        const url = new URL(cleanData)

        // Check if it's from a TracceAqua domain
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
      return { isValid: false, error: 'Not a recognized TracceAqua QR code format' }
    }

    // Validate product ID
    if (!productId || productId.length < 3 || productId.length > 50) {
      return { isValid: false, error: 'Product ID length must be between 3-50 characters' }
    }

    // TracceAqua specific validation
    const hasLetter = /[A-Z]/i.test(productId)
    const hasNumberOrHyphen = /[0-9-]/i.test(productId)
    const validChars = /^[A-Z0-9-_]+$/i.test(productId)
    const validStructure = !/^[-_]|[-_]$/.test(productId)

    if (!hasLetter || !hasNumberOrHyphen || !validChars || !validStructure) {
      return { isValid: false, error: 'Invalid product ID format for TracceAqua' }
    }

    return { isValid: true, productId }
  } catch (error: any) {
    return { isValid: false, error: `Validation error: ${error.message}` }
  }
}

// Sound utility for successful QR detection
export function playSuccessSound(frequency: number = 800, duration: number = 200): void {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    // Create a pleasant success sound
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
    oscillator.frequency.setValueAtTime(frequency * 1.2, audioContext.currentTime + duration / 1000 / 2)
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration / 1000)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + duration / 1000)
  } catch (error) {
    console.warn('Could not play success sound:', error)
  }
}

// Error sound for failed detection
export function playErrorSound(): void {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Create a subtle error sound
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime)
    oscillator.frequency.setValueAtTime(300, audioContext.currentTime + 0.1)

    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.05, audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.15)
  } catch (error) {
    console.warn('Could not play error sound:', error)
  }
}