import {
  RequestStatus,
  type RequestAttributes,
  type RequestDto,
} from '@marketplace/shared';
import type { Category, ServiceRequest } from '@prisma/client';

interface RequesterSummary {
  profile: { displayName: string } | null;
}

export type RequestWithRelations = ServiceRequest & {
  category: Category | null;
  requester: RequesterSummary | null;
};

export const requestInclude = {
  category: true,
  requester: {
    select: { profile: { select: { displayName: true } } },
  },
} as const;

export function asAttributes(value: unknown): RequestAttributes {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as RequestAttributes)
    : {};
}

export function toRequestDto(request: RequestWithRelations): RequestDto {
  return {
    id: request.id,
    requesterId: request.requesterId,
    categoryId: request.categoryId,
    title: request.title,
    description: request.description,
    city: request.city,
    country: request.country,
    address: request.address,
    startsAt: request.startsAt ? request.startsAt.toISOString() : null,
    endsAt: request.endsAt ? request.endsAt.toISOString() : null,
    budgetAmount: request.budgetAmount ? request.budgetAmount.toString() : null,
    currency: request.currency,
    status: request.status as unknown as RequestStatus,
    attributes: asAttributes(request.attributes),
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
    category: request.category
      ? {
          id: request.category.id,
          slug: request.category.slug,
          name: request.category.name,
        }
      : null,
    requesterName: request.requester?.profile?.displayName ?? null,
  };
}
