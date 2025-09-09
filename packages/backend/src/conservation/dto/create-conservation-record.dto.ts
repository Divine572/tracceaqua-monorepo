import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsObject, IsArray, IsOptional, IsBoolean, MaxLength, MinLength } from 'class-validator';

export class CreateConservationRecordDto {
  @ApiProperty({
    description: 'Unique sampling identifier',
    example: 'SAMPLE-2024-001',
    minLength: 5,
    maxLength: 50
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(50)
  samplingId: string;

  @ApiProperty({
    description: 'Location and environmental data',
    example: {
      latitude: 6.5244,
      longitude: 3.3792,
      waterBody: 'Lagos Lagoon',
      depth: 5.2,
      temperature: 28.5,
      salinity: 15.2,
      pH: 7.8,
      oxygenLevel: 6.5,
      turbidity: 12.3
    }
  })
  @IsObject()
  @IsNotEmpty()
  locationData: any;

  @ApiProperty({
    description: 'Species identification and count data',
    example: {
      primarySpecies: 'Crassostrea gasar',
      commonName: 'West African Oyster',
      totalCount: 245,
      sizeDistribution: {
        small: 45,
        medium: 120,
        large: 80
      },
      condition: 'Healthy',
      reproductiveStage: 'Mature'
    }
  })
  @IsObject()
  @IsNotEmpty()
  speciesData: any;

  @ApiProperty({
    description: 'Sampling methods and procedures',
    example: {
      method: 'Quadrat sampling',
      quadratSize: '1m x 1m',
      numberOfQuadrats: 10,
      samplingDuration: 120,
      equipment: ['GPS', 'Water quality meter', 'Collection bags'],
      protocol: 'Standard benthic sampling protocol'
    }
  })
  @IsObject()
  @IsNotEmpty()
  samplingData: any;

  @ApiPropertyOptional({
    description: 'Laboratory test results',
    example: {
      microbiology: {
        totalColiformCount: 150,
        eColiCount: 5,
        salmonellaPresent: false
      },
      chemistry: {
        heavyMetals: {
          mercury: 0.02,
          lead: 0.01,
          cadmium: 0.005
        },
        pesticides: 'Not detected'
      }
    }
  })
  @IsOptional()
  @IsObject()
  labTests?: any;

  @ApiPropertyOptional({
    description: 'IPFS hashes of uploaded files',
    example: ['QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fileHashes?: string[];

  @ApiPropertyOptional({
    description: 'Additional notes from the researcher',
    example: 'High oyster density observed. Water quality within acceptable parameters.',
    maxLength: 1000
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  researcherNotes?: string;

  @ApiPropertyOptional({
    description: 'Weather conditions during sampling',
    example: 'Clear sky, light breeze, 29°C air temperature',
    maxLength: 200
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  weatherConditions?: string;

  @ApiPropertyOptional({
    description: 'Tidal conditions during sampling',
    example: 'High tide, 1.2m above mean sea level',
    maxLength: 200
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  tidalConditions?: string;

  @ApiPropertyOptional({
    description: 'Whether to upload the complete record data to IPFS',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  uploadToIPFS?: boolean;
}