import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    Body,
    Query,
    Request,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    UploadedFiles,
    ParseIntPipe,
    HttpStatus,
    HttpCode,
    StreamableFile,
    Response,
    Headers,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Response as ExpressResponse } from 'express';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiConsumes,
    ApiParam,
    ApiQuery,
    ApiBody,
    ApiHeader,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

import { FilesService } from './files.service';
import { FileUploadResponseDto, BatchFileUploadDto, BatchFileUploadResponseDto } from './dto/file-upload.dto';

@ApiTags('Files')
@Controller('files')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FilesController {
    constructor(private readonly filesService: FilesService) { }

    // ===== FILE UPLOAD =====

    @Post('upload')
    @ApiOperation({
        summary: 'Upload single file',
        description: 'Upload a single file to IPFS and store metadata',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
                recordId: {
                    type: 'string',
                    description: 'Associated record ID',
                },
                category: {
                    type: 'string',
                    description: 'File category',
                },
            },
            required: ['file'],
        },
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'File uploaded successfully',
        type: FileUploadResponseDto,
    })
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @Request() req,
        @UploadedFile() file: Express.Multer.File,
        @Body() metadata?: {
            recordId?: string;
            category?: string;
        },
    ): Promise<FileUploadResponseDto> {
        return this.filesService.uploadFile(
            file,
            metadata?.recordId,
            metadata?.category,
        );
    }

    @Post('upload/multiple')
    @ApiOperation({
        summary: 'Upload multiple files',
        description: 'Upload multiple files to IPFS and store metadata',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                files: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                },
                recordId: {
                    type: 'string',
                    description: 'Associated record ID',
                },
                category: {
                    type: 'string',
                    description: 'File category',
                },
            },
            required: ['files'],
        },
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Files uploaded successfully',
        type: BatchFileUploadResponseDto,
    })
    @UseInterceptors(FilesInterceptor('files', 20))
    async uploadMultipleFiles(
        @Request() req,
        @UploadedFiles() files: Express.Multer.File[],
        @Body() metadata?: {
            recordId?: string;
            category?: string;
        },
    ): Promise<BatchFileUploadResponseDto> {
        const uploadPromises = files.map(file =>
            this.filesService.uploadFile(
                file,
                metadata?.recordId,
                metadata?.category,
            )
        );

        const results = await Promise.all(uploadPromises);

        return {
            files: results,
            totalSize: results.reduce((sum, file) => sum + file.size, 0),
            totalFiles: results.length,
        };
    }

    @Post('upload/json')
    @ApiOperation({
        summary: 'Upload JSON data',
        description: 'Upload JSON data directly to IPFS',
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'object',
                    description: 'JSON data to upload',
                },
                filename: {
                    type: 'string',
                    description: 'Filename for the JSON file',
                },
                recordId: {
                    type: 'string',
                    description: 'Associated record ID',
                },
            },
            required: ['data', 'filename'],
        },
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'JSON data uploaded successfully',
    })
    async uploadJson(
        @Body() uploadData: {
            data: any;
            filename: string;
            recordId?: string;
        },
    ): Promise<{ hash: string; url: string }> {
        return this.filesService.uploadJson(
            uploadData.data,
            uploadData.filename,
            uploadData.recordId,
        );
    }

    // ===== FILE RETRIEVAL =====

    @Get('list')
    @ApiOperation({
        summary: 'List files',
        description: 'Get list of uploaded files with optional filtering',
    })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'recordId', required: false, type: String })
    @ApiQuery({ name: 'category', required: false, type: String })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Files listed successfully',
    })
    async listFiles(
        @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
        @Query('recordId') recordId?: string,
        @Query('category') category?: string,
    ) {
        return this.filesService.listFiles(limit, recordId, category);
    }

    @Get('info/:ipfsHash')
    @ApiOperation({
        summary: 'Get file info by IPFS hash',
        description: 'Get metadata for a file by its IPFS hash',
    })
    @ApiParam({ name: 'ipfsHash', description: 'IPFS hash of the file' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'File info retrieved successfully',
    })
    async getFileInfo(@Param('ipfsHash') ipfsHash: string) {
        return this.filesService.getFileInfo(ipfsHash);
    }

    @Get('url/:ipfsHash')
    @ApiOperation({
        summary: 'Get public URL for IPFS file',
        description: 'Get the public gateway URL for an IPFS file',
    })
    @ApiParam({ name: 'ipfsHash', description: 'IPFS hash of the file' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Public URL retrieved successfully',
    })
    async getPublicUrl(@Param('ipfsHash') ipfsHash: string) {
        const url = this.filesService.getPublicUrl(ipfsHash);
        return { ipfsHash, url };
    }

    // ===== FILE MANAGEMENT =====

    @Delete(':ipfsHash')
    @ApiOperation({
        summary: 'Delete file from IPFS',
        description: 'Delete a file from IPFS (unpin)',
    })
    @ApiParam({ name: 'ipfsHash', description: 'IPFS hash of the file' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'File deleted successfully',
    })
    @HttpCode(HttpStatus.OK)
    async deleteFile(
        @Param('ipfsHash') ipfsHash: string,
    ): Promise<{ message: string }> {
        await this.filesService.deleteFile(ipfsHash);
        return { message: 'File deleted successfully' };
    }

    // ===== ADMIN OPERATIONS =====

    @Get('admin/stats')
    @ApiOperation({
        summary: 'Get file statistics (admin)',
        description: 'Get file upload and storage statistics (admin only)',
    })
    @Roles(UserRole.ADMIN)
    @UseGuards(RoleGuard)
    async getFileStatistics() {
        // This would need to be implemented in the service
        return {
            totalFiles: 0,
            totalSize: 0,
            totalUploadedToday: 0,
            averageFileSize: 0,
            mostUploadedCategory: 'conservation',
        };
    }

    @Delete('admin/:ipfsHash/force')
    @ApiOperation({
        summary: 'Force delete file (admin)',
        description: 'Force delete any file from IPFS (admin only)',
    })
    @ApiParam({ name: 'ipfsHash', description: 'IPFS hash' })
    @Roles(UserRole.ADMIN)
    @UseGuards(RoleGuard)
    @HttpCode(HttpStatus.OK)
    async forceDeleteFile(
        @Param('ipfsHash') ipfsHash: string,
    ): Promise<{ message: string }> {
        await this.filesService.deleteFile(ipfsHash);
        return { message: 'File force deleted successfully' };
    }
}