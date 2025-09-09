import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinataSDK } from 'pinata';
import { FileUploadResponseDto, BatchFileUploadDto } from './dto/files.dto';

@Injectable()
export class FilesService {
    private readonly logger = new Logger(FilesService.name);
    private readonly pinata: PinataSDK;
    private readonly gatewayUrl: string;

    constructor(private configService: ConfigService) {
        const pinataJwt = this.configService.get<string>('PINATA_JWT');
        this.gatewayUrl = this.configService.get<string>('PINATA_GATEWAY_URL') || 'https://gateway.pinata.cloud';

        if (!pinataJwt) {
            throw new Error('PINATA_JWT environment variable is required');
        }

        this.pinata = new PinataSDK({
            pinataJwt,
            pinataGateway: this.gatewayUrl,
        });

        this.logger.log('File service initialized with Pinata');
    }

  /**
   * Upload a single file to IPFS
   */
    async uploadFile(
        file: Express.Multer.File,
        recordId?: string,
        category?: string
    ): Promise<FileUploadResponseDto> {
        try {
            this.logger.log(`Uploading file: ${file.originalname}`);

            // Validate the file
            this.validateFile(file);

            // Create File object from buffer
            const fileData = new File([new Uint8Array(file.buffer)], file.originalname, {
                type: file.mimetype,
            });

            // Prepare metadata
            const metadata = {
                name: file.originalname,
                keyvalues: {
                    originalName: file.originalname,
                    mimeType: file.mimetype,
                    size: file.size.toString(),
                    uploadedAt: new Date().toISOString(),
                    service: 'tracceaqua',
                    category: category || this.detectCategory(file),
                    recordId: recordId || '',
                },
            };

            // Upload to Pinata
            const result = await this.pinata.upload.public.file(fileData, { metadata });

            const response: FileUploadResponseDto = {
                hash: result.cid,
                url: `${this.gatewayUrl}/ipfs/${result.cid}`,
                filename: file.originalname,
                size: file.size,
                mimeType: file.mimetype,
                uploadedAt: new Date(),
                recordId,
                category: category || this.detectCategory(file),
            };

            this.logger.log(`File uploaded successfully: ${result.cid}`);
            return response;

        } catch (error) {
            this.logger.error(`File upload failed: ${error.message}`, error.stack);
            throw new InternalServerErrorException(`File upload failed: ${error.message}`);
        }
    }

    /**
     * Upload multiple files to IPFS
     */
    async uploadFiles(
        files: Express.Multer.File[],
        batchData?: BatchFileUploadDto
    ): Promise<FileUploadResponseDto[]> {
        if (!files || files.length === 0) {
            throw new BadRequestException('No files provided');
        }

        this.logger.log(`Uploading ${files.length} files to IPFS`);

        const results: FileUploadResponseDto[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const category = batchData?.category || this.detectCategory(file);

            try {
                const result = await this.uploadFile(file, batchData?.recordId, category);
                results.push(result);
            } catch (error) {
                this.logger.error(`Failed to upload file ${file.originalname}: ${error.message}`);
                // Continue with other files but add error info
                results.push({
                    hash: '',
                    url: '',
                    filename: file.originalname,
                    size: file.size,
                    mimeType: file.mimetype,
                    uploadedAt: new Date(),
                    recordId: batchData?.recordId,
                    category: 'error',
                });
            }
        }

        return results;
    }

    /**
     * Upload JSON data to IPFS
     */
    async uploadJson(
        data: any,
        filename: string = 'data.json',
        recordId?: string
    ): Promise<FileUploadResponseDto> {
        try {
            this.logger.log('Uploading JSON data to IPFS');

            const metadata = {
                name: filename,
                keyvalues: {
                    type: 'json',
                    uploadedAt: new Date().toISOString(),
                    service: 'tracceaqua',
                    recordId: recordId || '',
                },
            };

            const result = await this.pinata.upload.public.json(data, { metadata });

            const jsonString = JSON.stringify(data, null, 2);
            const size = Buffer.from(jsonString, 'utf-8').length;

            const response: FileUploadResponseDto = {
                hash: result.cid,
                url: `${this.gatewayUrl}/ipfs/${result.cid}`,
                filename: filename,
                size: size,
                mimeType: 'application/json',
                uploadedAt: new Date(),
                recordId,
                category: 'json',
            };

            this.logger.log(`JSON uploaded successfully: ${result.cid}`);
            return response;

        } catch (error) {
            this.logger.error(`JSON upload failed: ${error.message}`, error.stack);
            throw new InternalServerErrorException(`JSON upload failed: ${error.message}`);
        }
    }

