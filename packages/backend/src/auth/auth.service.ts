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
     * Verify wallet signature using EIP-191 standard
     */
    async verifyWalletSignature(
        address: string,
        signature: string,
        message: string,
    ): Promise<boolean> {
        try {
            // Ensure address is in proper format
            const checksumAddress = ethers.getAddress(address.toLowerCase());

            // Recover the address from the signature
            const recoveredAddress = ethers.verifyMessage(message, signature);

            // Compare addresses (case-insensitive)
            return checksumAddress.toLowerCase() === recoveredAddress.toLowerCase();
        } catch (error) {
            console.error('Signature verification failed:', error);
            return false;
        }
    }

    /**
     * Generate authentication message for wallet signing
     */
    generateAuthMessage(address: string, nonce?: string): string {
        const timestamp = Date.now();
        const nonceStr = nonce || Math.random().toString(36).substring(7);

        return `Welcome to TracceAqua!

This request will not trigger a blockchain transaction or cost any gas fees.

Your authentication status will remain secure and decentralized.

Wallet address: ${address}
Nonce: ${nonceStr}
Timestamp: ${timestamp}`;
    }

    /**
     * Authenticate user with wallet signature
     */
    async login(loginDto: LoginDto): Promise<AuthResponseDto> {
        const { address, signature, message, email } = loginDto;

        // Verify wallet signature
        const isValidSignature = await this.verifyWalletSignature(address, signature, message);

        if (!isValidSignature) {
            throw new UnauthorizedException('Invalid wallet signature');
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

        // Check if user is active
        if (user.status !== UserStatus.ACTIVE) {
            throw new UnauthorizedException('User account is not active');
        }

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
        const { address, signature, message, email, firstName, lastName } = registerDto;

        // Verify signature
        const isValidSignature = await this.verifyWalletSignature(address, signature, message);
        if (!isValidSignature) {
            throw new UnauthorizedException('Invalid wallet signature');
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