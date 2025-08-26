import { IsEnum, IsString, IsOptional, IsBoolean, IsIn } from 'class-validator';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  fromUserId?: string;

  @IsOptional()
  @IsString()
  postId?: string;

  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}
