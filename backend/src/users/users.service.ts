import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { UserStatsDto } from './dto/user-stats.dto';
import { I18nService } from 'nestjs-i18n';
import { User, Visibility } from '@prisma/client';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { RatingsService } from '../ratings/ratings.service'; 

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private readonly i18n: I18nService,
    @Inject(forwardRef(() => NotificationsGateway))
    private notificationsGateway: NotificationsGateway,
    private ratingsService: RatingsService, 
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

    try {
      await this.notificationsGateway.emitNewFollowNotification(currentUserId, targetUserId);
    } catch (error) {
      console.error('Failed to send follow notification:', error);
    }

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
      location: user.location,
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
      location: user.location,
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
            slug: true,
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


  async getFollowersList(userId: string, currentUserId: string) {
    const user = await this.findById(userId);

    const followers = await this.prisma.follow.findMany({
        where: {
            followingId: user.id,
        },
        select: {
            follower: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                    bio: true,
                },
            },
        },
    });

    const followerIds = followers.map(f => f.follower.id);

    const followedByCurrentUser = await this.prisma.follow.findMany({
        where: {
            followerId: currentUserId,
            followingId: { in: followerIds },
        },
        select: {
            followingId: true,
        },
    });

    const followedByIds = new Set(followedByCurrentUser.map(f => f.followingId));

    return followers.map(f => ({
        ...f.follower,
        isFollowing: followedByIds.has(f.follower.id),
    }));
  }


  async getFollowingList(userId: string, currentUserId: string) {
    const user = await this.findById(userId);

    const following = await this.prisma.follow.findMany({
        where: {
            followerId: user.id,
        },
        select: {
            following: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                    bio: true,
                },
            },
        },
    });

    const followingIds = following.map(f => f.following.id);

    const followedByCurrentUser = await this.prisma.follow.findMany({
        where: {
            followerId: currentUserId,
            followingId: { in: followingIds },
        },
        select: {
            followingId: true,
        },
    });

    const followedByIds = new Set(followedByCurrentUser.map(f => f.followingId));

    return following.map(f => ({
        ...f.following,
        isFollowing: followedByIds.has(f.following.id),
    }));
  }

  async getFeaturedBloggers(take: number = 8, currentUserId?: string) {
    const publicItineraries = await this.prisma.itinerary.findMany({
      where: { visibility: 'PUBLIC' },
      select: {
        id: true,
        userId: true,
        views: true,
      },
    });

    const userRatingCounts = new Map<string, number>();
    const userItineraryViews = new Map<string, number>();

    for (const itinerary of publicItineraries) {
      const { averageRating } = await this.ratingsService.getAverageRating(itinerary.id);
      
      if (averageRating >= 4.0) {
        userRatingCounts.set(
          itinerary.userId,
          (userRatingCounts.get(itinerary.userId) || 0) + 1,
        );
      }
      
      userItineraryViews.set(
        itinerary.userId,
        (userItineraryViews.get(itinerary.userId) || 0) + (itinerary.views || 0),
      );
    }

    const sortedUserIds = Array.from(userRatingCounts.entries())
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, take)
      .map(([userId]) => userId);

    if (sortedUserIds.length === 0) {
      return [];
    }

    const featuredBloggers = await this.prisma.user.findMany({
      where: {
        id: {
          in: sortedUserIds,
        },
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        bio: true,
        location: true,
        _count: {
          select: {
            followedBy: true,
            itineraries: { where: { visibility: Visibility.PUBLIC } },
          },
        },
      },
    });
    
    let followingIds = new Set<string>();
    if (currentUserId) {
        const following = await this.prisma.follow.findMany({
            where: {
                followerId: currentUserId,
                followingId: { in: sortedUserIds },
            },
            select: { followingId: true },
        });
        followingIds = new Set(following.map(f => f.followingId));
    }

    return featuredBloggers.map(blogger => {
      const totalViews = userItineraryViews.get(blogger.id) || 0;
      const itinerariesCount = blogger._count.itineraries;
      const followersCount = blogger._count.followedBy;
      
      return {
        id: blogger.id,
        name: blogger.name,
        avatar: blogger.avatar,
        bio: blogger.bio,
        location: blogger.location,
        isFollowing: followingIds.has(blogger.id),
        followersCount,
        itinerariesCount,
        totalViews,
      };
    });
  }
}