    /**
     * Get file information from IPFS hash
     */
    async getFileInfo(ipfsHash: string): Promise<any> {
        try {
            const files = await this.pinata.files.public.list()
                .cid(ipfsHash);

            if (!files.files || files.files.length === 0) {
                throw new Error('File not found');
            }

            const file = files.files[0];

            return {
                hash: file.cid,
                filename: file.name || 'Unknown',
                size: file.size,
                mimeType: file.mime_type,
                uploadedAt: file.created_at,
                url: `${this.gatewayUrl}/ipfs/${file.cid}`,
            };

        } catch (error) {
            this.logger.error(`Failed to get file info for ${ipfsHash}: ${error.message}`);
            throw new InternalServerErrorException(`Failed to get file information: ${error.message}`);
        }
    }

  /**
   * Get public URL for an IPFS hash
   */
    getPublicUrl(ipfsHash: string): string {
        return `${this.gatewayUrl}/ipfs/${ipfsHash}`;
    }

  /**
   * Delete file from Pinata (unpin)
   */
    async deleteFile(ipfsHash: string): Promise<void> {
        try {
            this.logger.log(`Deleting file from IPFS: ${ipfsHash}`);


            // First get the file ID from the CID
            const response = await this.pinata.files.public.list().cid(ipfsHash);
            
            if (response.files.length === 0) {
                console.warn('File not found, might already be deleted');
                return;
            }
            
            const fileId = response.files[0].id;
            await this.pinata.files.public.delete([fileId]);

            this.logger.log('File deleted successfully');

        } catch (error) {
            this.logger.error(`Failed to delete file ${ipfsHash}: ${error.message}`);
            // Don't throw error - file might already be deleted
            this.logger.warn('File deletion failed, but continuing...');
        }
    }

  /**
   * List files uploaded by this service
   */
    async listFiles(
        limit: number = 10,
        recordId?: string,
        category?: string
    ): Promise<{ files: any[], hasMore: boolean }> {
        try {
            let query = this.pinata.files.public.list().limit(limit);

            // Add filters if provided
            const keyvalues: any = { service: 'tracceaqua' };

            if (recordId) {
                keyvalues.recordId = recordId;
        }

            if (category) {
                keyvalues.category = category;
        }

            query = query.keyvalues(keyvalues);

            const result = await query;

            const files = result.files.map(file => ({
                hash: file.cid,
                filename: file.name || 'Unknown',
                size: file.size,
                mimeType: file.mime_type,
                uploadedAt: file.created_at,
                url: `${this.gatewayUrl}/ipfs/${file.cid}`,
                recordId: file?.group_id,
                category: file?.keyvalues,
            }));

            return {
                files,
                hasMore: !!result.next_page_token,
            };

        } catch (error) {
            this.logger.error(`Failed to list files: ${error.message}`);
            throw new InternalServerErrorException(`Failed to list files: ${error.message}`);
        }
    }

  /**
   * Get storage statistics
   */
    async getStorageStats(): Promise<any> {
        try {
            const result = await this.pinata.files.public.list()
                .keyvalues({ service: 'tracceaqua' })
                .limit(1000); // Get up to 1000 files for stats

            const totalFiles = result.files.length;
            const totalSize = result.files.reduce((sum, file) => sum + (file.size || 0), 0);

            // Group by category
            const categoryStats = result.files.reduce((acc, file) => {
                const category = file?.keyvalues?.category || 'unknown';
                if (!acc[category]) {
                    acc[category] = { count: 0, size: 0 };
                }
                acc[category].count++;
                acc[category].size += file.size || 0;
                return acc;
            }, {} as Record<string, { count: number; size: number }>);

            return {
                totalFiles,
                totalSize,
                totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
                categoryStats,
                recentFiles: result.files
                    .slice(0, 5)
                    .map(file => ({
                    hash: file.cid,
                        filename: file?.name,
                        size: file.size,
                        uploadedAt: file.created_at,
                    })),
            };

        } catch (error) {
            this.logger.error(`Failed to get storage stats: ${error.message}`);
            throw new InternalServerErrorException(`Failed to get storage statistics: ${error.message}`);
        }
    }

    // ===== PRIVATE HELPER METHODS =====

    private validateFile(file: Express.Multer.File): void {
        // File size validation (50MB max)
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new BadRequestException(`File size exceeds maximum limit of ${maxSize / 1024 / 1024}MB`);
        }

        // Empty file check
        if (file.size === 0) {
            throw new BadRequestException('Empty files are not allowed');
        }

        // File type validation
        const allowedTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf', 'text/plain', 'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            throw new BadRequestException(`File type ${file.mimetype} is not allowed`);
        }
    }

    private detectCategory(file: Express.Multer.File): string {
        if (file.mimetype.startsWith('image/')) return 'image';
        if (file.mimetype === 'application/pdf') return 'document';
        if (file.mimetype.includes('spreadsheet') || file.mimetype.includes('excel')) return 'spreadsheet';
        if (file.mimetype.includes('document') || file.mimetype.includes('word')) return 'document';
        if (file.mimetype === 'text/csv') return 'data';
        if (file.mimetype.startsWith('text/')) return 'text';
        return 'other';
    }
}
