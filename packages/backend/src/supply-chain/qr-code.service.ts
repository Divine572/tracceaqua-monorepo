
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { GenerateQRCodeDto, QRCodeResponseDto } from './dto/supply-chain.dto';

@Injectable()
export class QRCodeService {
  private readonly logger = new Logger(QRCodeService.name);

  constructor(private configService: ConfigService) { }

  async generateQRCode(
    productId: string,
    qrDto: GenerateQRCodeDto
  ): Promise<QRCodeResponseDto> {
    try {
      this.logger.log(`Generating QR code for product ${productId} of type ${qrDto.qrType}`);

      const qrCodeId = uuidv4();
      const baseUrl = this.configService.get('FRONTEND_URL') || 'https://tracceaqua.vercel.app';

      // Generate tracing URL based on QR type
      let tracingUrl: string;
      switch (qrDto.qrType) {
        case 'trace':
          tracingUrl = `${baseUrl}/trace/${productId}?qr=${qrCodeId}`;
          break;
        case 'verify':
          tracingUrl = `${baseUrl}/verify/${productId}?qr=${qrCodeId}`;
          break;
        case 'feedback':
          tracingUrl = `${baseUrl}/feedback/${productId}?qr=${qrCodeId}`;
          break;
        default:
          tracingUrl = `${baseUrl}/trace/${productId}?qr=${qrCodeId}`;
      }

      // Add display name to URL if provided
      if (qrDto.displayName) {
        tracingUrl += `&name=${encodeURIComponent(qrDto.displayName)}`;
      }

      // Generate QR code image
      const qrCodeImage = await QRCode.toDataURL(tracingUrl, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        width: 256,
      });

      const result: QRCodeResponseDto = {
        qrCodeData: tracingUrl,
        qrCodeImage,
        tracingUrl,
        qrCodeId,
        expiryDate: qrDto.expiryDate ? new Date(qrDto.expiryDate) : undefined
      };

      this.logger.log(`✅ QR code generated successfully for product ${productId}`);
      return result;

    } catch (error) {
      this.logger.error(`Failed to generate QR code for product ${productId}:`, error);
      throw error;
    }
  }
}