import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CategoriesModule } from '../categories/categories.module';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';

@Module({
  imports: [PrismaModule, CategoriesModule],
  controllers: [RequestsController],
  providers: [RequestsService],
  exports: [RequestsService],
})
export class RequestsModule {}
