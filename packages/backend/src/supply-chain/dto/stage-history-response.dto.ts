import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StageHistoryResponseDto {
  @ApiProperty({ description: 'Stage history entry ID' })
  id: string;

  @ApiProperty({ description: 'Stage name' })
  stage: string;

  @ApiPropertyOptional({ description: 'Previous stage name' })
  previousStage: string | null;

  @ApiProperty({ description: 'User who made the update' })
  updatedBy: string;

  @ApiProperty({ description: 'When the stage was updated' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Notes about the stage transition' })
  notes: string | null;

  @ApiPropertyOptional({ description: 'Stage-specific data' })
  stageData: any;

  @ApiProperty({ description: 'File hashes for this stage' })
  fileHashes: string[];

  @ApiPropertyOptional({ description: 'Location where update occurred' })
  location: string | null;

  @ApiPropertyOptional({ description: 'Quality grade at this stage' })
  qualityGrade: string | null;

  @ApiPropertyOptional({ description: 'Test results for this stage' })
  testResults: any;

  @ApiPropertyOptional({ description: 'Blockchain transaction hash' })
  blockchainHash: string | null;

  @ApiProperty({ description: 'Stakeholder who made the update' })
  stakeholder: {
    id: string;
    name?: string;
    organization: string | null;
    role: string;
  };
}
