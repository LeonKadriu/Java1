import type { JobDto, OfferDto } from '@marketplace/shared';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OfferStatus as PrismaOfferStatus,
  RequestStatus as PrismaRequestStatus,
  type Offer,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { jobInclude, toJobDto } from '../jobs/job.mapper';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { offerInclude, toOfferDto } from './offer.mapper';

@Injectable()
export class OffersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    requestId: string,
    providerId: string,
    dto: CreateOfferDto,
  ): Promise<OfferDto> {
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) {
      throw new NotFoundException('Request not found');
    }
    if (request.status !== PrismaRequestStatus.OPEN) {
      throw new BadRequestException('This request is no longer open');
    }
    if (request.requesterId === providerId) {
      throw new BadRequestException('You cannot make an offer on your own request');
    }

    const data = {
      message: dto.message.trim(),
      price: dto.price,
      currency: dto.currency?.trim() || 'EUR',
      estimatedDays: dto.estimatedDays ?? null,
      status: PrismaOfferStatus.PENDING,
    };

    const offer = await this.prisma.offer.upsert({
      where: {
        requestId_providerId: { requestId, providerId },
      },
      update: data,
      create: { requestId, providerId, ...data },
      include: offerInclude,
    });

    return toOfferDto(offer);
  }

  async findForRequest(requestId: string, userId: string): Promise<OfferDto[]> {
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) {
      throw new NotFoundException('Request not found');
    }

    const offers = await this.prisma.offer.findMany({
      where:
        request.requesterId === userId
          ? { requestId }
          : { requestId, providerId: userId },
      include: offerInclude,
      orderBy: { createdAt: 'desc' },
    });

    return offers.map(toOfferDto);
  }

  async findMine(providerId: string): Promise<OfferDto[]> {
    const offers = await this.prisma.offer.findMany({
      where: { providerId },
      include: offerInclude,
      orderBy: { createdAt: 'desc' },
    });
    return offers.map(toOfferDto);
  }

  async update(
    id: string,
    providerId: string,
    dto: UpdateOfferDto,
  ): Promise<OfferDto> {
    const offer = await this.prisma.offer.findUnique({ where: { id } });
    this.assertOwnPendingOffer(offer, providerId);

    const data = {
      message: dto.message?.trim() ?? offer!.message,
      price: dto.price ?? offer!.price,
      currency: dto.currency?.trim() || offer!.currency,
      estimatedDays:
        dto.estimatedDays !== undefined
          ? dto.estimatedDays
          : offer!.estimatedDays,
    };

    const updated = await this.prisma.offer.update({
      where: { id },
      data,
      include: offerInclude,
    });
    return toOfferDto(updated);
  }

  async withdraw(id: string, providerId: string): Promise<OfferDto> {
    const offer = await this.prisma.offer.findUnique({ where: { id } });
    this.assertOwnPendingOffer(offer, providerId);

    const updated = await this.prisma.offer.update({
      where: { id },
      data: { status: PrismaOfferStatus.WITHDRAWN },
      include: offerInclude,
    });
    return toOfferDto(updated);
  }

  async accept(offerId: string, requesterId: string): Promise<JobDto> {
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
      include: { request: true },
    });
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    if (offer.request.requesterId !== requesterId) {
      throw new ForbiddenException('Only the requester can accept an offer');
    }
    if (offer.request.status !== PrismaRequestStatus.OPEN) {
      throw new BadRequestException('This request is no longer open');
    }
    if (offer.status !== PrismaOfferStatus.PENDING) {
      throw new BadRequestException('Only pending offers can be accepted');
    }

    const job = await this.prisma.$transaction(async (tx) => {
      await tx.offer.updateMany({
        where: {
          requestId: offer.requestId,
          id: { not: offerId },
          status: PrismaOfferStatus.PENDING,
        },
        data: { status: PrismaOfferStatus.REJECTED },
      });

      const accepted = await tx.offer.update({
        where: { id: offerId },
        data: { status: PrismaOfferStatus.ACCEPTED },
      });

      const createdJob = await tx.job.create({
        data: {
          offerId,
          requestId: offer.requestId,
          requesterId,
          providerId: offer.providerId,
          price: accepted.price,
          currency: accepted.currency,
        },
        include: jobInclude,
      });

      await tx.serviceRequest.update({
        where: { id: offer.requestId },
        data: { status: PrismaRequestStatus.CLOSED },
      });

      return createdJob;
    });

    return toJobDto(job);
  }

  private assertOwnPendingOffer(
    offer: Offer | null,
    providerId: string,
  ): asserts offer is Offer {
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    if (offer.providerId !== providerId) {
      throw new ForbiddenException('Only the offer owner can modify this offer');
    }
    if (offer.status !== PrismaOfferStatus.PENDING) {
      throw new BadRequestException('Only pending offers can be modified');
    }
  }
}
