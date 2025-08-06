import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  async create(@Body() createActivityDto: CreateActivityDto, @GetUser() user: User) {
    return this.activitiesService.create(user.id, createActivityDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.activitiesService.findOne(id, user.id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateActivityDto: UpdateActivityDto, @GetUser() user: User) {
    return this.activitiesService.update(id, user.id, updateActivityDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @GetUser() user: User) {
    return this.activitiesService.remove(id, user.id);
  }
}
