import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  UnauthorizedException,
  Patch,
} from '@nestjs/common';
import { ItineraryService } from './itinerary.service';
import { CreateItineraryDto } from './dto/create-itinerary.dto';
import { UpdateItineraryDto } from './dto/update-itinerary.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from '@prisma/client';

@Controller('itineraries')
export class ItineraryController {
  constructor(private readonly itineraryService: ItineraryService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createItineraryDto: CreateItineraryDto,
    @GetUser() user: User,
  ) {
    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated.');
    }
    return this.itineraryService.create(user.id, createItineraryDto);
  }

  @Get()
  findAll(@GetUser() user: User) {
    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated.');
    }
    return this.itineraryService.findAll(user.id);
  }

  @Get('feature')
  findFeaturedItinerary() {
    return this.itineraryService.findFeaturedItinerary();
  }

  @Get('id/:id')
  @UseGuards(JwtAuthGuard)
  findOneById(@Param('id') id: string, @GetUser() user: User) {
    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated.');
    }
    return this.itineraryService.findOneById(id, user.id);
  }

  @Get(':slug')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('slug') slug: string, @GetUser() user: User) {
    return this.itineraryService.findOne(slug, user?.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateItineraryDto: UpdateItineraryDto,
    @GetUser() user: User,
  ) {
    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated.');
    }
    return this.itineraryService.update(id, user.id, updateItineraryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @GetUser() user: User) {
    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated.');
    }
    return this.itineraryService.remove(id, user.id);
  }

  @Patch(':slug/view')
  @UseGuards(JwtAuthGuard)
  async increaseItineraryViews(@Param('slug') slug: string) {
    return this.itineraryService.increaseViews(slug);
  }
}
