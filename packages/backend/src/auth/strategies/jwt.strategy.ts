import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
    sub: string; // user ID
    address: string; // wallet address
    role: string;
    status: string;
    iat?: number;
    exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('jwt.secret'),
        });
    }

    async validate(payload: JwtPayload) {
        // Find user in database to ensure they still exist and are active
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            include: { profile: true },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        if (user.status !== 'ACTIVE') {
            throw new UnauthorizedException('User account is not active');
        }

        // Return user object (will be available as req.user)
        return {
            id: user.id,
            address: user.address,
            email: user.email,
            role: user.role,
            status: user.status,
            profile: user.profile,
        };
    }
}