import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { CreateCategoryRequest } from '@marketplace/shared';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CategoryAttributeDto } from './category-attribute.dto';

export class CreateCategoryDto implements CreateCategoryRequest {
  @ApiProperty({ example: 'appliance-repair' })
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  @MaxLength(120)
  slug!: string;

  @ApiProperty({ example: 'Appliance repair' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiProperty({ type: [CategoryAttributeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryAttributeDto)
  attributeSchema!: CategoryAttributeDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
