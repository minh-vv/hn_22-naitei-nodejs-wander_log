import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
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
    const user = await this.findById(userId);
    return this.mapToUserProfile(user);
  }

  async getPublicProfile(
    userId: string,
  ): Promise<Omit<UserProfileDto, 'email'>> {
    const user = await this.findById(userId, { mustBeActive: true });
    return this.mapToPublicProfile(user);
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<UserProfileDto> {
    const user = await this.findById(userId, { mustBeActive: true });

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
    await this.findById(userId);

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

  async findById(
    userId: string,
    options?: { mustBeActive?: boolean },
  ): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(this.i18n.t('user.user_not_found'));
    }

    if (options?.mustBeActive && !user.isActive) {
      throw new ForbiddenException(this.i18n.t('user.account_inactive'));
    }

    return user;
  }

  async followUser(currentUser: User, targetUserId: string) {
    const userToFollow = await this.findById(targetUserId);

    if (currentUser.id === targetUserId) {
      throw new BadRequestException(this.i18n.t('user.cannot_follow_self'));
    }

    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: userToFollow.id,
        },
      },
    });

    if (existingFollow) {
      throw new ConflictException(this.i18n.t('user.already_following'));
    }

    await this.prisma.follow.create({
      data: {
        followerId: currentUser.id,
        followingId: userToFollow.id,
      },
    });

    return this.getProfileResponse(userToFollow, true);
  }

  async unfollowUser(currentUser: User, targetUserId: string) {
    const userToUnfollow = await this.findById(targetUserId);

    if (currentUser.id === targetUserId) {
      throw new BadRequestException(this.i18n.t('user.cannot_unfollow_self'));
    }

    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: userToUnfollow.id,
        },
      },
    });

    if (!existingFollow) {
      throw new NotFoundException(this.i18n.t('user.not_following_user'));
    }

    await this.prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: userToUnfollow.id,
        },
      },
    });

    return this.getProfileResponse(userToUnfollow, false);
  }

  private async getProfileResponse(user: User, following: boolean) {
    return {
      ...this.mapToPublicProfile(user),
      following,
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
