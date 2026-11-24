import { ApiProperty } from '@nestjs/swagger';
import type { LoginRequest } from '@marketplace/shared';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto implements LoginRequest {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'strong-password' })
  @IsString()
  @MinLength(1)
  @MaxLength(72)
  password!: string;
}
