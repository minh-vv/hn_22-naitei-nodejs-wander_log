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

@UseGuards(JwtAuthGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  async create(@GetUser() user: User, @Body() createPostDto: CreatePostDto) {
    return this.postsService.create(user.id, createPostDto);
  }

  @Get()
  async getAll() {
    return this.postsService.getAll();
  }

  @Put(':id')
  async update(
    @GetUser() user: User,
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, user.id, updatePostDto);
  }

  @Delete(':id')
  async delete(@GetUser() user: User, @Param('id') id: string) {
    return this.postsService.delete(id, user.id);
  }
}
