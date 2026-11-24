import {
  UserRole,
  type Paginated,
  type RequestDto,
} from '@marketplace/shared';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  RequestStatus as PrismaRequestStatus,
  type ServiceRequest,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CategoriesService } from '../categories/categories.service';
import { validateRequestAttributes } from './attribute.validator';
import { CreateRequestDto } from './dto/create-request.dto';
import { ListRequestsQueryDto } from './dto/list-requests-query.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { asAttributes, requestInclude, toRequestDto } from './request.mapper';

@Injectable()
export class RequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(userId: string, dto: CreateRequestDto): Promise<RequestDto> {
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category || !category.isActive) {
      throw new BadRequestException('Category is not available');
    }

    validateRequestAttributes(category.attributeSchema, dto.attributes);
    this.validateDates(dto.startsAt, dto.endsAt);

    const request = await this.prisma.serviceRequest.create({
      data: {
        requesterId: userId,
        categoryId: dto.categoryId,
        title: dto.title.trim(),
        description: dto.description.trim(),
        city: dto.city?.trim() || null,
        country: dto.country?.trim() || null,
        address: dto.address?.trim() || null,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
        budgetAmount: dto.budgetAmount ?? null,
        currency: dto.currency?.trim() || 'EUR',
        attributes: (dto.attributes ?? {}) as Prisma.InputJsonValue,
      },
      include: requestInclude,
    });

    return toRequestDto(request);
  }

  async findAll(
    query: ListRequestsQueryDto,
    userId: string,
  ): Promise<Paginated<RequestDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.ServiceRequestWhereInput = {};

    if (query.status) {
      where.status = query.status as unknown as PrismaRequestStatus;
    } else if (!query.mine) {
      where.status = PrismaRequestStatus.OPEN;
    }

    if (query.mine) {
      where.requesterId = userId;
    }
    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
      ];
    }
    if (query.categoryId) {
      const categoryIds = await this.categoriesService.getDescendantIds(
        query.categoryId,
      );
      where.categoryId = { in: categoryIds };
    }
    if (query.city) {
      where.city = { contains: query.city, mode: 'insensitive' };
    }
    if (query.minBudget !== undefined || query.maxBudget !== undefined) {
      where.budgetAmount = {
        gte: query.minBudget,
        lte: query.maxBudget,
      };
    }
    if (query.from) {
      where.startsAt = { ...(where.startsAt as object), gte: new Date(query.from) };
    }
    if (query.to) {
      where.startsAt = { ...(where.startsAt as object), lte: new Date(query.to) };
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.serviceRequest.findMany({
        where,
        include: requestInclude,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.serviceRequest.count({ where }),
    ]);

    return {
      items: items.map(toRequestDto),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<RequestDto> {
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id },
      include: requestInclude,
    });
    if (!request) {
      throw new NotFoundException('Request not found');
    }
    return toRequestDto(request);
  }

  async update(
    id: string,
    userId: string,
    roles: UserRole[],
    dto: UpdateRequestDto,
  ): Promise<RequestDto> {
    const existing = await this.prisma.serviceRequest.findUnique({
      where: { id },
    });
    this.assertOwner(existing, userId, roles);

    if (dto.categoryId !== undefined || dto.attributes !== undefined) {
      const categoryId = dto.categoryId ?? existing!.categoryId;
      const category = await this.prisma.category.findUnique({
        where: { id: categoryId },
      });
      if (!category || !category.isActive) {
        throw new BadRequestException('Category is not available');
      }
      const attributes =
        dto.attributes ?? asAttributes(existing!.attributes);
      validateRequestAttributes(category.attributeSchema, attributes);
    }

    const startsAt = dto.startsAt ?? existing!.startsAt?.toISOString();
    const endsAt = dto.endsAt ?? existing!.endsAt?.toISOString();
    this.validateDates(startsAt, endsAt);

    const data: Prisma.ServiceRequestUpdateInput = {};
    if (dto.categoryId !== undefined) {
      data.category = { connect: { id: dto.categoryId } };
    }
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.description !== undefined) data.description = dto.description.trim();
    if (dto.city !== undefined) data.city = dto.city.trim() || null;
    if (dto.country !== undefined) data.country = dto.country.trim() || null;
    if (dto.address !== undefined) data.address = dto.address.trim() || null;
    if (dto.startsAt !== undefined) {
      data.startsAt = new Date(dto.startsAt);
    }
    if (dto.endsAt !== undefined) {
      data.endsAt = new Date(dto.endsAt);
    }
    if (dto.budgetAmount !== undefined) data.budgetAmount = dto.budgetAmount;
    if (dto.currency !== undefined) data.currency = dto.currency.trim();
    if (dto.attributes !== undefined) {
      data.attributes = dto.attributes as Prisma.InputJsonValue;
    }
    if (dto.status !== undefined) {
      data.status = dto.status as unknown as PrismaRequestStatus;
    }

    const request = await this.prisma.serviceRequest.update({
      where: { id },
      data,
      include: requestInclude,
    });
    return toRequestDto(request);
  }

  async cancel(
    id: string,
    userId: string,
    roles: UserRole[],
  ): Promise<RequestDto> {
    const existing = await this.prisma.serviceRequest.findUnique({
      where: { id },
    });
    this.assertOwner(existing, userId, roles);

    const request = await this.prisma.serviceRequest.update({
      where: { id },
      data: { status: PrismaRequestStatus.CANCELLED },
      include: requestInclude,
    });
    return toRequestDto(request);
  }

  private assertOwner(
    existing: { requesterId: string } | null,
    userId: string,
    roles: UserRole[],
  ): asserts existing is ServiceRequest {
    if (!existing) {
      throw new NotFoundException('Request not found');
    }
    if (existing.requesterId !== userId && !roles.includes(UserRole.ADMIN)) {
      throw new ForbiddenException('Only the requester can modify this request');
    }
  }

  private validateDates(startsAt?: string | null, endsAt?: string | null): void {
    if (startsAt && Number.isNaN(Date.parse(startsAt))) {
      throw new BadRequestException('startsAt must be a valid date');
    }
    if (endsAt && Number.isNaN(Date.parse(endsAt))) {
      throw new BadRequestException('endsAt must be a valid date');
    }
    if (
      startsAt &&
      endsAt &&
      new Date(endsAt).getTime() < new Date(startsAt).getTime()
    ) {
      throw new BadRequestException('endsAt must be after startsAt');
    }
  }
}
