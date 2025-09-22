"use client";

import { useState, useEffect } from "react";
import Cookies from "universal-cookie";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Share, Copy, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface QRGeneratorProps {
  productId?: string;
  batchId?: string;
  className?: string;
  displayName?: string;
}

export function QRGenerator({
  productId,
  batchId,
  className,
  displayName,
}: QRGeneratorProps) {
  const [qrData, setQrData] = useState("");
  const [qrSize, setQrSize] = useState(256);
  const [qrLevel, setQrLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [traceUrl, setTraceUrl] = useState<string | null>(null);

  const cookie = new Cookies();

  const userToken = cookie.get("user-token");

  const generateQrCode = async (id: string | undefined) => {
    console.log(id);

    if (!id) return;

    const qrCodeData = {
      qrType: "trace",
      displayName: displayName,
      expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/supply-chain/public/qr/${productId}`,
        {
          method: "POST",
          body: JSON.stringify(qrCodeData),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (!response.ok) throw new Error();

      const result = await response.json();
      const data = result.data;
      setTraceUrl(data.tracingUrl);
      setQrCodeImage(data.qrCodeImage);
      console.log("url: ", traceUrl)
      console.log("img: ", qrCodeImage)
    } catch (error) {
      console.error(error);
    }
  };

  // Initialize QR data
  useEffect(() => {
    if (productId) generateQrCode(productId);
  }, [productId]);

  const copyQRUrl = async () => {
    if (!traceUrl) return;
    try {
      await navigator.clipboard.writeText(traceUrl);
      toast.success("QR code URL copied to clipboard");
    } catch {
      toast.success("Failed to copy url");
    }
  };

  const shareQR = async () => {
    if (!traceUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "TracceAqua Product Trace",
          text: "Scan this QR code to trace the product journey",
          url: qrData,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      copyQRUrl();
    }
  };

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
        {!qrCodeImage && (
          <div className="text-center">
            <Button onClick={() => generateQrCode(productId || undefined)}>
              Generate QR code
            </Button>
          </div>
        )}

        {/* QR Code Display */}
        {qrCodeImage && (
          <div className="space-y-4 text-center">
            <img
              src={qrCodeImage}
              alt="QR Code"
              className="mx-auto rounded-lg border bg-white p-4"
            />

            {/* Trace URL */}
            <div className="space-y-2">
              <Label>Trace URL</Label>
              <div className="flex items-center space-x-2">
                <Input
                  value={traceUrl || ""}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button size="icon" variant="outline" onClick={copyQRUrl}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => {
                  if (!qrCodeImage) return;
                  const link = document.createElement("a");
                  link.href = qrCodeImage;
                  link.download = `tracceaqua-qr-${Date.now()}.png`;
                  link.click();
                }}
                className="flex-1"
              >
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
  );
}
