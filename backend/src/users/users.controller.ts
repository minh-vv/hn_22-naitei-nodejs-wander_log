import { Controller, Get, Put, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
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
    return this.usersService.getProfile(user.sub);
  }

  @Get(':userId/profile')
  @HttpCode(HttpStatus.OK)
  async getUserProfile(@Param('userId') userId: string): Promise<Omit<UserProfileDto, 'email'>> {
    return this.usersService.getPublicProfile(userId);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @GetUser() user: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<UserProfileDto> {
    return this.usersService.updateProfile(user.sub, updateProfileDto);
  }

  @Get('profile/stats')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getUserStats(@GetUser() user: any): Promise<UserStatsDto> {
    return this.usersService.getUserStats(user.sub);
  }
}
