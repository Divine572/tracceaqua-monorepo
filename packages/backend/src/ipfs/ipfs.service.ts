// packages/backend/src/ipfs/ipfs.service.ts
import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinataSDK } from 'pinata';


@Injectable()
export class IpfsService {
    private pinata: PinataSDK;

    constructor(private configService: ConfigService) {
        const pinataJwt = this.configService.get<string>('PINATA_JWT');
        const pinataGateway = this.configService.get<string>('PINATA_GATEWAY_URL') || 'https://gateway.pinata.cloud';
        
        if (!pinataJwt || !pinataGateway) {
            throw new Error('PINATA_JWT and PINATA_GATEWAY_URL environment variables are required');
        }

        this.pinata = new PinataSDK({
            pinataJwt,
            pinataGateway,
        });

        console.log('✅ IPFS Service initialized with Pinata');
    }

    /**
     * Upload a single file to IPFS via Pinata
     */
    async uploadFile(file: Express.Multer.File): Promise<string> {
        try {
            console.log('📁 Uploading file to IPFS:', file.originalname);

            // Validate file
            this.validateFile(file);

            // Create a File object from the buffer
            const fileData = new File([new Uint8Array(file.buffer)], file.originalname, {
                type: file.mimetype,
            });

            // Upload to Pinata
            const result = await this.pinata.upload.public.file(fileData, {
                metadata: {
                    name: file.originalname,
                    keyvalues: {
                        originalName: file.originalname,
                        mimeType: file.mimetype,
                        size: file.size.toString(),
                        uploadedAt: new Date().toISOString(),
                        service: 'tracceaqua-role-applications',
                    },
                },
            });

            console.log('✅ File uploaded to IPFS:', result.cid.toString());
            return result.cid.toString();

        } catch (error) {
            console.error('❌ IPFS upload failed:', error);
            throw new InternalServerErrorException('Failed to upload file to IPFS');
        }
    }

    /**
     * Upload multiple files to IPFS
     */
    async uploadFiles(files: Express.Multer.File[]): Promise<string[]> {
        console.log(`📁 Uploading ${files.length} files to IPFS`);

        const uploadPromises = files.map(file => this.uploadFile(file));
        
        try {
            const hashes = await Promise.all(uploadPromises);
            console.log('✅ All files uploaded successfully');
            return hashes;
        } catch (error) {
            console.error('❌ Some file uploads failed:', error);
            throw new InternalServerErrorException('Failed to upload one or more files');
        }
    }

    /**
     * Upload JSON data to IPFS
     */
    async uploadJson(data: any, filename: string = 'data.json'): Promise<string> {
        try {
            console.log('📄 Uploading JSON data to IPFS');

            const result = await this.pinata.upload.public.json(data, {
                metadata: {
                    name: filename,
                    keyvalues: {
                        type: 'json',
                        uploadedAt: new Date().toISOString(),
                        service: 'tracceaqua',
                    },
                },
            });

            console.log('✅ JSON uploaded to IPFS:', result.cid.toString());
            return result.cid.toString();

        } catch (error) {
            console.error('❌ JSON upload failed:', error);
            throw new InternalServerErrorException('Failed to upload JSON to IPFS');
        }
    }

    /**
     * Get file information from IPFS hash
     */
    async getFileInfo(ipfsHash: string): Promise<any> {
        try {
            // Get file metadata from Pinata by searching for the CID
            const response = await this.pinata.files.public.list().cid(ipfsHash);
            
            if (response.files.length === 0) {
                throw new Error('File not found');
            }

            const fileInfo = response.files[0];

            return {
                id: fileInfo.id,
                hash: fileInfo.cid,
                name: fileInfo.name,
                size: fileInfo.size,
                numberOfFiles: fileInfo.number_of_files,
                mimeType: fileInfo.mime_type,
                groupId: fileInfo.group_id,
                timestamp: fileInfo.created_at,
            };

        } catch (error) {
            console.error('❌ Failed to get file info:', error);
            throw new InternalServerErrorException('Failed to retrieve file information');
        }
    }

    /**
     * Generate gateway URL for accessing files
     */
    getGatewayUrl(ipfsHash: string): string {
        const gatewayUrl = this.configService.get<string>('PINATA_GATEWAY_URL') || 
                          'https://gateway.pinata.cloud';
        return `${gatewayUrl}/ipfs/${ipfsHash}`;
    }

    /**
     * Delete file from IPFS (unpin from Pinata)
     */
    async deleteFile(ipfsHash: string): Promise<void> {
        try {
            console.log('🗑️ Deleting file from IPFS:', ipfsHash);
            
            // First get the file ID from the CID
            const response = await this.pinata.files.public.list().cid(ipfsHash);
            
            if (response.files.length === 0) {
                console.warn('File not found, might already be deleted');
                return;
            }
            
            const fileId = response.files[0].id;
            await this.pinata.files.public.delete([fileId]);
            
            console.log('✅ File deleted successfully');
        } catch (error) {
            console.error('❌ Failed to delete file:', error);
            // Don't throw error for delete failures as file might already be deleted
            console.warn('File delete failed, but continuing...');
        }
    }

    /**
     * Validate uploaded file
     */
    private validateFile(file: Express.Multer.File): void {
        // Check file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            throw new BadRequestException('File size too large. Maximum size is 10MB.');
        }

        // Check file type
        const allowedMimeTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'text/csv',
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(
                `File type not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`
            );
        }

        // Check for empty files
        if (file.size === 0) {
            throw new BadRequestException('Empty files are not allowed');
        }

        console.log('✅ File validation passed:', file.originalname);
    }

    /**
     * Get usage statistics
     */
    async getUsageStats(): Promise<any> {
        try {
            // Get all files with service-specific keyvalues if needed
            const response = await this.pinata.files.public.list()
                .keyvalues({
                    service: 'tracceaqua-role-applications',
                });

            const totalFiles = response.files.length;
            const totalSize = response.files.reduce((sum, file) => sum + file.size, 0);

            return {
                totalFiles,
                totalSize,
                totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
                files: response.files.map(file => ({
                    id: file.id,
                    hash: file.cid,
                    name: file.name,
                    size: file.size,
                    numberOfFiles: file.number_of_files,
                    mimeType: file.mime_type,
                    groupId: file.group_id,
                    uploadedAt: file.created_at,
                })),
                nextPageToken: response.next_page_token,
            };
        } catch (error) {
            console.error('❌ Failed to get usage stats:', error);
            throw new InternalServerErrorException('Failed to retrieve usage statistics');
        }
    }
}
