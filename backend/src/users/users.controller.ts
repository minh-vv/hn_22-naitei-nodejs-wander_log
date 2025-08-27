import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Post,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { UserStatsDto } from './dto/user-stats.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getMyProfile(@GetUser() user: any): Promise<UserProfileDto> {
    return this.usersService.getProfile(user.id);
  }

  @Get(':userId/profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getUserProfile(
    @Param('userId') userId: string,
    @GetUser() currentUser: any,
  ): Promise<Omit<UserProfileDto, 'email'>> {
    return this.usersService.getPublicProfile(userId, currentUser.id);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @GetUser() user: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<UserProfileDto> {
    return this.usersService.updateProfile(user.id, updateProfileDto);
  }

  @Get('profile/stats')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getMyStats(@GetUser() user: any): Promise<UserStatsDto> {
    return this.usersService.getUserStats(user.id);
  }

  @Get('profile/itineraries')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getMyItineraries(@GetUser() user: any) {
    return this.usersService.getUserItineraries(user.id);
  }

  @Get(':userId/itineraries')
  @HttpCode(HttpStatus.OK)
  async getUserItineraries(@Param('userId') userId: string) {
    return this.usersService.getUserPublicItineraries(userId);
  }

  @Get(':userId/posts')
  @HttpCode(HttpStatus.OK)
  async getUserPost(@Param('userId') userId: string) {
    return this.usersService.getUserPost(userId);
  }

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async followUser(@GetUser() user: any, @Param('id') targetUserId: string) {
    return this.usersService.followUser(user.id, targetUserId);
  }

  @Delete(':id/follow')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async unfollowUser(@GetUser() user: any, @Param('id') targetUserId: string) {
    return this.usersService.unfollowUser(user.id, targetUserId);
  }

  @Get(':userId/followers')
  @UseGuards(JwtAuthGuard)
  async getFollowersList(@Param('userId') userId: string, @GetUser() currentUser: any) {
    return this.usersService.getFollowersList(userId, currentUser.id);
  }

  @Get(':userId/following')
  @UseGuards(JwtAuthGuard)
  async getFollowingList(@Param('userId') userId: string, @GetUser() currentUser: any) {
    return this.usersService.getFollowingList(userId, currentUser.id);
  }

  @Get(':userId/stats')
  async getUserStats(@Param('userId') userId: string): Promise<UserStatsDto> {
    return this.usersService.getUserStats(userId);
  }

  @Get('featured')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getFeaturedBloggers(
    @Query('take') take?: number,
    @GetUser() user?: any,
  ) {
    const limit = take ? parseInt(take.toString(), 10) : undefined;
    return this.usersService.getFeaturedBloggers(limit, user?.id);
  }
}
