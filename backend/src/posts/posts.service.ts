import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Visibility } from '@prisma/client';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  async create(userId: string, createPostDto: CreatePostDto) {
    const { content, itineraryId, mediaUrls } = createPostDto;

    const itinerary = await this.prisma.itinerary.findUnique({
      where: { id: itineraryId },
    });

    if (!itinerary) {
      throw new NotFoundException(
        this.i18n.t('itinerary.not_found', { args: { id: itineraryId } }),
      );
    }

    if (itinerary.visibility !== Visibility.PUBLIC) {
      throw new ForbiddenException(
        this.i18n.t('post.post_in_private_itinerary'),
      );
    }

    return this.prisma.post.create({
      data: {
        content,
        user: { connect: { id: userId } },
        itinerary: { connect: { id: itineraryId } },
        media: {
          create: mediaUrls.map((url) => ({ url })),
        },
      },
      include: {
        media: true,
      },
    });
  }

  async getAll() {
    const posts = await this.prisma.post.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            name: true,
            avatar: true,
          },
        },
        itinerary: {
          select: {
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
      },
    });

    return posts;
  }

  async update(postId: string, userId: string, updatePostDto: UpdatePostDto) {
    await this.findPostAndCheckOwnership(postId, userId);

    const { content, mediaUrlsToAdd, mediaIdsToDelete } = updatePostDto;

    const updatedPost = await this.prisma.$transaction(async (tx) => {
      if (mediaIdsToDelete && mediaIdsToDelete.length > 0) {
        await tx.media.deleteMany({
          where: {
            id: {
              in: mediaIdsToDelete,
            },
            postId: postId,
          },
        });
      }

      if (mediaUrlsToAdd && mediaUrlsToAdd.length > 0) {
        await tx.media.createMany({
          data: mediaUrlsToAdd.map((url) => ({
            url,
            postId: postId,
          })),
        });
      }

      if (typeof content !== 'undefined') {
        await tx.post.update({
          where: { id: postId },
          data: { content },
        });
      }

      return tx.post.findUnique({
        where: { id: postId },
        include: {
          media: true,
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
      });
    });

    if (!updatedPost) {
      throw new NotFoundException(this.i18n.t('post.post_not_found'));
    }

    return updatedPost;
  }

  async delete(postId: string, userId: string) {
    await this.findPostAndCheckOwnership(postId, userId);

    await this.prisma.post.delete({ where: { id: postId } });
    return { message: this.i18n.t('post.post_delete_success') };
  }

  private async findPostAndCheckOwnership(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });
    if (!post) {
      throw new NotFoundException(this.i18n.t('post.post_not_found'));
    }
    if (post.userId !== userId) {
      throw new ForbiddenException(
        this.i18n.t('post.post_not_have_permission'),
      );
    }
    return post;
  }
}
