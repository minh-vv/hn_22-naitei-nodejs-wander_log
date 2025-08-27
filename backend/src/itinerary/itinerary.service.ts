import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItineraryDto } from './dto/create-itinerary.dto';
import { UpdateItineraryDto } from './dto/update-itinerary.dto';
import { FilterItineraryDto } from './dto/filter-itinerary.dto';
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

    let baseSlug = slugify(title, {
      lower: true,
      locale: 'vi',
      remove: /[*+~.()'"!:@]/g,
    });
    let slug = baseSlug;
    let existingItinerary = await this.prisma.itinerary.findUnique({
      where: { slug },
    });
    let count = 1;

    while (existingItinerary) {
      slug = `${baseSlug}-${count}`;
      existingItinerary = await this.prisma.itinerary.findUnique({
        where: { slug },
      });
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

    const averageRating =
      itinerary.ratings.length > 0
        ? itinerary.ratings.reduce((acc, cur) => acc + cur.value, 0) /
          itinerary.ratings.length
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

    const averageRating =
      itinerary.ratings.length > 0
        ? itinerary.ratings.reduce((acc, cur) => acc + cur.value, 0) /
          itinerary.ratings.length
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

    if (
      updateItineraryDto.title &&
      updateItineraryDto.title !== itinerary.title
    ) {
      let baseSlug = slugify(updateItineraryDto.title, {
        lower: true,
        locale: 'vi',
        remove: /[*+~.()'"!:@]/g,
      });
      let newSlug = baseSlug;
      let existingItinerary = await this.prisma.itinerary.findUnique({
        where: { slug: newSlug },
      });
      let count = 1;

      while (existingItinerary && existingItinerary.id !== id) {
        newSlug = `${baseSlug}-${count}`;
        existingItinerary = await this.prisma.itinerary.findUnique({
          where: { slug: newSlug },
        });
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
        name: string | null;
        avatar: string | null;
      };
      views: number;
    };

    const itineraries = await this.prisma.itinerary.findMany({
      where: { visibility: 'PUBLIC' },
      orderBy: { views: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        budget: true,
        startDate: true,
        endDate: true,
        slug: true,
        views: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        posts: {
          select: { likeCount: true },
        },
      },
    });

    const result: FeaturedItineraryDto[] = itineraries.map((it) => {
      const totalLikes = it.posts.reduce((sum, p) => sum + p.likeCount, 0);
      return {
        id: it.id,
        title: it.title,
        budget: it.budget?.toNumber() ?? null,
        startDate: it.startDate,
        endDate: it.endDate,
        totalLikes,
        user: it.user,
        slug: it.slug,
        views: it.views,
      };
    });

    return result;
  }

  async increaseViews(slug: string) {
    return this.prisma.itinerary.update({
      where: { slug },
      data: { views: { increment: 1 } },
    });
  }

  async filterItineraries(filterDto: FilterItineraryDto) {
    const {
      searchQuery,
      destination,
      country,
      duration,
      budgetMin,
      budgetMax,
      budgetRange,
      minRating,
      tags,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = filterDto;

    const skip = (page - 1) * limit;

    const where: any = {
      visibility: 'PUBLIC',
    };

    if (searchQuery) {
      where.OR = [
        {
          title: {
            contains: searchQuery,
          },
        },
        {
          destination: {
            contains: searchQuery,
          },
        },
        {
          activities: {
            some: {
              OR: [
                {
                  name: {
                    contains: searchQuery,
                  },
                },
                {
                  location: {
                    contains: searchQuery,
                  },
                },
              ],
            },
          },
        },
      ];
    }

    if (destination) {
      const destinationCondition = {
        destination: {
          contains: destination,
        },
      };

      if (where.OR) {
        where.AND = where.AND || [];
        where.AND.push(destinationCondition);
      } else {
        where.destination = destinationCondition.destination;
      }
    }

    if (country) {
      const countryCondition = {
        destination: {
          contains: country,
        },
      };

      where.AND = where.AND || [];
      where.AND.push(countryCondition);
    }

    if (duration) {
      const durationConditions: any = {};
      
      switch (duration) {
        case '1-3':
          durationConditions.AND = [
            {
              OR: [
                {
                  AND: [
                    { startDate: { lte: new Date() } },
                    { endDate: { gte: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) } }
                  ]
                },
                {
                  startDate: { gte: new Date() }
                }
              ]
            }
          ];
          break;
        case '4-7':
          durationConditions.startDate = { gte: new Date() };
          break;
        case '8-14':
          durationConditions.startDate = { gte: new Date() };
          break;
        case '15+':
          durationConditions.startDate = { gte: new Date() };
          break;
      }
      
      Object.assign(where, durationConditions);
    }

    if (budgetRange) {
      let budgetCondition: any = {};
      
      switch (budgetRange) {
        case 'under-5':
          budgetCondition = { budget: { lt: 5000000 } };
          break;
        case '5-10':
          budgetCondition = { 
            budget: { 
              gte: 5000000, 
              lte: 10000000 
            } 
          };
          break;
        case '10-20':
          budgetCondition = { 
            budget: { 
              gte: 10000000, 
              lte: 20000000 
            } 
          };
          break;
        case 'over-20':
          budgetCondition = { budget: { gt: 20000000 } };
          break;
      }
      
      where.AND = where.AND || [];
      where.AND.push(budgetCondition);
    }

    if (budgetMin !== undefined || budgetMax !== undefined) {
      const budgetCondition: any = {};
      
      if (budgetMin !== undefined) {
        budgetCondition.gte = budgetMin * 1000000; // Convert millions to actual value
      }
      
      if (budgetMax !== undefined) {
        budgetCondition.lte = budgetMax * 1000000;
      }
      
      where.AND = where.AND || [];
      where.AND.push({ budget: budgetCondition });
    }

    if (tags && tags.length > 0) {
      where.activities = {
        some: {
          OR: tags.map(tag => ({
            name: {
              contains: tag,
            },
          })),
        },
      };
    }

    if (minRating !== undefined) {
      where.ratings = {
        some: {
          value: {
            gte: minRating,
          },
        },
      };
    }

    let orderBy: any = {};
    switch (sortBy) {
      case 'startDate':
        orderBy = { startDate: sortOrder };
        break;
      case 'views':
        orderBy = { views: sortOrder };
        break;
      case 'title':
        orderBy = { title: sortOrder };
        break;
      case 'budget':
        orderBy = { budget: sortOrder };
        break;
      case 'rating':
        orderBy = { createdAt: sortOrder }; 
        break;
      default:
        orderBy = { createdAt: sortOrder };
    }

    const total = await this.prisma.itinerary.count({ where });

    const itineraries = await this.prisma.itinerary.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        destination: true,
        startDate: true,
        endDate: true,
        budget: true,
        coverImage: true,
        slug: true,
        views: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        activities: {
          select: {
            name: true,
            location: true,
          },
        },
        posts: {
          select: { likeCount: true },
        },
        ratings: {
          select: { value: true },
        },
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: itineraries.map(itinerary => ({
        ...itinerary,
        budget: itinerary.budget?.toNumber() ?? null,
        totalLikes: itinerary.posts.reduce((sum, post) => sum + post.likeCount, 0),
        averageRating: itinerary.ratings.length > 0 
          ? itinerary.ratings.reduce((sum, rating) => sum + rating.value, 0) / itinerary.ratings.length
          : 0,
        ratingsCount: itinerary.ratings.length,
      })),
      total,
      page,
      totalPages,
      limit,
    };
  }
}
