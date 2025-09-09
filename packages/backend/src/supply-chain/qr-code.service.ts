import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as QRCode from 'qrcode';

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark: string;
    light: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

export interface QRCodeResult {
  productId: string;
  traceUrl: string;
  qrCodeDataURL: string;
  qrCodeSVG: string;
  generatedAt: string;
}

@Injectable()
export class QRCodeService {
  private readonly logger = new Logger(QRCodeService.name);
  private readonly baseUrl: string;
  private readonly defaultOptions: QRCodeOptions;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('FRONTEND_URL') || 'https://tracceaqua.com';
    this.defaultOptions = {
      width: 300,
      margin: 2,
      color: {
        dark: '#1e40af', // Blue color matching the app theme
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    };
  }

  async generateQRCode(productId: string, customUrl?: string): Promise<QRCodeResult> {
    try {
      const traceUrl = customUrl || this.getTraceUrl(productId);
      this.logger.log(`Generating QR code for product: ${productId}`);

      const [qrCodeDataURL, qrCodeSVG] = await Promise.all([
        this.generateDataURL(traceUrl),
        this.generateSVG(traceUrl)
      ]);

      return {
        productId,
        traceUrl,
        qrCodeDataURL,
        qrCodeSVG,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Failed to generate QR code for ${productId}: ${error.message}`);
      throw new InternalServerErrorException('Failed to generate QR code');
    }
  }

  async generateBatchQRCodes(productIds: string[]): Promise<QRCodeResult[]> {
    try {
      this.logger.log(`Generating QR codes for ${productIds.length} products`);

      const results = await Promise.all(
        productIds.map(productId => this.generateQRCode(productId))
      );

      return results;
    } catch (error) {
      this.logger.error(`Failed to generate batch QR codes: ${error.message}`);
      throw new InternalServerErrorException('Failed to generate batch QR codes');
    }
  }

  async generateCustomQRCode(
    text: string,
    options: Partial<QRCodeOptions> = {}
  ): Promise<{ dataURL: string; svg: string }> {
    try {
      const mergedOptions = { ...this.defaultOptions, ...options };

      const [dataURL, svg] = await Promise.all([
        this.generateDataURL(text, mergedOptions),
        this.generateSVG(text, mergedOptions)
      ]);

      return { dataURL, svg };
    } catch (error) {
      this.logger.error(`Failed to generate custom QR code: ${error.message}`);
      throw new InternalServerErrorException('Failed to generate custom QR code');
    }
  }

  private async generateDataURL(text: string, options?: QRCodeOptions): Promise<string> {
    const opts = options || this.defaultOptions;

    return QRCode.toDataURL(text, {
      width: opts.width,
      margin: opts.margin,
      color: opts.color,
      errorCorrectionLevel: opts.errorCorrectionLevel
    });
  }

  private async generateSVG(text: string, options?: QRCodeOptions): Promise<string> {
    const opts = options || this.defaultOptions;

    return QRCode.toString(text, {
      type: 'svg',
      width: opts.width,
      margin: opts.margin,
      color: opts.color,
      errorCorrectionLevel: opts.errorCorrectionLevel
    });
  }

  getTraceUrl(productId: string): string {
    return `${this.baseUrl}/trace/${productId}`;
  }

  validateProductId(productId: string): boolean {
    // Basic validation - adjust as needed
    const productIdPattern = /^[A-Z0-9-]{5,50}$/i;
    return productIdPattern.test(productId);
  }

  generatePrintableQRCode(productId: string, productName?: string): Promise<string> {
    // Generate a printable QR code with product information
    const traceUrl = this.getTraceUrl(productId);

    return QRCode.toString(traceUrl, {
      type: 'svg',
      width: 200,
      margin: 3,
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H' // High error correction for printing
    });
  }
}
