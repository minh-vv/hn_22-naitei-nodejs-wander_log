import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ItineraryService } from '../itinerary/itinerary.service'; 

@Injectable()
export class RatingsService {
  constructor(
    private prisma: PrismaService,
    private itineraryService: ItineraryService,
  ) {}

  
  async create(itineraryId: string, value: number, userId: string) {
    const itinerary = await this.itineraryService.findOneById(itineraryId, userId);
    
    if (itinerary.userId === userId) {
      throw new ForbiddenException('You cannot rate your own itinerary.');
    }

    const existingRating = await this.prisma.rating.findUnique({
      where: {
        userId_itineraryId: {
          userId,
          itineraryId,
        },
      },
    });

    if (existingRating) {
      return this.prisma.rating.update({
        where: { id: existingRating.id },
        data: { value },
      });
    }

    return this.prisma.rating.create({
      data: {
        itineraryId,
        value,
        userId,
      },
    });
  }

  async getAverageRating(itineraryId: string) {
    const result = await this.prisma.rating.aggregate({
      _avg: {
        value: true,
      },
      _count: {
        value: true,
      },
      where: {
        itineraryId,
      },
    });

    const averageRating = result._avg.value ? parseFloat(result._avg.value.toFixed(1)) : 0;
    const ratingCount = result._count.value;

    return { averageRating, ratingCount };
  }

  async getUserRating(itineraryId: string, userId: string) {
    return this.prisma.rating.findUnique({
      where: {
        userId_itineraryId: {
          userId,
          itineraryId,
        },
      },
      select: {
        value: true,
      },
    });
  }
}
