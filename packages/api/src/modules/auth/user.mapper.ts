import {
  ProfileType,
  UserRole,
  UserStatus,
  type ProfileDto,
  type UserDto,
} from '@marketplace/shared';
import type { Profile, User } from '@prisma/client';

export type UserWithProfile = User & { profile: Profile | null };

export function toProfileDto(profile: Profile): ProfileDto {
  return {
    id: profile.id,
    type: profile.type as unknown as ProfileType,
    displayName: profile.displayName,
    description: profile.description,
    phone: profile.phone,
    city: profile.city,
    country: profile.country,
    avatarUrl: profile.avatarUrl,
    companyName: profile.companyName,
    taxId: profile.taxId,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
}

export function toUserDto(user: UserWithProfile): UserDto {
  return {
    id: user.id,
    email: user.email,
    roles: user.roles as unknown as UserRole[],
    status: user.status as unknown as UserStatus,
    createdAt: user.createdAt.toISOString(),
    profile: user.profile ? toProfileDto(user.profile) : null,
  };
}
