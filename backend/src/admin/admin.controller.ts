import { 
  Controller,
  Get, 
  UseGuards, 
  Param, 
  Put,
  Body,
  Req,
  Delete,
  Query
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { Request } from 'express';
import { JwtPayload } from './jwt-payload.type';
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard) 
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  async getAllUsers(@Query('query') query: string) {
    return this.adminService.findAllUsers(query);
  }

  @Put('users/:userId/status')
  async updateUserStatus(
    @Param('userId') userId: string,
    @Body() updateUserStatusDto: UpdateUserStatusDto,
    @Req() req: Request
  ) {
    const { isActive, reason } = updateUserStatusDto;
    const admin = req.user as JwtPayload; 
    const adminId = admin.id;
    return this.adminService.updateUserStatus(adminId, userId, isActive, reason);
  }

  @Get('users/:userId')
  async getUserById(@Param('userId') userId: string) {
    return this.adminService.findUserById(userId);
  }

  @Delete('users/:userId')
  async deleteUser(@Param('userId') userId: string, @Req() req: Request) {
    const admin = req.user as JwtPayload;
    return this.adminService.deleteUser(admin.id, userId);
  }

  @Get('itineraries')
  async getAllItineraries(@Query('query') query: string) {
    return this.adminService.findAllItineraries(query);
  }

  @Get('dashboard')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('itineraries/:itineraryId')
  async getItineraryById(@Param('itineraryId') itineraryId: string) {
    return this.adminService.findItineraryById(itineraryId);
  }

  @Delete('itineraries/:itineraryId')
  async deleteItinerary(@Param('itineraryId') itineraryId: string, @Req() req: Request) {
    const admin = req.user as JwtPayload;
    return this.adminService.deleteItinerary(admin.id, itineraryId);
  }
}
