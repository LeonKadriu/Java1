import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttributeType, type CategoryAttribute } from '@marketplace/shared';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CategoryAttributeDto implements CategoryAttribute {
  @ApiProperty({ example: 'brand' })
  @IsString()
  @MaxLength(100)
  key!: string;

  @ApiProperty({ example: 'Brand' })
  @IsString()
  @MaxLength(150)
  label!: string;

  @ApiProperty({ enum: AttributeType })
  @IsIn(Object.values(AttributeType))
  type!: AttributeType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  unit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;
}
