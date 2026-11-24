import type { ReviewDto } from '@marketplace/shared';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  JobStatus as PrismaJobStatus,
  ReviewTarget as PrismaReviewTarget,
  type Job,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { reviewInclude, toReviewDto } from './review.mapper';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(reviewerId: string, dto: CreateReviewDto): Promise<ReviewDto> {
    const job = await this.prisma.job.findUnique({ where: { id: dto.jobId } });
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    if (job.status !== PrismaJobStatus.COMPLETED) {
      throw new BadRequestException('Only completed jobs can be reviewed');
    }

    const isRequester = job.requesterId === reviewerId;
    const isProvider = job.providerId === reviewerId;
    if (!isRequester && !isProvider) {
      throw new ForbiddenException('You are not a participant in this job');
    }

    const existing = await this.prisma.review.findUnique({
      where: {
        jobId_reviewerId: { jobId: dto.jobId, reviewerId },
      },
    });
    if (existing) {
      throw new ConflictException('You have already reviewed this job');
    }

    const review = await this.prisma.review.create({
      data: {
        jobId: dto.jobId,
        reviewerId,
        targetId: isRequester ? job.providerId : job.requesterId,
        targetType: isRequester
          ? PrismaReviewTarget.PROVIDER
          : PrismaReviewTarget.REQUESTER,
        rating: dto.rating,
        comment: dto.comment?.trim() || null,
      },
      include: reviewInclude,
    });

    return toReviewDto(review);
  }

  async findByJob(jobId: string, userId: string): Promise<ReviewDto[]> {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    this.assertParticipant(job, userId);

    const reviews = await this.prisma.review.findMany({
      where: { jobId },
      include: reviewInclude,
      orderBy: { createdAt: 'desc' },
    });
    return reviews.map(toReviewDto);
  }

  async findReceived(userId: string): Promise<ReviewDto[]> {
    const reviews = await this.prisma.review.findMany({
      where: { targetId: userId },
      include: reviewInclude,
      orderBy: { createdAt: 'desc' },
    });
    return reviews.map(toReviewDto);
  }

  async findMine(reviewerId: string): Promise<ReviewDto[]> {
    const reviews = await this.prisma.review.findMany({
      where: { reviewerId },
      include: reviewInclude,
      orderBy: { createdAt: 'desc' },
    });
    return reviews.map(toReviewDto);
  }

  private assertParticipant(job: Job | null, userId: string): asserts job is Job {
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    if (job.requesterId !== userId && job.providerId !== userId) {
      throw new ForbiddenException('You are not a participant in this job');
    }
  }
}
