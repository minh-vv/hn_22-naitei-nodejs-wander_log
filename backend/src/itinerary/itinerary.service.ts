import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItineraryDto } from './dto/create-itinerary.dto';
import { UpdateItineraryDto } from './dto/update-itinerary.dto';
import { I18nService } from 'nestjs-i18n';
import { ITINERARY_FEATURED_LIMIT } from '../config/itinerary.config';
const slugify = require('slugify');

@Injectable()
export class ItineraryService {
  constructor(
    private prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  async create(userId: string, createItineraryDto: CreateItineraryDto) {
    const { title, ...rest } = createItineraryDto;

    let baseSlug = slugify(title, { lower: true, locale: 'vi', remove: /[*+~.()'"!:@]/g });
    let slug = baseSlug;
    let existingItinerary = await this.prisma.itinerary.findUnique({ where: { slug } });
    let count = 1;

    while (existingItinerary) {
      slug = `${baseSlug}-${count}`;
      existingItinerary = await this.prisma.itinerary.findUnique({ where: { slug } });
      count++;
    }

    return this.prisma.itinerary.create({
      data: {
        ...rest,
        title,
        startDate: new Date(createItineraryDto.startDate),
        endDate: new Date(createItineraryDto.endDate),
        userId,
        slug,
      },
      include: {
        user: true,
        posts: true,
        activities: true,
        ratings: true, 
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.itinerary.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
      },
    });
  }

  async findOne(slug: string, userId: string) {
    const itinerary = await this.prisma.itinerary.findUnique({
      where: { slug },
      include: {
        user: true,
        ratings: { select: { value: true, userId: true } }, 
        activities: {
          orderBy: {
            startTime: 'asc',
          },
        },
        posts: { 
          include: {
            user: true,
            media: true,
          },
          orderBy: { createdAt: 'desc' }, 
        },
      },
    });

    if (!itinerary) {
      throw new NotFoundException(
        this.i18n.t('itinerary.not_found', { args: { slug: slug } }),
      );
    }

    if (itinerary.userId !== userId && itinerary.visibility === 'PRIVATE') {
      throw new ForbiddenException(this.i18n.t('itinerary.forbidden_access'));
    }

    const averageRating = itinerary.ratings.length > 0
      ? itinerary.ratings.reduce((acc, cur) => acc + cur.value, 0) / itinerary.ratings.length
      : 0;
      
    return {
      ...itinerary,
      averageRating: parseFloat(averageRating.toFixed(1)), 
      ratingCount: itinerary.ratings.length,
    };
  }

  async findOneById(id: string, userId: string) {
    const itinerary = await this.prisma.itinerary.findUnique({
      where: { id },
      include: {
        user: true,
        ratings: { select: { value: true, userId: true } }, 
        activities: {
          orderBy: {
            startTime: 'asc',
          },
        },
        posts: { 
          include: {
            user: true,
            media: true,
          },
          orderBy: { createdAt: 'desc' }, 
        },
      },
    });

    if (!itinerary) {
      throw new NotFoundException(
        this.i18n.t('itinerary.not_found', { args: { id: id } }),
      );
    }

    const averageRating = itinerary.ratings.length > 0
      ? itinerary.ratings.reduce((acc, cur) => acc + cur.value, 0) / itinerary.ratings.length
      : 0;
      
    return {
      ...itinerary,
      averageRating: parseFloat(averageRating.toFixed(1)), 
      ratingCount: itinerary.ratings.length,
    };
  }

  async update(
    id: string,
    userId: string,
    updateItineraryDto: UpdateItineraryDto,
  ) {
    const itinerary = await this.prisma.itinerary.findUnique({
      where: { id },
    });

    if (!itinerary) {
      throw new NotFoundException(
        this.i18n.t('itinerary.not_found', {
          args: { id },
        }),
      );
    }

    if (itinerary.userId !== userId) {
      throw new ForbiddenException(this.i18n.t('itinerary.forbidden_update'));
    }

    const dataToUpdate: any = { ...updateItineraryDto };

    if (updateItineraryDto.title && updateItineraryDto.title !== itinerary.title) {
      let baseSlug = slugify(updateItineraryDto.title, { lower: true, locale: 'vi', remove: /[*+~.()'"!:@]/g });
      let newSlug = baseSlug;
      let existingItinerary = await this.prisma.itinerary.findUnique({ where: { slug: newSlug } });
      let count = 1;

      while (existingItinerary && existingItinerary.id !== id) {
        newSlug = `${baseSlug}-${count}`;
        existingItinerary = await this.prisma.itinerary.findUnique({ where: { slug: newSlug } });
        count++;
      }
      dataToUpdate.slug = newSlug;
    }

    return this.prisma.itinerary.update({
      where: { id },
      data: dataToUpdate,
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
        }),
      );
    }

    if (itinerary.userId !== userId) {
      throw new ForbiddenException(this.i18n.t('itinerary.forbidden_delete'));
    }

    await this.prisma.itinerary.delete({
      where: { id },
    });

    await this.prisma.bookmark.deleteMany({
      where: { itemId: id, type: 'ITINERARY' },
    });
    
    await this.prisma.rating.deleteMany({ 
      where: { itineraryId: id },
    });

    return {
      message: this.i18n.t('itinerary.deleted_success', {
        args: { id },
      }),
    };
  }

  async findFeaturedItinerary(limit = ITINERARY_FEATURED_LIMIT) {
    type FeaturedItineraryDto = {
      id: string;
      title: string;
      budget: number | null;
      startDate: Date;
      endDate: Date;
      totalLikes: number;
      slug: string;
      user: {
        id: string;
        name: string;
        avatar: string | null;
      };
    };

    const groupedPosts = await this.prisma.post.groupBy({
      by: ['itineraryId'],
      where: { itinerary: { visibility: 'PUBLIC' } },
      _sum: { likeCount: true },
      orderBy: { _sum: { likeCount: 'desc' } },
      take: limit,
    });

    if (!groupedPosts.length) return [];

    const itineraryIds = groupedPosts.map((p) => p.itineraryId);

    const itineraries = await this.prisma.itinerary.findMany({
      where: { id: { in: itineraryIds } },
      select: {
        id: true,
        title: true,
        budget: true,
        startDate: true,
        endDate: true,
        slug: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    const itineraryMap = new Map(itineraries.map((it) => [it.id, it]));

    const result: FeaturedItineraryDto[] = groupedPosts
      .map(({ itineraryId, _sum }) => {
        const itinerary = itineraryMap.get(itineraryId);
        if (!itinerary) return null;
        return {
          id: itinerary.id,
          title: itinerary.title,
          budget: itinerary.budget?.toNumber() ?? null,
          startDate: itinerary.startDate,
          endDate: itinerary.endDate,
          totalLikes: _sum.likeCount ?? 0,
          user: itinerary.user,
          slug: itinerary.slug,
        };
      })
      .filter(
        (itinerary): itinerary is FeaturedItineraryDto => itinerary !== null,
      );

    return result;
  }

  
  async increaseViews(slug: string) {
      return this.prisma.itinerary.update({
        where: { slug },
        data: { views: { increment: 1 } },
      });
    }
}
