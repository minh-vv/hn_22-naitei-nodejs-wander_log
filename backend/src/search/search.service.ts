import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Visibility } from '@prisma/client';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async searchAll(query: string, page: number = 1, limit: number = 10) {
    const [users, itineraries, locations] = await Promise.all([
      this.searchUsers(query, page, limit),
      this.searchItineraries(query, page, limit),
      this.searchLocations(query, page, limit),
    ]);

    return {
      users,
      itineraries,
      locations,
    };
  }

  private async searchUsers(query: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    
    const whereCondition = {
      AND: [
        { isActive: true },
        {
          OR: [
            {
              name: {
                contains: query,
              },
            },
            {
              email: {
                contains: query,
              },
            },
            {
              bio: {
                contains: query,
              },
            },
          ],
        },
      ],
    };

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where: whereCondition,
        select: {
          id: true,
          name: true,
          avatar: true,
          bio: true,
          email: true,
        },
        skip,
        take: limit,
      }),
      this.prisma.user.count({
        where: whereCondition,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      totalPages,
    };
  }

  private async searchItineraries(query: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    
    const whereCondition = {
              AND: [
          { visibility: Visibility.PUBLIC },
        {
          OR: [
            {
              title: {
                contains: query,
              },
            },
            {
              destination: {
                contains: query,
              },
            },
          ],
        },
      ],
    };

    const [data, total] = await Promise.all([
      this.prisma.itinerary.findMany({
        where: whereCondition,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.itinerary.count({
        where: whereCondition,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      totalPages,
    };
  }

  private async searchLocations(query: string, page: number, limit: number) {
    const [activityLocations, destinationLocations] = await Promise.all([
      this.prisma.activity.findMany({
        where: {
          location: {
            contains: query,
          },
        },
        select: {
          location: true,
        },
        distinct: ['location'],
        take: 100, 
      }),
      this.prisma.itinerary.findMany({
        where: {
                  AND: [
          { visibility: Visibility.PUBLIC },
            {
              destination: {
                contains: query,
              },
            },
          ],
        },
        select: {
          destination: true,
        },
        distinct: ['destination'],
        take: 100,
      }),
    ]);

    const locationSet = new Set<string>();
    
    activityLocations.forEach(activity => {
      if (activity.location) {
        locationSet.add(activity.location);
      }
    });

    destinationLocations.forEach(itinerary => {
      if (itinerary.destination) {
        locationSet.add(itinerary.destination);
      }
    });

    const allLocations = Array.from(locationSet)
      .filter(location => 
        location.toLowerCase().includes(query.toLowerCase())
      )
      .map(location => ({ name: location }));

    const total = allLocations.length;
    const skip = (page - 1) * limit;
    const data = allLocations.slice(skip, skip + limit);
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      totalPages,
    };
  }
}
