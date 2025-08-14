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
    return this.prisma.bookmark.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
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
