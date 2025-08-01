// src/auth/auth.controller.ts
import {
    Controller,
    Post,
    Get,
    Put,
    Body,
    Request,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
    LoginDto,
    RegisterDto,
    UpdateProfileDto,
    AuthResponseDto,
    VerifyTokenDto,
    VerifyTokenResponseDto,
    GenerateMessageDto,
    GenerateMessageResponseDto,
    UserDto,
} from './dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @Post('generate-message')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Generate message for wallet signing',
        description: 'Generate a message that the user needs to sign with their wallet for authentication',
    })
    @ApiResponse({
        status: 200,
        description: 'Message generated successfully',
        type: GenerateMessageResponseDto,
    })
    @ApiBody({ type: GenerateMessageDto })
    async generateMessage(@Body() generateMessageDto: GenerateMessageDto): Promise<GenerateMessageResponseDto> {
        const { address, nonce } = generateMessageDto;
        const message = this.authService.generateAuthMessage(address, nonce);
        const generatedNonce = nonce || this.authService.generateNonce();

        return {
            message,
            nonce: generatedNonce,
        };
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Authenticate user with wallet signature',
        description: 'Login or register user using wallet signature. New users are automatically assigned CONSUMER role.',
    })
    @ApiResponse({
        status: 200,
        description: 'User authenticated successfully',
        type: AuthResponseDto,
    })
    @ApiResponse({
        status: 401,
        description: 'Invalid wallet signature',
    })
    @ApiBody({ type: LoginDto })
    async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
        return this.authService.login(loginDto);
    }

    @Public()
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Register new user with wallet signature',
        description: 'Register a new user with wallet signature and basic profile information',
    })
    @ApiResponse({
        status: 201,
        description: 'User registered successfully',
        type: AuthResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'User already exists or invalid data',
    })
    @ApiResponse({
        status: 401,
        description: 'Invalid wallet signature',
    })
    @ApiBody({ type: RegisterDto })
    async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
        return this.authService.register(registerDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    @ApiOperation({
        summary: 'Get current user profile',
        description: 'Retrieve the authenticated user\'s profile information',
    })
    @ApiResponse({
        status: 200,
        description: 'User profile retrieved successfully',
        type: UserDto,
    })
    @ApiResponse({
        status: 401,
        description: 'User not authenticated',
    })
    @ApiBearerAuth('JWT-auth')
    async getProfile(@CurrentUser() user: any): Promise<UserDto> {
        return this.authService.getProfile(user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Put('profile')
    @ApiOperation({
        summary: 'Update user profile',
        description: 'Update the authenticated user\'s profile information',
    })
    @ApiResponse({
        status: 200,
        description: 'Profile updated successfully',
        type: UserDto,
    })
    @ApiResponse({
        status: 401,
        description: 'User not authenticated',
    })
    @ApiBearerAuth('JWT-auth')
    @ApiBody({ type: UpdateProfileDto })
    async updateProfile(
        @CurrentUser() user: any,
        @Body() updateProfileDto: UpdateProfileDto,
    ): Promise<UserDto> {
        return this.authService.updateProfile(user.id, updateProfileDto);
    }

    @Public()
    @Post('verify-token')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Verify JWT token',
        description: 'Verify if a JWT token is valid and return user information',
    })
    @ApiResponse({
        status: 200,
        description: 'Token verification result',
        type: VerifyTokenResponseDto,
    })
    @ApiBody({ type: VerifyTokenDto })
    async verifyToken(@Body() verifyTokenDto: VerifyTokenDto): Promise<VerifyTokenResponseDto> {
        return this.authService.verifyToken(verifyTokenDto.token);
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Logout user',
        description: 'Logout the authenticated user (client-side token removal)',
    })
    @ApiResponse({
        status: 200,
        description: 'User logged out successfully',
    })
    @ApiBearerAuth('JWT-auth')
    async logout(): Promise<{ message: string }> {
        // For JWT, logout is handled client-side by removing the token
        // This endpoint exists for consistency and potential future server-side token blacklisting
        return { message: 'Logged out successfully' };
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    @ApiOperation({
        summary: 'Get current user info',
        description: 'Get basic information about the authenticated user',
    })
    @ApiResponse({
        status: 200,
        description: 'Current user information',
        type: UserDto,
    })
    @ApiResponse({
        status: 401,
        description: 'User not authenticated',
    })
    @ApiBearerAuth('JWT-auth')
    async getCurrentUser(@CurrentUser() user: any): Promise<UserDto> {
        return this.authService.getProfile(user.id);
    }

    @Public()
    @Get('health')
    @ApiOperation({
        summary: 'Authentication service health check',
        description: 'Check if the authentication service is healthy',
    })
    @ApiResponse({
        status: 200,
        description: 'Authentication service is healthy',
    })
    async healthCheck(): Promise<{ status: string; timestamp: string }> {
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
        };
    }
}

