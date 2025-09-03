"use client"

import React, { useState, useRef } from 'react'
import QRCode from 'react-qr-code'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Download, Share2, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

interface QRGeneratorProps {
  productId: string
  productName?: string
  organizationName?: string
  size?: number
  className?: string
}

export function QRGenerator({ 
  productId, 
  productName = "Seafood Product", 
  organizationName,
  size = 256,
  className = "" 
}: QRGeneratorProps) {
  const [copied, setCopied] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)
  
  const traceUrl = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/trace/${productId}`
  
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(traceUrl)
      setCopied(true)
      toast.success("Trace URL copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Failed to copy URL")
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Trace ${productName}`,
          text: `Check the journey of this seafood product: ${productName}`,
          url: traceUrl,
        })
      } catch (error) {
        // User cancelled or share failed
        handleCopyUrl()
      }
    } else {
      handleCopyUrl()
    }
  }

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return
    
    // Create canvas and context
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size (higher resolution for better quality)
    const scale = 4
    canvas.width = size * scale
    canvas.height = size * scale
    ctx.scale(scale, scale)
    
    // Convert SVG to canvas
    const svgData = new XMLSerializer().serializeToString(svg)
    const img = new Image()
    
    img.onload = () => {
      // White background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, size, size)
      
      // Draw QR code
      ctx.drawImage(img, 0, 0, size, size)
      
      // Download
      const link = document.createElement('a')
      link.download = `tracceaqua-qr-${productId}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      
      toast.success("QR Code downloaded successfully")
    }
    
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    img.src = url
  }

  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold text-blue-900">
          Product QR Code
        </CardTitle>
        <CardDescription>
          Scan to trace {productName}
        </CardDescription>
        {organizationName && (
          <Badge variant="secondary" className="mx-auto">
            {organizationName}
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="flex flex-col items-center space-y-6">
        {/* QR Code */}
        <div 
          ref={qrRef}
          className="bg-white p-4 rounded-lg border-4 border-blue-100 shadow-sm"
        >
          <QRCode
            value={traceUrl}
            size={size}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            viewBox="0 0 256 256"
          />
        </div>

        {/* Product ID */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Product ID</p>
          <Badge variant="outline" className="font-mono">
            {productId}
          </Badge>
        </div>

        {/* Trace URL */}
        <div className="w-full">
          <p className="text-sm text-muted-foreground mb-2">Trace URL</p>
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border text-sm">
            <span className="flex-1 truncate font-mono text-xs">
              {traceUrl}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopyUrl}
              className="h-8 w-8 p-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 w-full">
          <Button
            onClick={downloadQR}
            variant="outline"
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button
            onClick={handleShare}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-center text-sm text-muted-foreground">
          <p className="mb-1">
            📱 <strong>For Mobile:</strong> Point camera at QR code
          </p>
          <p>
            💻 <strong>For Desktop:</strong> Share the trace URL
          </p>
        </div>
      </CardContent>
    </Card>
  )
}