import { JobStatus, type JobDto } from '@marketplace/shared';
import type { Job } from '@prisma/client';

interface PartySummary {
  profile: { displayName: string } | null;
}

export type JobWithRelations = Job & {
  requester: PartySummary | null;
  provider: PartySummary | null;
  request: { title: string } | null;
};

export const jobInclude = {
  requester: { select: { profile: { select: { displayName: true } } } },
  provider: { select: { profile: { select: { displayName: true } } } },
  request: { select: { title: true } },
} as const;

export function toJobDto(job: JobWithRelations): JobDto {
  return {
    id: job.id,
    offerId: job.offerId,
    requestId: job.requestId,
    requesterId: job.requesterId,
    providerId: job.providerId,
    requesterName: job.requester?.profile?.displayName ?? null,
    providerName: job.provider?.profile?.displayName ?? null,
    requestTitle: job.request?.title ?? '',
    price: job.price.toString(),
    currency: job.currency,
    status: job.status as unknown as JobStatus,
    acceptedAt: job.acceptedAt.toISOString(),
    completedAt: job.completedAt ? job.completedAt.toISOString() : null,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  };
}
