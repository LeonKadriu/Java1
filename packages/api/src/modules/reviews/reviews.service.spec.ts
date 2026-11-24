import { BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReviewsService } from './reviews.service';

describe('ReviewsService', () => {
  const now = new Date();
  const prisma = {
    job: { findUnique: jest.fn() },
    review: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };
  const service = new ReviewsService(prisma as unknown as PrismaService);

  const job = {
    id: 'job-1',
    requesterId: 'requester-1',
    providerId: 'provider-1',
    status: 'COMPLETED',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.job.findUnique.mockResolvedValue(job);
    prisma.review.findUnique.mockResolvedValue(null);
  });

  it('rejects a review for an incomplete job', async () => {
    prisma.job.findUnique.mockResolvedValue({ ...job, status: 'ACTIVE' });

    await expect(
      service.create('requester-1', { jobId: 'job-1', rating: 5 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects duplicate reviews', async () => {
    prisma.review.findUnique.mockResolvedValue({ id: 'review-1' });

    await expect(
      service.create('requester-1', { jobId: 'job-1', rating: 5 }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('reviews the other participant of a completed job', async () => {
    prisma.review.create.mockResolvedValue({
      id: 'review-1',
      jobId: 'job-1',
      reviewerId: 'requester-1',
      reviewer: { profile: { displayName: 'Requester' } },
      targetId: 'provider-1',
      targetType: 'PROVIDER',
      rating: 5,
      comment: 'Great work',
      createdAt: now,
      updatedAt: now,
    });

    const result = await service.create('requester-1', {
      jobId: 'job-1',
      rating: 5,
      comment: 'Great work',
    });

    expect(prisma.review.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          targetId: 'provider-1',
          targetType: 'PROVIDER',
        }),
      }),
    );
    expect(result.rating).toBe(5);
    expect(result.targetType).toBe('PROVIDER');
  });
});
