import { Module } from '@nestjs/common';
import { ItineraryService } from './itinerary.service';
import { ItineraryController } from './itinerary.controller';
import { PrismaService } from '../prisma/prisma.service'; 
import { AuthModule } from 'src/auth/auth.module'; 

@Module({
  imports: [AuthModule],
  providers: [ItineraryService, PrismaService],
  controllers: [ItineraryController]
})
export class ItineraryModule {}
