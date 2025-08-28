import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from '@prisma/client';
import { UpdatePostDto } from './dto/update-post.dto';
import { InteractService } from 'src/interact/interact.service';
import { CreateCommentDto } from 'src/interact/dto/create-comment.dto';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly interactService: InteractService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@GetUser() user: User, @Body() createPostDto: CreatePostDto) {
    return this.postsService.create(user.id, createPostDto);
  }

  @Get()
  async getAll() {
    return this.postsService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('feed')
  async getNewFeed(@GetUser() user: User) {
    return this.postsService.getNewsFeed(user.id);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.postsService.getById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @GetUser() user: User,
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, user.id, updatePostDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@GetUser() user: User, @Param('id') id: string) {
    return this.postsService.delete(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  async like(@Param('id') id: string, @GetUser() user: User) {
    return this.interactService.like(id, user.id);
  }

  @Get(':id/comment')
  async getComments(@Param('id') id: string) {
    return this.interactService.getComments(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comment')
  async createComment(
    @GetUser() user: User,
    @Param('id') id: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.interactService.create(createCommentDto, user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/comment/:commentId')
  async deleteComment(
    @GetUser() user: User,
    @Param('id') id: string,
    @Param('commentId') commentId: string,
  ) {
    return this.interactService.delete(id, commentId, user.id);
  }
}
