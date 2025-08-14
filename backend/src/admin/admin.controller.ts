import { 
  Controller,
  Get, 
  UseGuards, 
  Param, 
  Put,
  Body,
  Req  
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
  async getAllUsers() {
    return this.adminService.findAllUsers();
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
}
