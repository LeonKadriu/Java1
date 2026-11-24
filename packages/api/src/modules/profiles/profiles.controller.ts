import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { ProfileDto } from '@marketplace/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfilesService } from './profiles.service';

@ApiTags('profiles')
@ApiBearerAuth()
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get the authenticated user profile' })
  findMe(@CurrentUser() user: AuthenticatedUser): Promise<ProfileDto> {
    return this.profilesService.findMe(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update the authenticated user profile' })
  updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<ProfileDto> {
    return this.profilesService.updateMe(user.id, dto);
  }
}
