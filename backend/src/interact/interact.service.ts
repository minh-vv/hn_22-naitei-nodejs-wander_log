import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class InteractService {
  constructor(
    private prisma: PrismaService,
    private i18n: I18nService,
  ) {}

  async like(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(this.i18n.t('post.post_not_found'));
    }

    const isLike = await this.prisma.favorite.findUnique({
      where: {
        userId_postId: { userId, postId },
      },
    });

    if (!isLike) {
      const [favorite, updatedPost] = await this.prisma.$transaction([
        this.prisma.favorite.create({
          data: { userId, postId },
        }),
        this.prisma.post.update({
          where: { id: postId },
          data: { likeCount: { increment: 1 } },
          include: {
            user: { select: { name: true, avatar: true } },
          },
        }),
      ]);
      return { action: 'like', favorite, updatedPost };
    } else {
      const [deletedFavorite, updatedPost] = await this.prisma.$transaction([
        this.prisma.favorite.delete({
          where: {
            userId_postId: { userId, postId },
          },
        }),
        this.prisma.post.update({
          where: { id: postId },
          data: { likeCount: { decrement: 1 } },
          include: {
            user: { select: { name: true, avatar: true } },
          },
        }),
      ]);
      return { action: 'unlike', favorite: deletedFavorite, updatedPost };
    }
  }

  async create(
    createCommentDto: CreateCommentDto,
    userId: string,
    postId: string,
  ) {
    const [_, newComment] = await this.prisma.$transaction([
      this.prisma.post.update({
        where: { id: postId },
        data: {
          commentsCount: {
            increment: 1,
          },
        },
      }),
      this.prisma.comment.create({
        data: {
          body: createCommentDto.body,
          user: {
            connect: { id: userId },
          },
          post: {
            connect: { id: postId },
          },
        },
        select: {
          id: true,
          body: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
      }),
    ]);

    return {
      newComment,
    };
  }

  async getComments(postId: string) {
    const comments = await this.prisma.comment.findMany({
      where: { postId: postId },
      select: {
        id: true,
        body: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      comments: [...comments],
    };
  }

  async delete(postId: string, commentId: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException(
        this.i18n.translate('interact.comment_not_found'),
      );
    }

    if (comment.userId !== userId) {
      throw new BadRequestException(
        this.i18n.translate('interact.no_permission_delete_comment'),
      );
    }

    const [_, deleteComment] = await this.prisma.$transaction([
      this.prisma.post.update({
        where: { id: postId },
        data: {
          commentsCount: {
            decrement: 1,
          },
        },
      }),
      this.prisma.comment.delete({
        where: { id: commentId },
      }),
    ]);

    return {
      deleteComment,
    };
  }
}
