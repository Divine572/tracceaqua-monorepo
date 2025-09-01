import { PartialType } from '@nestjs/swagger';
import { CreateConservationRecordDto } from './create-conservation-record.dto';

export class UpdateConservationRecordDto extends PartialType(CreateConservationRecordDto) {}