// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
// import { UserRole, UserStatus } from '@prisma/client';

import { UserRole } from 'src/common/enums/user-role.enum';
import { UserStatus } from 'src/common/enums/user-status.enum';


import { ethers } from 'ethers';
import * as bcrypt from 'bcryptjs';
import { AuthResponseDto, LoginDto, RegisterDto, UpdateProfileDto, UserDto } from './dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }



    /**
     * Simple wallet-based authentication (no signature required)
     * Better UX for non-crypto native users
     * Supports both wallet connections and social logins
     */
    async connectWallet(address: string, email?: string): Promise<AuthResponseDto> {
        console.log('🔗 Simple wallet connection for address:', address);
        console.log('📧 Email provided:', email ? 'Yes' : 'No');

        // Validate address format
        try {
            ethers.getAddress(address);
        } catch (error) {
            throw new BadRequestException('Invalid wallet address format');
        }        // Find or create user
        let user = await this.prisma.user.findUnique({
            where: { address: address.toLowerCase() },
            include: { profile: true },
        });

        let isNewUser = false;

        if (!user) {
            // Create new user with CONSUMER role (consumer-first approach)
            user = await this.prisma.user.create({
                data: {
                    address: address.toLowerCase(),
                    email: email || null,
                    role: UserRole.CONSUMER,
                    status: UserStatus.ACTIVE, // Immediately active
                },
                include: { profile: true },
            });

            // Create basic profile
            await this.prisma.userProfile.create({
                data: {
                    userId: user.id,
                    firstName: '', // Default empty - user can fill later
                    lastName: '',
                },
            });

            // Re-fetch user with profile
            user = await this.prisma.user.findUnique({
                where: { id: user.id },
                include: { profile: true },
            });

            if (!user) {
                throw new InternalServerErrorException('Failed to create user');
            }

            isNewUser = true;
            console.log('✅ New user created:', address);

            if (email) {
                console.log('📧 Account created with email integration');
            }
        } else {
            console.log('✅ Existing user found:', address);

            // Update email if provided and user doesn't have one
            if (email && !user.email) {
                await this.prisma.user.update({
                    where: { id: user.id },
                    data: { email: email },
                });
                console.log('📧 Email added to existing account');
            }
        }

        // Check if user is suspended
        if (user.status === UserStatus.SUSPENDED) {
            throw new UnauthorizedException('Account has been suspended. Please contact support.');
        }

        // Generate JWT token
        const payload: JwtPayload = {
            sub: user.id,
            address: user.address,
            role: user.role,
            status: user.status,
        };

        const accessToken = this.jwtService.sign(payload, {
            expiresIn: this.configService.get('jwt.expiresIn', '7d'),
        });

        console.log('✅ JWT token generated for user:', user.id);

        // Convert to DTO
        const userDto: UserDto = {
            id: user.id,
            address: user.address,
            email: user.email || '',
            role: user.role,
            status: user.status,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            profile: user.profile ? {
                id: user.profile.id,
                userId: user.profile.userId,
                firstName: user.profile.firstName || '',
                lastName: user.profile.lastName || '',
                organization: user.profile.organization || undefined,
                phoneNumber: user.profile.phoneNumber || undefined,
                profileImage: user.profile.profileImage || undefined,
                bio: user.profile.bio || undefined,
                location: user.profile.location || undefined,
                website: user.profile.website || undefined,
                createdAt: user.profile.createdAt,
                updatedAt: user.profile.updatedAt,
            } : undefined,
            isNewUser,
        };

        return {
            user: userDto,
            accessToken,
        };
    }

    /**
        * Verify wallet signature using EIP-191 standard
    */
    async verifyWalletSignature(
        address: string,
        signature: string,
        message: string,
    ): Promise<boolean> {
        try {
            console.log('🔍 Signature Verification Debug:');
            console.log('Address:', address);
            console.log('Signature length:', signature.length);
            console.log('Signature preview:', signature.substring(0, 50) + '...');
            console.log('Message length:', message.length);
            console.log('Message preview:', message.substring(0, 100) + '...');

            // DEVELOPMENT: Check for mock signature first
            if (process.env.NODE_ENV === 'development') {
                const mockSignatures = ['mock-signature', 'test-signature', 'dev-signature'];
                if (mockSignatures.includes(signature)) {
                    console.log('🧪 Using mock signature for development testing');
                    return true;
                }
            }

            // Validate signature format
            if (!signature || typeof signature !== 'string') {
                console.log('❌ Invalid signature: not a string or empty');
                return false;
            }

            // Remove 0x prefix if present
            const cleanSignature = signature.startsWith('0x') ? signature.slice(2) : signature;

            // Check if this might be a smart contract wallet signature or contract call data
            if (cleanSignature.length > 200) {
                console.log('❌ Signature too long - this appears to be contract call data');
                console.log('This often happens with smart contract wallets or incorrect signing methods');
                console.log('Expected: 130 hex chars, Got:', cleanSignature.length);
                console.log('Possible solutions:');
                console.log('- Use a different wallet (MetaMask, etc.)');
                console.log('- Check if wallet supports EIP-191 message signing');
                console.log('- Verify the signing method in the frontend');
                return false;
            }

            // Standard Ethereum signature should be 130 hex characters (65 bytes)
            if (cleanSignature.length !== 130) {
                console.log(`❌ Invalid signature length: ${cleanSignature.length}, expected 130`);
                if (cleanSignature.length === 0) {
                    console.log('Empty signature - signing was likely cancelled');
                } else if (cleanSignature.length < 130) {
                    console.log('Signature too short - incomplete signing process');
                } else {
                    console.log('Signature too long - might be contract call data');
                }
                return false;
            }

            // Ensure signature contains only valid hex characters
            if (!/^[0-9a-fA-F]+$/.test(cleanSignature)) {
                console.log('❌ Invalid signature: contains non-hex characters');
                return false;
            }

            // Add back 0x prefix for ethers
            const formattedSignature = '0x' + cleanSignature;

            // Ensure address is in proper format
            const checksumAddress = ethers.getAddress(address.toLowerCase());
            console.log('Checksum address:', checksumAddress);

            // Recover the address from the signature
            const recoveredAddress = ethers.verifyMessage(message, formattedSignature);
            console.log('Recovered address:', recoveredAddress);

            // Compare addresses (case-insensitive)
            const isValid = checksumAddress.toLowerCase() === recoveredAddress.toLowerCase();
            console.log('Signature valid:', isValid);

            if (!isValid) {
                console.log('❌ Signature verification failed:');
                console.log('Expected:', checksumAddress.toLowerCase());
                console.log('Recovered:', recoveredAddress.toLowerCase());
                console.log('Full message being verified:', JSON.stringify(message));
            } else {
                console.log('✅ Signature verification successful!');
            }

            return isValid;
        } catch (error) {
            console.error('❌ Signature verification error:', error);
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                code: error.code,
                argument: error.argument,
                value: error.value ? (typeof error.value === 'string' ? error.value.substring(0, 100) + '...' : error.value) : undefined
            });
            return false;
        }
    }


    /**
     * Generate authentication message for wallet signing
     */
    generateAuthMessage(address: string, nonce?: string): string {
        const timestamp = Date.now();
        const nonceStr = nonce || Math.random().toString(36).substring(7);

        // Simplified message format that's more likely to work
        const message = `Welcome to TracceAqua!

        This request will not trigger a blockchain transaction or cost any gas fees.

        Your authentication status will remain secure and decentralized.

        Wallet address: ${address}
        Nonce: ${nonceStr}
        Timestamp: ${timestamp}`;

        console.log('Generated message:', JSON.stringify(message));
        return message;
    }




    /**
     * Authenticate user with wallet address only
     */
    async login(loginDto: LoginDto): Promise<AuthResponseDto> {
        const { address, email } = loginDto;

        console.log('🔐 Login attempt for address:', address);

        // Validate address format
        try {
            ethers.getAddress(address);
        } catch (error) {
            throw new BadRequestException('Invalid wallet address format');
        }

        // Find or create user
        let user = await this.prisma.user.findUnique({
            where: { address: address.toLowerCase() },
            include: { profile: true },
        });



        if (!user) {
            // Create new user with CONSUMER role (consumer-first approach)
            user = await this.prisma.user.create({
                data: {
                    address: address.toLowerCase(),
                    email: email,
                    role: UserRole.CONSUMER,
                    status: UserStatus.ACTIVE, // Immediately active
                },
                include: { profile: true },
            });

            // Create basic profile
            await this.prisma.userProfile.create({
                data: {
                    userId: user.id,
                    firstName: '', // Default empty
                    lastName: '',
                },
            });

            // Refresh user with profile
            user = await this.prisma.user.findUnique({
                where: { id: user.id },
                include: { profile: true },
            });
        } else {
            // Update email if provided and different
            if (email && email !== user.email) {
                user = await this.prisma.user.update({
                    where: { id: user.id },
                    data: { email },
                    include: { profile: true },
                });
            }
        }

        // Assert user exists (it should always exist at this point)
        if (!user) {
            throw new InternalServerErrorException('Failed to create or retrieve user');
        }

        // // Check if user is active
        // if (user.status !== UserStatus.ACTIVE) {
        //     throw new UnauthorizedException('User account is not active');
        // }

        // Generate JWT token
        const payload: JwtPayload = {
            sub: user.id,
            address: user.address,
            role: user.role,
            status: user.status,
        };

        const accessToken = this.jwtService.sign(payload);


        return {
            accessToken,
            user: {
                id: user.id,
                address: user.address,
                email: user.email || "",
                role: user.role || UserRole.CONSUMER,
                status: user.status || UserStatus.ACTIVE,
                profile: user.profile || {} as any, // Ensure profile is always an object
                isNewUser: !user.profile?.firstName, // Consider user new if no name set
            },
        };
    }

    /**
     * Register new user (alternative flow)
     */
    async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
        const { address, email, firstName, lastName } = registerDto;

        // Validate address format
        try {
            ethers.getAddress(address);
        } catch (error) {
            throw new BadRequestException('Invalid wallet address format');
        }

        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { address: address.toLowerCase() },
        });

        if (existingUser) {
            throw new BadRequestException('User with this wallet address already exists');
        }

        // Create user
        const user = await this.prisma.user.create({
            data: {
                address: address.toLowerCase(),
                email,
                role: UserRole.CONSUMER,
                status: UserStatus.ACTIVE,
                profile: {
                    create: {
                        firstName,
                        lastName,
                    },
                },
            },
            include: { profile: true },
        });

        // Generate token
        const payload: JwtPayload = {
            sub: user.id,
            address: user.address,
            role: user.role,
            status: user.status,
        };

        const accessToken = this.jwtService.sign(payload);

        return {
            accessToken,
            user: {
                id: user.id,
                address: user.address,
                email: user.email || "",
                role: user.role || UserRole.CONSUMER,
                status: user.status || UserStatus.ACTIVE,
                profile: user.profile || {} as any, // Ensure profile is always an object
                isNewUser: true
            },
        };
    }

    /**
     * Get user profile
     */
    async getProfile(userId: string): Promise<UserDto> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return {
            id: user.id,
            address: user.address,
            email: user.email || "",
            role: user.role || UserRole.CONSUMER,
            status: user.status || UserStatus.ACTIVE,
            profile: user.profile || {} as any, // Ensure profile is always an object
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }

    /**
     * Update user profile
     */
    async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<UserDto> {
        const { firstName, lastName, bio, location, website, phoneNumber, organization } = updateProfileDto;

        // Check if user exists
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // Update or create profile
        let profile;
        if (user.profile) {
            profile = await this.prisma.userProfile.update({
                where: { userId },
                data: {
                    firstName,
                    lastName,
                    bio,
                    location,
                    website,
                    phoneNumber,
                    organization,
                },
            });
        } else {
            profile = await this.prisma.userProfile.create({
                data: {
                    userId,
                    firstName,
                    lastName,
                    bio,
                    location,
                    website,
                    phoneNumber,
                    organization,
                },
            });
        }

        return {
            id: user.id,
            address: user.address,
            email: user.email || "",
            role: user.role,
            status: user.status,
            profile,
        };
    }

    /**
     * Verify JWT token
     */
    async verifyToken(token: string): Promise<{ valid: boolean; user?: UserDto; error?: string }> {
        try {
            const payload = this.jwtService.verify(token);
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
                include: { profile: true },
            });

            if (!user || user.status !== UserStatus.ACTIVE) {
                throw new UnauthorizedException('Invalid token');
            }

            return {
                valid: true,
                user: {
                    id: user.id,
                    address: user.address,
                    email: user.email || "",
                    role: user.role,
                    status: user.status,
                    profile: user.profile || {} as any, // Ensure profile is always an object
                },
            };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }

    /**
     * Generate nonce for wallet authentication
     */
    generateNonce(): string {
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    }
}