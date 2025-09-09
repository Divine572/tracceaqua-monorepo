import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsObject, IsArray, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class UpdateConservationRecordDto {
    @ApiPropertyOptional({
        description: 'Updated location and environmental data'
    })
    @IsOptional()
    @IsObject()
    locationData?: any;

    @ApiPropertyOptional({
        description: 'Updated species identification and count data'
    })
    @IsOptional()
    @IsObject()
    speciesData?: any;

    @ApiPropertyOptional({
        description: 'Updated sampling methods and procedures'
    })
    @IsOptional()
    @IsObject()
    samplingData?: any;

    @ApiPropertyOptional({
        description: 'Updated laboratory test results'
    })
    @IsOptional()
    @IsObject()
    labTests?: any;

    @ApiPropertyOptional({
        description: 'Updated IPFS hashes of uploaded files'
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    fileHashes?: string[];

    @ApiPropertyOptional({
        description: 'Updated additional notes from the researcher',
        maxLength: 1000
    })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    researcherNotes?: string;

    @ApiPropertyOptional({
        description: 'Updated weather conditions during sampling',
        maxLength: 200
    })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    weatherConditions?: string;

    @ApiPropertyOptional({
        description: 'Updated tidal conditions during sampling',
        maxLength: 200
    })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    tidalConditions?: string;

    @ApiPropertyOptional({
        description: 'Whether to update the IPFS data',
        example: true
    })
    @IsOptional()
    @IsBoolean()
    updateIPFS?: boolean;
}