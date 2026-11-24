import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { UserRole } from '@marketplace/shared';
import { UserStatus as PrismaUserStatus } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma/prisma.service';
import type { AuthenticatedUser, JwtPayload } from '../auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, roles: true, status: true },
    });

    if (!user || user.status !== PrismaUserStatus.ACTIVE) {
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      email: user.email,
      roles: user.roles as unknown as UserRole[],
    };
  }
}
