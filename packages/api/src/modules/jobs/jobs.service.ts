import type { JobDto, Paginated } from '@marketplace/shared';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  JobStatus as PrismaJobStatus,
  RequestStatus as PrismaRequestStatus,
  type Job,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ListJobsQueryDto } from './dto/list-jobs-query.dto';
import { jobInclude, toJobDto } from './job.mapper';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: ListJobsQueryDto,
    userId: string,
  ): Promise<Paginated<JobDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = {
      OR: [{ requesterId: userId }, { providerId: userId }],
      ...(query.status
        ? { status: query.status as unknown as PrismaJobStatus }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.job.findMany({
        where,
        include: jobInclude,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.job.count({ where }),
    ]);

    return { items: items.map(toJobDto), total, page, limit };
  }

  async findOne(id: string, userId: string): Promise<JobDto> {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: jobInclude,
    });
    this.assertParticipant(job, userId);
    return toJobDto(job);
  }

  async complete(id: string, userId: string): Promise<JobDto> {
    const job = await this.prisma.job.findUnique({ where: { id } });
    this.assertParticipant(job, userId);
    if (job.status !== PrismaJobStatus.ACTIVE) {
      throw new BadRequestException('Only active jobs can be completed');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const completedJob = await tx.job.update({
        where: { id },
        data: {
          status: PrismaJobStatus.COMPLETED,
          completedAt: new Date(),
        },
        include: jobInclude,
      });
      await tx.serviceRequest.update({
        where: { id: job.requestId },
        data: { status: PrismaRequestStatus.COMPLETED },
      });
      return completedJob;
    });

    return toJobDto(updated);
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
