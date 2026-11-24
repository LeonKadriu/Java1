import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ProfileType, type ProfileDto } from '@marketplace/shared';
import {
  Prisma,
  ProfileType as PrismaProfileType,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { toProfileDto } from '../auth/user.mapper';
import { UpdateProfileDto } from './dto/update-profile.dto';

function normalize(value?: string): string | null {
  return value?.trim() || null;
}

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async findMe(userId: string): Promise<ProfileDto> {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return toProfileDto(profile);
  }

  async updateMe(userId: string, dto: UpdateProfileDto): Promise<ProfileDto> {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const currentType = profile.type as unknown as ProfileType;
    const finalType = dto.type ?? currentType;
    const finalCompanyName =
      dto.companyName !== undefined ? normalize(dto.companyName) : profile.companyName;

    if (finalType === ProfileType.COMPANY && !finalCompanyName) {
      throw new BadRequestException('companyName is required for a company profile');
    }

    const data: Prisma.ProfileUpdateInput = {};
    if (dto.type !== undefined) {
      data.type = finalType as unknown as PrismaProfileType;
    }
    if (dto.displayName !== undefined) {
      data.displayName = dto.displayName.trim();
    }
    if (dto.description !== undefined) {
      data.description = normalize(dto.description);
    }
    if (dto.phone !== undefined) {
      data.phone = normalize(dto.phone);
    }
    if (dto.city !== undefined) {
      data.city = normalize(dto.city);
    }
    if (dto.country !== undefined) {
      data.country = normalize(dto.country);
    }
    if (dto.avatarUrl !== undefined) {
      data.avatarUrl = normalize(dto.avatarUrl);
    }
    if (dto.taxId !== undefined) {
      data.taxId = normalize(dto.taxId);
    }

    if (finalType === ProfileType.INDIVIDUAL) {
      data.companyName = null;
      data.taxId = null;
    } else if (dto.companyName !== undefined) {
      data.companyName = finalCompanyName;
    }

    const updated = await this.prisma.profile.update({
      where: { userId },
      data,
    });

    return toProfileDto(updated);
  }
}
