import { Module } from '@nestjs/common';
import { SupplyChainController } from './supply-chain.controller';
import { SupplyChainService } from './supply-chain.service';
import { FilesService } from 'src/files/files.service';

@Module({
  controllers: [SupplyChainController],
  providers: [SupplyChainService, FilesService],

})
export class SupplyChainModule {}


