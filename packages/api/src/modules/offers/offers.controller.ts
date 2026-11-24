import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole, type JobDto, type OfferDto } from '@marketplace/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { OffersService } from './offers.service';

@ApiTags('offers')
@ApiBearerAuth()
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post('request/:requestId')
  @Roles(UserRole.PROVIDER)
  @ApiOperation({ summary: 'Create or update your offer for a request' })
  create(
    @Param('requestId') requestId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateOfferDto,
  ): Promise<OfferDto> {
    return this.offersService.create(requestId, user.id, dto);
  }

  @Get('request/:requestId')
  @ApiOperation({ summary: 'List offers for a request' })
  findForRequest(
    @Param('requestId') requestId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OfferDto[]> {
    return this.offersService.findForRequest(requestId, user.id);
  }

  @Get('mine')
  @ApiOperation({ summary: 'List your offers' })
  findMine(@CurrentUser() user: AuthenticatedUser): Promise<OfferDto[]> {
    return this.offersService.findMine(user.id);
  }

  @Patch(':id')
  @Roles(UserRole.PROVIDER)
  @ApiOperation({ summary: 'Update a pending offer' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateOfferDto,
  ): Promise<OfferDto> {
    return this.offersService.update(id, user.id, dto);
  }

  @Post(':id/withdraw')
  @Roles(UserRole.PROVIDER)
  @ApiOperation({ summary: 'Withdraw a pending offer' })
  withdraw(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OfferDto> {
    return this.offersService.withdraw(id, user.id);
  }

  @Post(':id/accept')
  @Roles(UserRole.REQUESTER)
  @ApiOperation({ summary: 'Accept an offer and create the job' })
  accept(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<JobDto> {
    return this.offersService.accept(id, user.id);
  }
}
