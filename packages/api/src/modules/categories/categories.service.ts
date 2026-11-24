import type { CategoryDto } from '@marketplace/shared';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { toCategoryDto } from './category.mapper';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(activeOnly = true): Promise<CategoryDto[]> {
    const categories = await this.prisma.category.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    return categories.map(toCategoryDto);
  }

  async findTree(): Promise<CategoryDto[]> {
    const categories = await this.findAll();
    const nodes = new Map<string, CategoryDto>(
      categories.map((category) => [category.id, { ...category, children: [] }]),
    );
    const roots: CategoryDto[] = [];

    for (const node of nodes.values()) {
      const parent = node.parentId ? nodes.get(node.parentId) : undefined;
      if (parent) {
        parent.children!.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  async findOne(idOrSlug: string): Promise<CategoryDto> {
    const category = await this.prisma.category.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return toCategoryDto(category);
  }

  async create(dto: CreateCategoryDto): Promise<CategoryDto> {
    try {
      const category = await this.prisma.category.create({
        data: {
          slug: dto.slug,
          name: dto.name,
          description: dto.description,
          parentId: dto.parentId,
          attributeSchema: dto.attributeSchema as unknown as Prisma.InputJsonValue,
          isActive: dto.isActive ?? true,
          sortOrder: dto.sortOrder ?? 0,
        },
      });
      return toCategoryDto(category);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Category slug already exists');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryDto> {
    await this.findOne(id);

    const data: Prisma.CategoryUpdateInput = {};
    if (dto.slug !== undefined) data.slug = dto.slug;
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.attributeSchema !== undefined) {
      data.attributeSchema =
        dto.attributeSchema as unknown as Prisma.InputJsonValue;
    }
    if (dto.parentId !== undefined) {
      data.parent = dto.parentId
        ? { connect: { id: dto.parentId } }
        : { disconnect: true };
    }

    const category = await this.prisma.category.update({ where: { id }, data });
    return toCategoryDto(category);
  }

  async deactivate(id: string): Promise<CategoryDto> {
    await this.findOne(id);
    const category = await this.prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
    return toCategoryDto(category);
  }

  async getDescendantIds(categoryId: string): Promise<string[]> {
    const ids: string[] = [categoryId];
    let frontier = [categoryId];

    while (frontier.length > 0) {
      const children = await this.prisma.category.findMany({
        where: { parentId: { in: frontier } },
        select: { id: true },
      });
      const next = children
        .map((child) => child.id)
        .filter((childId) => !ids.includes(childId));
      if (next.length === 0) {
        break;
      }
      ids.push(...next);
      frontier = next;
    }

    return ids;
  }
}
