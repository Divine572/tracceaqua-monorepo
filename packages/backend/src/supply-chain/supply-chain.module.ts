import { PrismaModule } from './../prisma/prisma.module';
import { FilesModule } from './../files/files.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// import { SupplyChainController } from './supply-chain.controller';
import { SupplyChainService } from './supply-chain.service';
import { ConsumerFeedbackService } from './consumer-feedback.service';
import { QRCodeService } from './qr-code.service';
import { PublicStatisticsService } from './public-statistics.service';



@Module({
  imports: [ConfigModule, PrismaModule, FilesModule],
  // controllers: [SupplyChainController],
  providers: [
    SupplyChainService,
    ConsumerFeedbackService,
    QRCodeService,
    PublicStatisticsService,
  ],
  exports: [
    SupplyChainService,
    ConsumerFeedbackService,
    QRCodeService,
    PublicStatisticsService,
  ],
})
export class SupplyChainModule { }