import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationType } from '@prisma/client';
import { NotificationResponseDto } from './dto/notification-response.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<NotificationResponseDto> {
    const notification = await this.prisma.notification.create({
      data: createNotificationDto,
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
          },
        },
      },
    });

    return notification;
  }

  async findAllByUser(userId: string): Promise<NotificationResponseDto[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return notifications;
  }

  async findUnreadByUser(userId: string): Promise<NotificationResponseDto[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { 
        userId,
        isRead: false 
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return notifications;
  }

  async markAsRead(id: string, userId: string): Promise<NotificationResponseDto> {
    const notification = await this.prisma.notification.update({
      where: { 
        id,
        userId 
      },
      data: { isRead: true },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
          },
        },
      },
    });

    return notification;
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: { 
        userId,
        isRead: false 
      },
      data: { isRead: true },
    });

    return { count: result.count };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { 
        userId,
        isRead: false 
      },
    });
  }

  async createFollowNotification(followerId: string, followingId: string): Promise<NotificationResponseDto | null> {
    if (followerId === followingId) {
      return null;
    }

    const follower = await this.prisma.user.findUnique({
      where: { id: followerId },
      select: { name: true },
    });

    if (!follower) {
      return null;
    }

    const createNotificationDto: CreateNotificationDto = {
      type: NotificationType.NEW_FOLLOW,
      title: 'Người theo dõi mới',
      message: `${follower.name || 'Ai đó'} đã bắt đầu theo dõi bạn`,
      userId: followingId,
      fromUserId: followerId,
    };

    return this.create(createNotificationDto);
  }

  async createCommentNotification(commenterId: string, postId: string): Promise<NotificationResponseDto | null> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true },
    });

    if (!post || post.userId === commenterId) {
      return null;
    }

    const commenter = await this.prisma.user.findUnique({
      where: { id: commenterId },
      select: { name: true },
    });

    if (!commenter) {
      return null;
    }

    const createNotificationDto: CreateNotificationDto = {
      type: NotificationType.NEW_COMMENT,
      title: 'Bình luận mới',
      message: `${commenter.name || 'Ai đó'} đã bình luận về bài viết của bạn`,
      userId: post.userId,
      fromUserId: commenterId,
      postId,
    };

    return this.create(createNotificationDto);
  }

  async createLikeNotification(likerId: string, postId: string): Promise<NotificationResponseDto | null> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true },
    });

    if (!post || post.userId === likerId) {
      return null;
    }

    const liker = await this.prisma.user.findUnique({
      where: { id: likerId },
      select: { name: true },
    });

    if (!liker) {
      return null;
    }

    const createNotificationDto: CreateNotificationDto = {
      type: NotificationType.NEW_LIKE,
      title: 'Lượt thích mới',
      message: `${liker.name || 'Ai đó'} đã thích bài viết của bạn`,
      userId: post.userId,
      fromUserId: likerId,
      postId,
    };

    return this.create(createNotificationDto);
  }
}
