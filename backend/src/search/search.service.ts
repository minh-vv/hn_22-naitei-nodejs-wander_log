import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async searchAll(query: string) {
    const [users, itineraries, locations] = await Promise.all([
      this.searchUsers(query),
      this.searchItineraries(query),
      this.searchLocations(query),
    ]);

    return {
      users,
      itineraries,
      locations,
    };
  }

  private async searchUsers(query: string) {
    return this.prisma.user.findMany({
      where: {
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
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        bio: true,
        email: true,
      },
      take: 20,
    });
  }

  private async searchItineraries(query: string) {
    return this.prisma.itinerary.findMany({
      where: {
        AND: [
          { visibility: 'PUBLIC' },
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
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      take: 20,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  private async searchLocations(query: string) {
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
        take: 10,
      }),
      this.prisma.itinerary.findMany({
        where: {
          AND: [
            { visibility: 'PUBLIC' },
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
        take: 10,
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

    return Array.from(locationSet)
      .filter(location => 
        location.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 20)
      .map(location => ({
        name: location,
      }));
  }
}
