import { ApiProperty } from '@nestjs/swagger';
import {
  ProfileType,
  UserRole,
  type RegisterRequest,
} from '@marketplace/shared';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto implements RegisterRequest {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'strong-password', minLength: 8, maxLength: 72 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @ApiProperty({ example: 'Alex Morgan' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  displayName!: string;

  @ApiProperty({ enum: ProfileType })
  @IsEnum(ProfileType)
  type!: ProfileType;

  @ApiProperty({ enum: [UserRole.REQUESTER, UserRole.PROVIDER], isArray: true })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(2)
  @IsIn([UserRole.REQUESTER, UserRole.PROVIDER], { each: true })
  roles!: UserRole[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  companyName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;
}
