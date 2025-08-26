import { NotificationType } from '@prisma/client';

export class NotificationResponseDto {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  userId: string;
  fromUserId?: string | null;
  fromUser?: {
    id: string;
    name: string | null;
    avatar?: string | null;
  } | null;
  postId?: string | null;
  post?: {
    id: string;
    content: string | null;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}
