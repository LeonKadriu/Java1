import { ApiPropertyOptional } from '@nestjs/swagger';
import type { UpdateRequestRequest } from '@marketplace/shared';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
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
import { RequestStatus } from '@marketplace/shared';

export class UpdateRequestDto implements UpdateRequestRequest {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(150)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  description?: string;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  attributes?: Record<string, string | number | boolean | null>;

  @ApiPropertyOptional({ enum: RequestStatus })
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;
}
