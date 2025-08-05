import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateActivityDto {
  @IsString({ message: 'itinerary.itineraryId_invalid' })
  @IsNotEmpty({ message: 'itinerary.itineraryId_required' })
  itineraryId: string;

  @IsDateString(undefined, { message: 'activity.date_invalid' })
  @IsNotEmpty({ message: 'activity.date_required' })
  date: string;

  @IsString({ message: 'activity.name_invalid' })
  @IsNotEmpty({ message: 'activity.name_required' })
  name: string;

  @IsOptional()
  @IsString({ message: 'activity.startTime_invalid' })
  startTime?: string;

  @IsOptional()
  @IsString({ message: 'activity.description_invalid' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'activity.location_invalid' })
  location?: string;
}
