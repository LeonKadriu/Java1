import { AttributeType, type RequestAttributes } from '@marketplace/shared';
import { BadRequestException } from '@nestjs/common';
import { parseAttributeSchema } from '../categories/category.mapper';

export function validateRequestAttributes(
  schema: unknown,
  attributes: RequestAttributes | undefined,
): void {
  const definitions = parseAttributeSchema(schema);
  const values = attributes ?? {};

  if (typeof values !== 'object' || Array.isArray(values)) {
    throw new BadRequestException('attributes must be an object');
  }

  const allowedKeys = new Set(definitions.map((definition) => definition.key));
  for (const key of Object.keys(values)) {
    if (!allowedKeys.has(key)) {
      throw new BadRequestException(`Unknown attribute: ${key}`);
    }
  }

  for (const definition of definitions) {
    const value = values[definition.key];

    if (value === undefined || value === null || value === '') {
      if (definition.required) {
        throw new BadRequestException(`${definition.label} is required`);
      }
      continue;
    }

    switch (definition.type) {
      case AttributeType.TEXT:
        if (typeof value !== 'string') {
          throw new BadRequestException(`${definition.label} must be text`);
        }
        break;
      case AttributeType.NUMBER:
        if (typeof value !== 'number' || !Number.isFinite(value)) {
          throw new BadRequestException(`${definition.label} must be a number`);
        }
        break;
      case AttributeType.DATE:
        if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
          throw new BadRequestException(`${definition.label} must be a date`);
        }
        break;
      case AttributeType.BOOLEAN:
        if (typeof value !== 'boolean') {
          throw new BadRequestException(`${definition.label} must be true or false`);
        }
        break;
      case AttributeType.SELECT:
        if (
          typeof value !== 'string' ||
          !definition.options?.includes(value)
        ) {
          throw new BadRequestException(
            `${definition.label} must be one of: ${definition.options?.join(', ') ?? 'none'}`,
          );
        }
        break;
      default:
        throw new BadRequestException(
          `Unsupported attribute type: ${String(definition.type)}`,
        );
    }
  }
}
