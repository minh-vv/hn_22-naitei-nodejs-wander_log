import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { GetUser } from 'src/auth/get-user.decorator';
import { BookmarkType, User } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post()
  create(@Body() createBookmarkDto: CreateBookmarkDto, @GetUser() user: User) {
    return this.bookmarksService.create(createBookmarkDto, user.id);
  }

  @Get()
  findAll(@GetUser() user: User) {
    return this.bookmarksService.findAll(user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.bookmarksService.remove(id, user.id);
  }

  @Get('check')
  async check(
    @Query('type') type: BookmarkType,
    @Query('itemId') itemId: string,
    @GetUser() user: User,
  ) {
    return this.bookmarksService.isBookmarked(user.id, type, itemId);
  }
}
