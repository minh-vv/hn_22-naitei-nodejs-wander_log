import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { I18nService } from 'nestjs-i18n';
import { BookmarkType } from '@prisma/client';

@Injectable()
export class BookmarksService {
  constructor(
    private prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  async isBookmarked(userId: string, type: BookmarkType, itemId: string) {
    const bookmark = await this.prisma.bookmark.findFirst({
      where: { userId, type, itemId },
    });

    if (bookmark) {
      return { isBookmarked: true, bookmarkId: bookmark.id };
    }

    return { isBookmarked: false };
  }

  async create(createBookmarkDto: CreateBookmarkDto, userId: string) {
    const { type, itemId } = createBookmarkDto;

    let exists: any;

    if (type === BookmarkType.ITINERARY) {
      exists = await this.prisma.itinerary.findUnique({
        where: { id: itemId },
      });
    } else if (type === BookmarkType.POST) {
      exists = await this.prisma.post.findUnique({
        where: { id: itemId },
      });
    } else {
      throw new BadRequestException(
        this.i18n.t('bookmark.invalid_type', { args: { type } }),
      );
    }

    if (!exists) {
      throw new NotFoundException(
        this.i18n.t('bookmark.item_not_found', { args: { id: itemId, type } }),
      );
    }

    return this.prisma.bookmark.create({
      data: {
        type,
        itemId,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    const bookmarks = await this.prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const enriched = await Promise.all(
      bookmarks.map(async (bm) => {
        if (bm.type === 'POST') {
          const post = await this.prisma.post.findUnique({
            where: { id: bm.itemId },
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

          const formattedPost = {
            ...post,
            isLiked: (post?.favoritedBy?.length ?? 0) > 0,
          };

          return {
            id: bm.id,
            title: post?.itinerary?.title ?? null,
            post: formattedPost,
            type: 'post',
            isLiked: (post?.favoritedBy?.length ?? 0) > 0,
            createdAt: bm.createdAt.toISOString().split('T')[0],
          };
        } else {
          const itinerary = await this.prisma.itinerary.findUnique({
            where: { id: bm.itemId },
            select: {
              id: true,
              title: true,
              destination: true,
              startDate: true,
              endDate: true,
            },
          });

          return {
            id: bm.id,
            title: itinerary?.title,
            itinerary: itinerary,
            type: 'itinerary',
            createdAt: bm.createdAt.toISOString().split('T')[0],
          };
        }
      }),
    );
    return enriched;
  }

  async remove(id: string, userId: string) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: { id },
    });

    if (!bookmark) {
      throw new NotFoundException(
        this.i18n.t('bookmark.not_found', { args: { id: id } }),
      );
    }

    if (bookmark.userId !== userId) {
      throw new ForbiddenException(this.i18n.t('bookmark.delete_forbidden'));
    }

    return this.prisma.bookmark.delete({
      where: { id },
    });
  }
}
