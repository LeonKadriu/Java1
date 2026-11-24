import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { JobDto, Paginated } from '@marketplace/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { ListJobsQueryDto } from './dto/list-jobs-query.dto';
import { JobsService } from './jobs.service';

@ApiTags('jobs')
@ApiBearerAuth()
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @ApiOperation({ summary: 'List jobs you are involved in' })
  findAll(
    @Query() query: ListJobsQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Paginated<JobDto>> {
    return this.jobsService.findAll(query, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a job by id' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<JobDto> {
    return this.jobsService.findOne(id, user.id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark an active job as completed' })
  complete(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<JobDto> {
    return this.jobsService.complete(id, user.id);
  }
}
