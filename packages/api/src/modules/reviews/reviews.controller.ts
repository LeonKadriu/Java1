import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { ReviewDto } from '@marketplace/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('reviews')
@ApiBearerAuth()
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Review the other participant of a completed job' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateReviewDto,
  ): Promise<ReviewDto> {
    return this.reviewsService.create(user.id, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'List reviews you have written' })
  findMine(@CurrentUser() user: AuthenticatedUser): Promise<ReviewDto[]> {
    return this.reviewsService.findMine(user.id);
  }

  @Get('received')
  @ApiOperation({ summary: 'List reviews received about you' })
  findReceived(@CurrentUser() user: AuthenticatedUser): Promise<ReviewDto[]> {
    return this.reviewsService.findReceived(user.id);
  }

  @Get('job/:jobId')
  @ApiOperation({ summary: 'List reviews for a job' })
  findByJob(
    @Param('jobId') jobId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ReviewDto[]> {
    return this.reviewsService.findByJob(jobId, user.id);
  }
}
