import { IsNotEmpty, IsDateString, IsOptional, IsNumber, IsIn } from 'class-validator';
import { Visibility } from '@prisma/client';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateItineraryDto {
  @IsNotEmpty({ message: i18nValidationMessage('itinerary.title_required') })
  title: string;

  @IsOptional()
  destination?: string;

  @IsNotEmpty({ message: i18nValidationMessage('itinerary.start_date_required') })
  @IsDateString({ strict: true }, { message: i18nValidationMessage('itinerary.start_date_invalid') })
  startDate: Date;

  @IsNotEmpty({ message: i18nValidationMessage('itinerary.end_date_required') })
  @IsDateString({ strict: true }, { message: i18nValidationMessage('itinerary.end_date_invalid') })
  endDate: Date;

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage('itinerary.budget_invalid') })
  budget?: number;

  @IsOptional()
  @IsIn([Visibility.PUBLIC, Visibility.PRIVATE], { message: i18nValidationMessage('itinerary.visibility_invalid') })
  visibility?: Visibility;
}
