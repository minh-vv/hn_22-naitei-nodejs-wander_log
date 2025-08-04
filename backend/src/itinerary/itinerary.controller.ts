import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ItineraryService } from './itinerary.service';
import { CreateItineraryDto } from './dto/create-itinerary.dto';
import { UpdateItineraryDto } from './dto/update-itinerary.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; 
import { GetUser } from 'src/auth/get-user.decorator'; 
import { User } from '@prisma/client';

@Controller('itineraries')
@UseGuards(JwtAuthGuard)
export class ItineraryController {
  constructor(private readonly itineraryService: ItineraryService) {}

  @Post()
  async create(@Body() createItineraryDto: CreateItineraryDto, @GetUser() user: User) {
    return this.itineraryService.create(user.id, createItineraryDto);
  }

  @Get()
  async findAll(@GetUser() user: User) {
    return this.itineraryService.findAll(user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.itineraryService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateItineraryDto: UpdateItineraryDto, @GetUser() user: User) {
    return this.itineraryService.update(id, user.id, updateItineraryDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @GetUser() user: User) {
    return this.itineraryService.remove(id, user.id);
  }
}
