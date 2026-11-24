import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { validateEnv } from './config/env.validation';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { OffersModule } from './modules/offers/offers.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { RequestsModule } from './modules/requests/requests.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
      validate: validateEnv,
    }),
    PrismaModule,
    AuthModule,
    ProfilesModule,
    CategoriesModule,
    RequestsModule,
    OffersModule,
    JobsModule,
    ReviewsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
