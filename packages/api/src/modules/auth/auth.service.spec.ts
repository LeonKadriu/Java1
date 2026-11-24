import { ProfileType, UserRole } from '@marketplace/shared';
import { ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

describe('AuthService', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };
  const jwt = { sign: jest.fn().mockReturnValue('signed-token') };
  const service = new AuthService(
    prisma as unknown as PrismaService,
    jwt as unknown as JwtService,
  );

  const dto: RegisterDto = Object.assign(new RegisterDto(), {
    email: '  User@Example.com ',
    password: 'strong-password',
    displayName: 'Alex Morgan',
    type: ProfileType.INDIVIDUAL,
    roles: [UserRole.REQUESTER, UserRole.PROVIDER],
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jwt.sign.mockReturnValue('signed-token');
  });

  it('stores a hashed password and returns a token on registration', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockImplementation(({ data }) =>
      Promise.resolve({
        id: 'user-1',
        email: data.email,
        passwordHash: data.passwordHash,
        roles: data.roles,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        profile: {
          id: 'profile-1',
          userId: 'user-1',
          type: data.profile.create.type,
          displayName: data.profile.create.displayName,
          description: null,
          phone: null,
          city: null,
          country: null,
          avatarUrl: null,
          companyName: null,
          taxId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
    );

    const result = await service.register(dto);

    const createdData = prisma.user.create.mock.calls[0][0].data;
    expect(createdData.email).toBe('user@example.com');
    expect(createdData.passwordHash).not.toBe(dto.password);
    await expect(bcrypt.compare(dto.password, createdData.passwordHash)).resolves.toBe(true);
    expect(result.accessToken).toBe('signed-token');
    expect(result.user.profile?.displayName).toBe('Alex Morgan');
  });

  it('rejects an email that is already registered', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'existing' });

    await expect(service.register(dto)).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('rejects a company profile without a company name', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.register(
        Object.assign(new RegisterDto(), {
          ...dto,
          type: ProfileType.COMPANY,
        }),
      ),
    ).rejects.toThrow('companyName is required');
  });
});
