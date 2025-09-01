import {
    Controller,
    Post,
    Get,
    Delete,
    Param,
    Query,
    UseInterceptors,
    UploadedFile,
    UploadedFiles,
    UseGuards,
    Body,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';


import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiConsumes,
    ApiParam,
    ApiQuery,
    ApiBody,
} from '@nestjs/swagger';
import { IpfsService } from './ipfs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileUploadResponseDto, BatchFileUploadDto } from './dto/upload-file.dto';

@ApiTags('File Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ipfs')
export class IpfsController {
    constructor(private readonly ipfsService: IpfsService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('files'))
    @ApiOperation({
        summary: 'Upload single file to IPFS',
        description: 'Upload a single file to IPFS. Supports images, documents, and data files.',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'File upload with optional metadata',
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'File to upload'
                },
                recordId: {
                    type: 'string',
                    description: 'Associated record ID'
                },
                category: {
                    type: 'string',
                    description: 'File category'
                }
            },
            required: ['file']
        }
    })
    @ApiResponse({
        status: 201,
        description: 'File uploaded successfully',
        type: FileUploadResponseDto,
    })
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body('recordId') recordId?: string,
        @Body('category') category?: string,
    ): Promise<FileUploadResponseDto> {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        return this.ipfsService.uploadFile(file, recordId, category);
    }

    @Post('upload/batch')
    @UseInterceptors(FilesInterceptor('files', 10))
    @ApiOperation({
        summary: 'Upload multiple files to IPFS',
        description: 'Upload multiple files to IPFS in a single request.',
    })
    @ApiConsumes('multipart/form-data')
    @ApiResponse({
        status: 201,
        description: 'Files uploaded successfully',
        type: [FileUploadResponseDto],
    })
    async uploadFiles(
        @UploadedFiles() files: Express.Multer.File[],
        @Body() batchData: BatchFileUploadDto,
    ): Promise<FileUploadResponseDto[]> {
        return this.ipfsService.uploadFiles(files, batchData);
    }

    @Post('upload/json')
    @ApiOperation({
        summary: 'Upload JSON data to IPFS',
        description: 'Upload JSON data directly to IPFS.',
    })
    @ApiResponse({
        status: 201,
        description: 'JSON uploaded successfully',
        type: FileUploadResponseDto,
    })
    async uploadJson(
        @Body() data: {
            data: any;
            filename?: string;
            recordId?: string
        }
    ): Promise<FileUploadResponseDto> {
        return this.ipfsService.uploadJson(
            data.data,
            data.filename || 'data.json',
            data.recordId
        );
    }

    @Get()
    @ApiOperation({
        summary: 'List uploaded files',
        description: 'Get a list of files uploaded to IPFS.',
    })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'recordId', required: false, type: String })
    @ApiQuery({ name: 'category', required: false, type: String })
    async listFiles(
        @Query('limit') limit: string = '10',
        @Query('recordId') recordId?: string,
        @Query('category') category?: string,
    ): Promise<{ files: any[], hasMore: boolean }> {
        const limitNum = Math.min(parseInt(limit) || 10, 100);
        return this.ipfsService.listFiles(limitNum, recordId, category);
    }

    @Get('stats')
    @ApiOperation({
        summary: 'Get storage statistics',
        description: 'Get file storage usage statistics.',
    })
    async getStorageStats(): Promise<any> {
        return this.ipfsService.getStorageStats();
    }

    @Get(':hash')
    @ApiOperation({
        summary: 'Get file information',
        description: 'Get information about a file by IPFS hash.',
    })
    @ApiParam({ name: 'hash', description: 'IPFS hash of the file' })
    async getFileInfo(@Param('hash') hash: string): Promise<any> {
        return this.ipfsService.getFileInfo(hash);
    }

    @Get(':hash/url')
    @ApiOperation({
        summary: 'Get file URL',
        description: 'Get the public URL for accessing a file.',
    })
    @ApiParam({ name: 'hash', description: 'IPFS hash of the file' })
    async getFileUrl(@Param('hash') hash: string): Promise<{ url: string }> {
        return { url: this.ipfsService.getPublicUrl(hash) };
    }

    @Delete(':hash')
    @ApiOperation({
        summary: 'Delete file from IPFS',
        description: 'Remove a file from IPFS (unpin from Pinata).',
    })
    @ApiParam({ name: 'hash', description: 'IPFS hash of the file' })
    @ApiResponse({ status: 204, description: 'File deleted successfully' })
    async deleteFile(@Param('hash') hash: string): Promise<void> {
        return this.ipfsService.deleteFile(hash);
    }
}
