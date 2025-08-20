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
    currentUserId: string,
  ): Promise<Omit<UserProfileDto, 'email'> & { isFollowing: boolean }> {
    const user = await this.findById(userId, { mustBeActive: true });

    const follow = await this.prisma.follow.findFirst({
      where: {
        followerId: currentUserId,
        followingId: userId,
      },
    });

    return {
      ...this.mapToPublicProfile(user),
      isFollowing: !!follow,
    };
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
      followersCount,
      followingCount,
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
      this.prisma.follow.count({
        where: { followingId: userId },
      }),
      this.prisma.follow.count({
        where: { followerId: userId },
      }),
    ]);

    return {
      totalItineraries,
      totalPosts,
      totalActivities,
      publicItineraries,
      privateItineraries,
      followersCount,
      followingCount,
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

  async followUser(currentUserId: string, targetUserId: string) {
    const [currentUser, userToFollow] = await Promise.all([
      this.findById(currentUserId),
      this.findById(targetUserId),
    ]);

    if (currentUserId === targetUserId) {
      throw new BadRequestException(this.i18n.t('user.cannot_follow_self'));
    }

    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      throw new ConflictException(this.i18n.t('user.already_following'));
    }

    await this.prisma.follow.create({
      data: {
        followerId: currentUserId,
        followingId: targetUserId,
      },
    });

    return this.getProfileResponse(userToFollow, true);
  }

  async unfollowUser(currentUserId: string, targetUserId: string) {
    const userToUnfollow = await this.findById(targetUserId);

    if (currentUserId === targetUserId) {
      throw new BadRequestException(this.i18n.t('user.cannot_unfollow_self'));
    }

    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    });

    if (!existingFollow) {
      throw new NotFoundException(this.i18n.t('user.not_following_user'));
    }

    await this.prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
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

  async getUserItineraries(userId: string) {
    return this.prisma.itinerary.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            posts: true,
            activities: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserPublicItineraries(userId: string) {
    return this.prisma.itinerary.findMany({
      where: {
        userId,
        visibility: 'PUBLIC',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            posts: true,
            activities: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserPost(userId: string) {
    const posts = await this.prisma.post.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        itinerary: {
          select: {
            id: true,
            title: true,
            budget: true,
          },
        },
        media: {
          select: {
            id: true,
            url: true,
          },
        },
        favoritedBy: {
          where: { userId },
          select: { userId: true },
        },
      },
    });

    const formattedPosts = posts.map((post) => ({
      ...post,
      isLiked: post.favoritedBy.length > 0,
    }));

    return formattedPosts;
  }
}
