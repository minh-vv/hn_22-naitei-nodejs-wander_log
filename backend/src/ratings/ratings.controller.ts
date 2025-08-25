// Trong file RatingsController.ts

import { Body, Controller, Post, UseGuards, Param, Get } from '@nestjs/common';
import { GetUser } from 'src/auth/get-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from '@prisma/client';
import { RatingsService } from './ratings.service';

@Controller('ratings')
@UseGuards(JwtAuthGuard)
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Get('average/:itineraryId')
  getAverageRating(@Param('itineraryId') itineraryId: string) {
    return this.ratingsService.getAverageRating(itineraryId);
  }

  // Thêm phương thức này vào controller
  @Get(':itineraryId/:userId')
  getUserRating(
    @Param('itineraryId') itineraryId: string,
    @Param('userId') userId: string,
  ) {
    return this.ratingsService.getUserRating(itineraryId, userId);
  }

  @Post(':itineraryId')
  createOrUpdate(
    @Param('itineraryId') itineraryId: string,
    @Body('value') value: number,
    @GetUser() user: User,
  ) {
    return this.ratingsService.create(itineraryId, value, user.id);
  }
}
