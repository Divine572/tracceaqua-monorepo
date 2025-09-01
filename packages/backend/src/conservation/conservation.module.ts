import { Module } from '@nestjs/common';
import { ConservationService } from './conservation.service';
import { ConservationController } from './conservation.controller';

@Module({
  providers: [ConservationService],
  controllers: [ConservationController]
})
export class ConservationModule {}
