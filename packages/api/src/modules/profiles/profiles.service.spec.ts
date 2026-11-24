import { ProfileType } from '@marketplace/shared';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProfilesService } from './profiles.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

describe('ProfilesService', () => {
  const prisma = {
    profile: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  const service = new ProfilesService(prisma as unknown as PrismaService);

  const existingProfile = {
    id: 'profile-1',
    userId: 'user-1',
    type: 'INDIVIDUAL',
    displayName: 'Alex Morgan',
    description: null,
    phone: null,
    city: null,
    country: null,
    avatarUrl: null,
    companyName: null,
    taxId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.profile.findUnique.mockResolvedValue({ ...existingProfile });
    prisma.profile.update.mockImplementation(({ data }) =>
      Promise.resolve({ ...existingProfile, ...data }),
    );
  });

  it('throws when the profile is missing', async () => {
    prisma.profile.findUnique.mockResolvedValue(null);

    await expect(service.findMe('user-1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects a company profile without a company name', async () => {
    prisma.profile.findUnique.mockResolvedValue({
      ...existingProfile,
      type: 'COMPANY',
      companyName: null,
    });

    await expect(
      service.updateMe('user-1', { displayName: 'New Name' } as UpdateProfileDto),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('clears company fields when switching to an individual profile', async () => {
    prisma.profile.findUnique.mockResolvedValue({
      ...existingProfile,
      type: 'COMPANY',
      companyName: 'Acme Ltd',
      taxId: 'TAX-1',
    });

    const result = await service.updateMe('user-1', {
      type: ProfileType.INDIVIDUAL,
      displayName: 'Alex Morgan',
    });

    expect(prisma.profile.update.mock.calls[0][0].data).toMatchObject({
      type: ProfileType.INDIVIDUAL,
      companyName: null,
      taxId: null,
    });
    expect(result.type).toBe(ProfileType.INDIVIDUAL);
  });
});
