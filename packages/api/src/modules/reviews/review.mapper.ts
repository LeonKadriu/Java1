import { ReviewTarget, type ReviewDto } from '@marketplace/shared';
import type { Review } from '@prisma/client';

interface ReviewerSummary {
  profile: { displayName: string } | null;
}

export type ReviewWithRelations = Review & {
  reviewer: ReviewerSummary | null;
};

export const reviewInclude = {
  reviewer: { select: { profile: { select: { displayName: true } } } },
} as const;

export function toReviewDto(review: ReviewWithRelations): ReviewDto {
  return {
    id: review.id,
    jobId: review.jobId,
    reviewerId: review.reviewerId,
    reviewerName: review.reviewer?.profile?.displayName ?? null,
    targetId: review.targetId,
    targetType: review.targetType as unknown as ReviewTarget,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt.toISOString(),
  };
}
