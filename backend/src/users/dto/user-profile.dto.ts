export class UserProfileDto {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  coverPhoto: string | null;
  bio: string | null;
  role: string;
  location: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
