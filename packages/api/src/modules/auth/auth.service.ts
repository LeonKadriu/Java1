import {
  AuthResponse,
  ProfileType,
  UserDto,
  UserRole,
} from '@marketplace/shared';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  Prisma,
  ProfileType as PrismaProfileType,
  UserRole as PrismaUserRole,
  UserStatus as PrismaUserStatus,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import type { JwtPayload } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { toUserDto, type UserWithProfile } from './user.mapper';

const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const email = dto.email.trim().toLowerCase();

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    if (dto.type === ProfileType.COMPANY && !dto.companyName?.trim()) {
      throw new BadRequestException('companyName is required for a company profile');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          passwordHash,
          roles: dto.roles as unknown as PrismaUserRole[],
          profile: {
            create: {
              type: dto.type as unknown as PrismaProfileType,
              displayName: dto.displayName.trim(),
              companyName: dto.companyName?.trim() || null,
              city: dto.city?.trim() || null,
              country: dto.country?.trim() || null,
            },
          },
        },
        include: { profile: true },
      });

      return this.buildAuthResponse(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email already registered');
      }
      throw error;
    }
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.trim().toLowerCase() },
      include: { profile: true },
    });

    if (!user || user.status !== PrismaUserStatus.ACTIVE) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse(user);
  }

  async me(userId: string): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return toUserDto(user);
  }

  private buildAuthResponse(user: UserWithProfile): AuthResponse {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles as unknown as UserRole[],
    };

    return {
      accessToken: this.jwt.sign(payload),
      user: toUserDto(user),
    };
  }
}
