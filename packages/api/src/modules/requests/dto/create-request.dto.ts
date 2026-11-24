import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { CreateRequestRequest, RequestAttributes } from '@marketplace/shared';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateRequestDto implements CreateRequestRequest {
  @ApiProperty({ example: 'category-id' })
  @IsString()
  @MinLength(1)
  categoryId!: string;

  @ApiProperty({ example: 'Need a refrigerator repair' })
  @IsString()
  @MinLength(5)
  @MaxLength(150)
  title!: string;

  @ApiProperty({ example: 'My fridge stopped cooling...' })
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  description!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(150)
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(99999999)
  budgetAmount?: number;

  @ApiPropertyOptional({ example: 'EUR' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  attributes?: RequestAttributes;
}
