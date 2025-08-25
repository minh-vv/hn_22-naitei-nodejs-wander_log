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
  Patch
} from '@nestjs/common';
import { ItineraryService } from './itinerary.service';
import { CreateItineraryDto } from './dto/create-itinerary.dto';
import { UpdateItineraryDto } from './dto/update-itinerary.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('itineraries')
export class ItineraryController {
  constructor(private readonly itineraryService: ItineraryService) {}

  @Post()
  create(@Body() createItineraryDto: CreateItineraryDto, @GetUser() user: User) {
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
  findOneById(@Param('id') id: string, @GetUser() user: User) {
    if (!user || !user.id) {
        throw new UnauthorizedException('User not authenticated.');
    }
    return this.itineraryService.findOneById(id, user.id);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string, @GetUser() user: User) {
    return this.itineraryService.findOne(slug, user?.id);
  }

  @Put(':id')
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
  remove(@Param('id') id: string, @GetUser() user: User) {
    if (!user || !user.id) {
        throw new UnauthorizedException('User not authenticated.');
    }
    return this.itineraryService.remove(id, user.id);
  }

  @Patch(':slug/view')
  async increaseItineraryViews(@Param('slug') slug: string) {
    return this.itineraryService.increaseViews(slug);
  }
}
