import { IsBoolean, IsString, IsNotEmpty } from 'class-validator';

export class UpdateUserStatusDto {
  @IsBoolean()
  isActive: boolean;

  @IsString()
  @IsNotEmpty()
  reason: string;
}
