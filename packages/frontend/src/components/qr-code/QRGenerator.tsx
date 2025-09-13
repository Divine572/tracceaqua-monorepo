'use client'

import { useState, useEffect } from 'react'
import QRCode from 'react-qr-code'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Download, Share, Copy, QrCode } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QRGeneratorProps {
  productId?: string
  batchId?: string
  className?: string
}

export function QRGenerator({ productId, batchId, className }: QRGeneratorProps) {
  const [qrData, setQrData] = useState('')
  const [qrSize, setQrSize] = useState(256)
  const [qrLevel, setQrLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M')
  const { toast } = useToast()

  // Generate QR data URL
  const generateQRData = (id: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return `${baseUrl}/trace/${id}`
  }

  // Initialize QR data
  useEffect(() => {
    if (productId) {
      setQrData(generateQRData(productId))
    } else if (batchId) {
      setQrData(generateQRData(batchId))
    }
  }, [productId, batchId])

  const handleCustomQR = (customId: string) => {
    if (customId.trim()) {
      setQrData(generateQRData(customId.trim()))
    }
  }

  const downloadQR = () => {
    const svg = document.getElementById('qr-code-svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    canvas.width = qrSize
    canvas.height = qrSize

    img.onload = () => {
      ctx?.drawImage(img, 0, 0)
      const link = document.createElement('a')
      link.download = `tracceaqua-qr-${Date.now()}.png`
      link.href = canvas.toDataURL()
      link.click()
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  const copyQRUrl = async () => {
    try {
      await navigator.clipboard.writeText(qrData)
      toast({
        title: "Copied!",
        description: "QR code URL copied to clipboard.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy URL to clipboard.",
        variant: "destructive",
      })
    }
  }

  const shareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'TracceAqua Product Trace',
          text: 'Scan this QR code to trace the product journey',
          url: qrData,
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      copyQRUrl()
    }
  }

  return (
    <Card className={cn("w-full max-w-lg", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          QR Code Generator
        </CardTitle>
        <CardDescription>
          Generate QR codes for product traceability
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Custom Product ID Input */}
        {!productId && !batchId && (
          <div className="space-y-2">
            <Label htmlFor="productId">Product/Batch ID</Label>
            <Input
              id="productId"
              placeholder="Enter product or batch ID"
              onChange={(e) => handleCustomQR(e.target.value)}
            />
          </div>
        )}

        {/* QR Code Display */}
        {qrData && (
          <div className="space-y-4">
            <div className="flex justify-center p-6 bg-white rounded-lg border">
              <QRCode
                id="qr-code-svg"
                value={qrData}
                size={qrSize}
                level={qrLevel}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              />
            </div>

            {/* QR Configuration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="size">Size</Label>
                <Select value={qrSize.toString()} onValueChange={(value) => setQrSize(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="128">128px</SelectItem>
                    <SelectItem value="256">256px</SelectItem>
                    <SelectItem value="512">512px</SelectItem>
                    <SelectItem value="1024">1024px</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Error Correction</Label>
                <Select value={qrLevel} onValueChange={(value) => setQrLevel(value as 'L' | 'M' | 'Q' | 'H')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Low (7%)</SelectItem>
                    <SelectItem value="M">Medium (15%)</SelectItem>
                    <SelectItem value="Q">Quartile (25%)</SelectItem>
                    <SelectItem value="H">High (30%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* URL Display */}
            <div className="space-y-2">
              <Label>Trace URL</Label>
              <div className="flex items-center space-x-2">
                <Input value={qrData} readOnly className="font-mono text-sm" />
                <Button size="icon" variant="outline" onClick={copyQRUrl}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={downloadQR} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download PNG
              </Button>
              <Button onClick={shareQR} variant="outline" className="flex-1">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}