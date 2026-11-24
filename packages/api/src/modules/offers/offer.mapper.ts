import { OfferStatus, type OfferDto } from '@marketplace/shared';
import type { Offer } from '@prisma/client';

interface ProviderSummary {
  profile: { displayName: string } | null;
}

export type OfferWithRelations = Offer & {
  provider: ProviderSummary | null;
  request: { title: string } | null;
};

export const offerInclude = {
  provider: { select: { profile: { select: { displayName: true } } } },
  request: { select: { title: true } },
} as const;

export function toOfferDto(offer: OfferWithRelations): OfferDto {
  return {
    id: offer.id,
    requestId: offer.requestId,
    providerId: offer.providerId,
    providerName: offer.provider?.profile?.displayName ?? null,
    requestTitle: offer.request?.title ?? '',
    message: offer.message,
    price: offer.price.toString(),
    currency: offer.currency,
    estimatedDays: offer.estimatedDays,
    status: offer.status as unknown as OfferStatus,
    createdAt: offer.createdAt.toISOString(),
    updatedAt: offer.updatedAt.toISOString(),
  };
}
