import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItineraryDto } from './dto/create-itinerary.dto';
import { UpdateItineraryDto } from './dto/update-itinerary.dto';
import { I18nService, I18nContext } from 'nestjs-i18n';

@Injectable()
export class ItineraryService {
  constructor(private prisma: PrismaService, private readonly i18n: I18nService) {}

  async create(userId: string, createItineraryDto: CreateItineraryDto) {
    return this.prisma.itinerary.create({
      data: {
        ...createItineraryDto,
        startDate: new Date(createItineraryDto.startDate),
        endDate: new Date(createItineraryDto.endDate),
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.itinerary.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
  async findOne(id: string) {
    const itinerary = await this.prisma.itinerary.findUnique({
      where: { id },
      include: {
        activities: {
          orderBy: {
            startTime: 'asc', 
          },
        },
      },
    });

    if (!itinerary) {
      throw new NotFoundException(
        this.i18n.t('itinerary.not_found', { 
          args: { id },
          lang: I18nContext.current()?.lang 
        })
      );
    }
    return itinerary;
  }

  async update(id: string, userId: string, updateItineraryDto: UpdateItineraryDto) {
    const itinerary = await this.prisma.itinerary.findUnique({
      where: { id },
    });

    if (!itinerary) {
      throw new NotFoundException(
        this.i18n.t('itinerary.not_found', { 
          args: { id },
          lang: I18nContext.current()?.lang 
        })
      );
    }
    
    if (itinerary.userId !== userId) {
      throw new ForbiddenException(
        this.i18n.t('itinerary.forbidden_update', {
          lang: I18nContext.current()?.lang
        })
      );
    }

    return this.prisma.itinerary.update({
      where: { id },
      data: updateItineraryDto,
    });
  }
  async remove(id: string, userId: string) {
    const itinerary = await this.prisma.itinerary.findUnique({
      where: { id },
    });

    if (!itinerary) {
      throw new NotFoundException(
        this.i18n.t('itinerary.not_found', { 
          args: { id },
          lang: I18nContext.current()?.lang 
        })
      );
    }
    
    if (itinerary.userId !== userId) {
      throw new ForbiddenException(
        this.i18n.t('itinerary.forbidden_delete', {
          lang: I18nContext.current()?.lang
        })
      );
    }
    
    await this.prisma.itinerary.delete({
      where: { id },
    });
    
    return { 
      message: this.i18n.t('itinerary.deleted_success', {
        args: { id },
        lang: I18nContext.current()?.lang
      }) 
    };
  }
}
