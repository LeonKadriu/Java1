import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Paginated, RequestDto } from '@marketplace/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CreateRequestDto } from './dto/create-request.dto';
import { ListRequestsQueryDto } from './dto/list-requests-query.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { RequestsService } from './requests.service';

@ApiTags('requests')
@ApiBearerAuth()
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a request with category-specific attributes' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateRequestDto,
  ): Promise<RequestDto> {
    return this.requestsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Search requests with filters and pagination' })
  findAll(
    @Query() query: ListRequestsQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Paginated<RequestDto>> {
    return this.requestsService.findAll(query, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a request by id' })
  findOne(@Param('id') id: string): Promise<RequestDto> {
    return this.requestsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update your own request' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateRequestDto,
  ): Promise<RequestDto> {
    return this.requestsService.update(id, user.id, user.roles, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel your own request' })
  cancel(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<RequestDto> {
    return this.requestsService.cancel(id, user.id, user.roles);
  }
}
