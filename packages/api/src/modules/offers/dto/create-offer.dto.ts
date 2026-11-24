import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { CreateOfferRequest } from '@marketplace/shared';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateOfferDto implements CreateOfferRequest {
  @ApiProperty({ example: 'I can repair this within two days.' })
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  message!: string;

  @ApiProperty({ example: 120 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(99999999)
  price!: number;

  @ApiPropertyOptional({ example: 'EUR' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  estimatedDays?: number;
}
