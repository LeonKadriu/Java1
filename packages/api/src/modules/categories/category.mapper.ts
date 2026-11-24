import type { CategoryAttribute, CategoryDto } from '@marketplace/shared';
import type { Category } from '@prisma/client';

export function parseAttributeSchema(value: unknown): CategoryAttribute[] {
  return Array.isArray(value) ? (value as CategoryAttribute[]) : [];
}

export function toCategoryDto(category: Category): CategoryDto {
  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    description: category.description,
    parentId: category.parentId,
    attributeSchema: parseAttributeSchema(category.attributeSchema),
    isActive: category.isActive,
    sortOrder: category.sortOrder,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
}
