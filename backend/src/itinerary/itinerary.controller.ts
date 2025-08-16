import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ItineraryService } from './itinerary.service';
import { CreateItineraryDto } from './dto/create-itinerary.dto';
import { UpdateItineraryDto } from './dto/update-itinerary.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from '@prisma/client';

@Controller('itineraries')
export class ItineraryController {
  constructor(private readonly itineraryService: ItineraryService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createItineraryDto: CreateItineraryDto,
    @GetUser() user: User,
  ) {
    return this.itineraryService.create(user.id, createItineraryDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@GetUser() user: User) {
    return this.itineraryService.findAll(user.id);
  }

  @Get('feature')
  async findFeaturedItinerary() {
    return this.itineraryService.findFeaturedItinerary();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.itineraryService.findOne(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateItineraryDto: UpdateItineraryDto,
    @GetUser() user: User,
  ) {
    return this.itineraryService.update(id, user.id, updateItineraryDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @GetUser() user: User) {
    return this.itineraryService.remove(id, user.id);
  }
}
