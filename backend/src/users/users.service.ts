import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { UserStatsDto } from './dto/user-stats.dto';
import { I18nService } from 'nestjs-i18n';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  async getProfile(userId: string): Promise<UserProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(this.i18n.t('user.user_not_found'));
    }

    return this.mapToUserProfile(user);
  }

  async getPublicProfile(userId: string): Promise<Omit<UserProfileDto, 'email'>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, isActive: true },
    });

    if (!user) {
      throw new NotFoundException(this.i18n.t('user.user_not_found'));
    }

    return this.mapToPublicProfile(user);
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<UserProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(this.i18n.t('user.user_not_found'));
    }

    if (!user.isActive) {
      throw new ForbiddenException(this.i18n.t('user.account_inactive'));
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...updateProfileDto,
        updatedAt: new Date(),
      },
    });

    return this.mapToUserProfile(updatedUser);
  }

  async getUserStats(userId: string): Promise<UserStatsDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(this.i18n.t('user.user_not_found'));
    }

    const [
      totalItineraries,
      totalPosts,
      totalActivities,
      publicItineraries,
      privateItineraries,
    ] = await Promise.all([
      this.prisma.itinerary.count({
        where: { userId },
      }),
      this.prisma.post.count({
        where: { userId },
      }),
      this.prisma.activity.count({
        where: { itinerary: { userId } },
      }),
      this.prisma.itinerary.count({
        where: { userId, visibility: 'PUBLIC' },
      }),
      this.prisma.itinerary.count({
        where: { userId, visibility: 'PRIVATE' },
      }),
    ]);

    return {
      totalItineraries,
      totalPosts,
      totalActivities,
      publicItineraries,
      privateItineraries,
    };
  }
  
  private mapToUserProfile(user: User): UserProfileDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      coverPhoto: user.coverPhoto,
      bio: user.bio,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private mapToPublicProfile(user: User): Omit<UserProfileDto, 'email'> {
    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      coverPhoto: user.coverPhoto,
      bio: user.bio,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
