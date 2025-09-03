import jsQR from 'jsqr'

export interface QRScannerOptions {
  video?: HTMLVideoElement
  canvas?: HTMLCanvasElement
  onScan?: (data: string) => void
  onError?: (error: Error) => void
  facingMode?: 'user' | 'environment'
  scanRate?: number // scans per second
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
  private scanCooldown = 1000 // 1 second cooldown between scans

  constructor(private options: QRScannerOptions = {}) {
    this.video = options.video || null
    this.canvas = options.canvas || null
    this.scanInterval = 1000 / (options.scanRate || 10) // Default 10 FPS
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
        await new Promise((resolve) => {
          if (this.video) {
            this.video.onloadedmetadata = resolve
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
    
    // Control scan rate
    if (now - this.lastScanTime < this.scanInterval) {
      this.animationFrame = requestAnimationFrame(() => this.scanLoop())
      return
    }
    
    this.lastScanTime = now

    if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
      const ctx = this.canvas.getContext('2d')
      if (ctx) {
        // Set canvas size to match video
        this.canvas.width = this.video.videoWidth
        this.canvas.height = this.video.videoHeight
        
        // Draw video frame to canvas
        ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height)
        
        // Get image data and scan for QR code
        const imageData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
        const qrResult = this.detectQRCode(imageData)
        
        if (qrResult && qrResult !== this.lastScannedData) {
          this.lastScannedData = qrResult
          this.options.onScan?.(qrResult)
          
          // Implement cooldown to prevent multiple scans of the same code
          setTimeout(() => {
            this.lastScannedData = ""
          }, this.scanCooldown)
        }
      }
    }
    
    this.animationFrame = requestAnimationFrame(() => this.scanLoop())
  }

  private detectQRCode(imageData: ImageData): string | null {
    try {
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert"
      })
      
      return code ? code.data : null
    } catch (error) {
      console.warn('QR detection failed:', error)
      return null
    }
  }

  async toggleTorch(): Promise<void> {
    if (!this.stream) return
    
    try {
      const track = this.stream.getVideoTracks()[0]
      const capabilities = track.getCapabilities?.()
      
      if ((capabilities && (capabilities as any).torch)) {
        const settings = track.getSettings()
        await track.applyConstraints({
          advanced: [{ torch: !(settings as any).torch }] as any
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
      setTimeout(() => {
        this.startScanning()
      }, 500)
    }
  }

  // Get current camera capabilities
  getCameraCapabilities(): MediaTrackCapabilities | null {
    if (!this.stream) return null
    
    const track = this.stream.getVideoTracks()[0]
    return track.getCapabilities?.() || null
  }

  // Get current camera settings  
  getCameraSettings(): MediaTrackSettings | null {
    if (!this.stream) return null
    
    const track = this.stream.getVideoTracks()[0]
    return track.getSettings?.() || null
  }
}

// Validation utility for TracceAqua QR codes
export function validateTracceAquaQR(qrData: string): { 
  isValid: boolean
  productId?: string
  error?: string 
} {
  try {
    let productId: string

    // Check if it's a TracceAqua URL
    if (qrData.includes('trace/')) {
      const url = new URL(qrData)
      const pathParts = url.pathname.split('/')
      const traceIndex = pathParts.indexOf('trace')
      
      if (traceIndex !== -1 && pathParts.length > traceIndex + 1) {
        productId = pathParts[traceIndex + 1]
      } else {
        return { isValid: false, error: 'Invalid TracceAqua URL format' }
      }
    } else if (qrData.match(/^[A-Z0-9-_]+$/i)) {
      // Direct product ID format
      productId = qrData.toUpperCase()
    } else {
      return { isValid: false, error: 'Not a TracceAqua QR code' }
    }

    // Validate product ID format
    if (!productId || productId.length < 3) {
      return { isValid: false, error: 'Invalid product ID format' }
    }

    return { isValid: true, productId }
  } catch (error) {
    return { isValid: false, error: 'Invalid QR code data' }
  }
}

// Sound utility for scan feedback
export function playSuccessSound(): void {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    // Create a pleasant beep sound
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.2)
  } catch (error) {
    console.warn('Could not play success sound:', error)
  }
}