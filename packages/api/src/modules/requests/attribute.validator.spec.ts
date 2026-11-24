import { AttributeType, type CategoryAttribute } from '@marketplace/shared';
import { BadRequestException } from '@nestjs/common';
import { validateRequestAttributes } from './attribute.validator';

const schema: CategoryAttribute[] = [
  { key: 'brand', label: 'Brand', type: AttributeType.TEXT, required: true },
  { key: 'roomCount', label: 'Rooms', type: AttributeType.NUMBER },
  {
    key: 'lockType',
    label: 'Lock type',
    type: AttributeType.SELECT,
    options: ['Cylinder', 'Deadbolt'],
  },
];

describe('validateRequestAttributes', () => {
  it('accepts values that match the category schema', () => {
    expect(() =>
      validateRequestAttributes(schema, {
        brand: 'Samsung',
        roomCount: 3,
        lockType: 'Cylinder',
      }),
    ).not.toThrow();
  });

  it('rejects missing required attributes', () => {
    expect(() => validateRequestAttributes(schema, {})).toThrow(
      BadRequestException,
    );
  });

  it('rejects unknown attributes', () => {
    expect(() =>
      validateRequestAttributes(schema, { brand: 'Samsung', other: 'x' }),
    ).toThrow('Unknown attribute: other');
  });

  it('rejects values outside select options', () => {
    expect(() =>
      validateRequestAttributes(schema, { brand: 'Samsung', lockType: 'Other' }),
    ).toThrow(BadRequestException);
  });
});
