import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthResponse, UserDto } from '@marketplace/shared';
import type { AuthenticatedUser } from './auth.types';
import { AuthService } from './auth.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new account with an individual or company profile' })
  register(@Body() dto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in and receive a JWT' })
  login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the authenticated account and its profile' })
  me(@CurrentUser() user: AuthenticatedUser): Promise<UserDto> {
    return this.authService.me(user.id);
  }
}
