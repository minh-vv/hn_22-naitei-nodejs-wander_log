import { IsOptional, IsString, IsArray, IsNumber, IsIn } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class FilterItineraryDto {
  @IsOptional()
  @IsString()
  searchQuery?: string;

  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  @IsIn(['1-3', '4-7', '8-14', '15+'])
  duration?: '1-3' | '4-7' | '8-14' | '15+';

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  budgetMin?: number;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  budgetMax?: number;

  @IsOptional()
  @IsString()
  @IsIn(['under-5', '5-10', '10-20', 'over-20'])
  budgetRange?: 'under-5' | '5-10' | '10-20' | 'over-20';

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  minRating?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(item => item.trim());
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  @IsIn(['createdAt', 'startDate', 'views', 'title', 'budget', 'rating'])
  sortBy?: 'createdAt' | 'startDate' | 'views' | 'title' | 'budget' | 'rating';

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 10)
  @Type(() => Number)
  limit?: number = 10;
}
