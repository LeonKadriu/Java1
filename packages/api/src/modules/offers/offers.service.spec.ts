import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OffersService } from './offers.service';

interface OffersPrismaMock {
  serviceRequest: { findUnique: jest.Mock; update: jest.Mock };
  offer: {
    findUnique: jest.Mock;
    upsert: jest.Mock;
    findMany: jest.Mock;
    update: jest.Mock;
    updateMany: jest.Mock;
  };
  job: { create: jest.Mock };
  $transaction: jest.Mock;
}

describe('OffersService', () => {
  const now = new Date();
  const price = { toString: () => '120' };
  const prisma: OffersPrismaMock = {
    serviceRequest: { findUnique: jest.fn(), update: jest.fn() },
    offer: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    job: { create: jest.fn() },
    $transaction: jest.fn(
      (callback: (tx: unknown) => unknown): unknown => callback(prisma),
    ),
  };
  const service = new OffersService(prisma as unknown as PrismaService);

  const offer = {
    id: 'offer-1',
    requestId: 'req-1',
    providerId: 'provider-1',
    message: 'I can repair this within two days.',
    price,
    currency: 'EUR',
    estimatedDays: 2,
    status: 'PENDING',
    createdAt: now,
    updatedAt: now,
    provider: { profile: { displayName: 'Provider' } },
    request: { title: 'Fix tap' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects an offer on your own request', async () => {
    prisma.serviceRequest.findUnique.mockResolvedValue({
      id: 'req-1',
      requesterId: 'provider-1',
      status: 'OPEN',
    });

    await expect(
      service.create('req-1', 'provider-1', {
        message: 'I can help with this.',
        price: 100,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects accepting an offer on someone else’s request', async () => {
    prisma.offer.findUnique.mockResolvedValue({
      ...offer,
      request: { id: 'req-1', requesterId: 'other-user', status: 'OPEN' },
    });

    await expect(service.accept('offer-1', 'requester-1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('creates a job and rejects competing offers on accept', async () => {
    prisma.offer.findUnique.mockResolvedValue({
      ...offer,
      request: { id: 'req-1', requesterId: 'requester-1', status: 'OPEN' },
    });
    prisma.offer.updateMany.mockResolvedValue({ count: 1 });
    prisma.offer.update.mockResolvedValue(offer);
    prisma.job.create.mockResolvedValue({
      id: 'job-1',
      offerId: 'offer-1',
      requestId: 'req-1',
      requesterId: 'requester-1',
      providerId: 'provider-1',
      price,
      currency: 'EUR',
      status: 'ACTIVE',
      acceptedAt: now,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
      requester: { profile: { displayName: 'Requester' } },
      provider: { profile: { displayName: 'Provider' } },
      request: { title: 'Fix tap' },
    });

    const result = await service.accept('offer-1', 'requester-1');

    expect(prisma.offer.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'REJECTED' } }),
    );
    expect(prisma.job.create).toHaveBeenCalled();
    expect(prisma.serviceRequest.update).toHaveBeenCalledWith({
      where: { id: 'req-1' },
      data: { status: 'CLOSED' },
    });
    expect(result.status).toBe('ACTIVE');
  });
});
