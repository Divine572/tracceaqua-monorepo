import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as QRCode from 'qrcode';

@Injectable()
export class QRCodeService {
  constructor(private configService: ConfigService) {}

  async generateQRCode(productId: string): Promise<{ qrCode: string; url: string; dataUri: string }> {
    const baseUrl = this.configService.get<string>('FRONTEND_URL') || 'https://tracceaqua.com';
    const url = `${baseUrl}/trace/${productId}`;
    
    try {
      // Generate QR code as data URI (base64 encoded PNG)
      const dataUri = await QRCode.toDataURL(url, {
        errorCorrectionLevel: 'M',
        margin: 1,
        color: {
          dark: '#1e40af', // Blue color for TracceAqua branding
          light: '#ffffff',
        },
        width: 512,
      });

      // Generate QR code as SVG string
      const svgString = await QRCode.toString(url, {
        type: 'svg',
        errorCorrectionLevel: 'M',
        margin: 1,
        color: {
          dark: '#1e40af',
          light: '#ffffff',
        },
        width: 512,
      });

      return {
        qrCode: svgString,
        url,
        dataUri,
      };
    } catch (error: any) {
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  }

  async generateBatchQRCodes(productIds: string[]): Promise<Array<{
    productId: string;
    qrCode: string;
    url: string;
    dataUri: string;
    error?: string;
  }>> {
    const results: Array<{
      productId: string;
      qrCode: string;
      url: string;
      dataUri: string;
      error?: string;
    }> = [];
    
    for (const productId of productIds) {
      try {
        const qrData = await this.generateQRCode(productId);
        results.push({
          productId,
          ...qrData,
        });
      } catch (error: any) {
        results.push({
          productId,
          qrCode: '',
          url: '',
          dataUri: '',
          error: error.message,
        });
      }
    }
    
    return results;
  }
}

