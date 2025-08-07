import { IsNotEmpty, IsDateString, IsOptional, IsNumber, IsIn } from 'class-validator';
import { Visibility } from '@prisma/client';

export class CreateItineraryDto {
  @IsNotEmpty()
  title: string;

  @IsOptional()
  destination?: string;

  @IsNotEmpty()
  @IsDateString({ strict: true })
  startDate: Date;

  @IsNotEmpty()
  @IsDateString({ strict: true })
  endDate: Date;

  @IsOptional()
  @IsNumber()
  budget?: number;

  @IsOptional()
  @IsIn([Visibility.PUBLIC, Visibility.PRIVATE])
  visibility?: Visibility;
}
