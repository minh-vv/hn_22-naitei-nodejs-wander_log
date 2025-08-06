import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateActivityDto {
  @IsString()
  @IsNotEmpty()
  itineraryId: string;

  @IsDateString(undefined)
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  location?: string;
}
