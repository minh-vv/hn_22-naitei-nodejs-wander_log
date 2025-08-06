import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService, private readonly i18n: I18nService) {}

  async create(userId: string, createActivityDto: CreateActivityDto) {
    const itinerary = await this.prisma.itinerary.findUnique({
      where: { id: createActivityDto.itineraryId },
    });

    if (!itinerary) {
      throw new NotFoundException(this.i18n.t('itinerary.not_found', { args: { id: createActivityDto.itineraryId } }));
    }
    if (itinerary.userId !== userId) {
      throw new ForbiddenException(this.i18n.t('activity.forbidden_create'));
    }

    return this.prisma.activity.create({
      data: {
        ...createActivityDto,
        date: new Date(createActivityDto.date),
      },
    });
  }

  async findOne(id: string, userId: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
      include: {
        itinerary: true,
      },
    });

    if (!activity) {
      throw new NotFoundException(this.i18n.t('activity.not_found', { args: { id } }));
    }
    if (activity.itinerary.userId !== userId) {
      throw new ForbiddenException(this.i18n.t('activity.forbidden_access'));
    }
    return activity;
  }

  async update(id: string, userId: string, updateActivityDto: UpdateActivityDto) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
      include: {
        itinerary: true,
      },
    });

    if (!activity) {
      throw new NotFoundException(this.i18n.t('activity.not_found', { args: { id } }));
    }
    if (activity.itinerary.userId !== userId) {
      throw new ForbiddenException(this.i18n.t('activity.forbidden_update'));
    }

    const updatedData: any = { ...updateActivityDto };

    if (updateActivityDto.date) {
      updatedData.date = new Date(updateActivityDto.date);
    }

    return this.prisma.activity.update({
      where: { id },
      data: updatedData,
    });
  }

  async remove(id: string, userId: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
      include: {
        itinerary: true,
      },
    });

    if (!activity) {
      throw new NotFoundException(this.i18n.t('activity.not_found', { args: { id } }));
    }
    if (activity.itinerary.userId !== userId) {
      throw new ForbiddenException(this.i18n.t('activity.forbidden_delete'));
    }

    await this.prisma.activity.delete({
      where: { id },
    });

    return {
      message: this.i18n.t('activity.deleted_success', { args: { id } }),
    };
  }
}
