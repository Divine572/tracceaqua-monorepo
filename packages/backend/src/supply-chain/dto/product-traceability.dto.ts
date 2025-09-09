import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductTraceabilityDto {
  @ApiProperty({
    description: 'Product information'
  })
  product: {
    id: string;
    name?: string;
    species: string;
    sourceType: string;
    description?: string;
    currentStage: string;
    sustainabilityScore?: number;
    certifications?: string[];
    batchId?: string;
    tags?: string[];
  };

  @ApiProperty({
    description: 'Product journey through supply chain'
  })
  journey: Array<{
    stage: string;
    timestamp: Date;
    location?: string;
    stakeholder: {
      name: string;
      organization: string;
      role: string;
      address: string;
    };
    notes?: string;
    data?: any;
    fileHashes?: string[];
  }>;

  @ApiProperty({
    description: 'Metadata about the traceability record'
  })
  metadata: {
    createdAt: Date;
    lastUpdated: Date;
    totalStages: number;
    daysInSupplyChain: number;
    dataHash?: string;
    blockchainHash?: string;
  };
}
