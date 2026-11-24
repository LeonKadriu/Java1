import { ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JobsService } from './jobs.service';

interface JobsPrismaMock {
  job: {
    findMany: jest.Mock;
    count: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
  };
  serviceRequest: { update: jest.Mock };
  $transaction: jest.Mock;
}

describe('JobsService', () => {
  const now = new Date();
  const price = { toString: () => '120' };
  const prisma: JobsPrismaMock = {
    job: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    serviceRequest: { update: jest.fn() },
    $transaction: jest.fn((arg: unknown): unknown =>
      Array.isArray(arg)
        ? Promise.all(arg)
        : (arg as (tx: unknown) => unknown)(prisma),
    ),
  };
  const service = new JobsService(prisma as unknown as PrismaService);

  const job = {
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
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.job.findMany.mockResolvedValue([]);
    prisma.job.count.mockResolvedValue(0);
  });

  it('rejects access from a non-participant', async () => {
    prisma.job.findUnique.mockResolvedValue(job);

    await expect(service.findOne('job-1', 'stranger')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('completes an active job and its request', async () => {
    prisma.job.findUnique.mockResolvedValue(job);
    prisma.job.update.mockResolvedValue({
      ...job,
      status: 'COMPLETED',
      completedAt: now,
    });

    const result = await service.complete('job-1', 'requester-1');

    expect(prisma.job.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: 'COMPLETED', completedAt: expect.any(Date) },
      }),
    );
    expect(prisma.serviceRequest.update).toHaveBeenCalledWith({
      where: { id: 'req-1' },
      data: { status: 'COMPLETED' },
    });
    expect(result.status).toBe('COMPLETED');
  });
});
