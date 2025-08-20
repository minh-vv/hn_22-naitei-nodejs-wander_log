import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { I18nService } from 'nestjs-i18n';
import { MailsService } from 'src/mails/mails.service';
import { addDays, addMonths, addYears, subDays, startOfWeek, subWeeks, startOfMonth, subMonths, startOfYear, subYears } from 'date-fns';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private mailsService: MailsService,
    private readonly i18n: I18nService,
  ) {}

  async findAllUsers(query?: string) {
    const where = query ? {
      OR: [
        { email: { contains: query } },
        { name: { contains: query } },
      ],
    } : {};

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async updateUserStatus(adminId: string, userId: string, isActive: boolean, reason: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      throw new NotFoundException(this.i18n.t('admin.user_not_found'));
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
      },
    });

    await this.prisma.adminLog.create({
      data: {
        adminId: adminId, 
        action: `Cập nhật trạng thái người dùng thành: ${isActive ? 'kích hoạt' : 'vô hiệu hóa'}`,
        targetId: userId,
        targetType: 'User',
      },
    });

    await this.mailsService.sendUserStatusUpdate({
      to: user.email,
      data: {
        user_name: user.name || user.email, 
        new_status: isActive ? 'activated' : 'deactivated',
        reason: reason,
      },
    });

    return updatedUser;
  }

  async findUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        itineraries: {
          select: {
            id: true,
            title: true,
            destination: true,
            startDate: true,
            visibility: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(this.i18n.t('admin.user_not_found'));
    }

    return user;
  }

  async deleteUser(adminId: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new NotFoundException(this.i18n.t('admin.user_not_found'));
    }

    await this.prisma.user.delete({
      where: { id: userId },
    });

    await this.prisma.adminLog.create({
      data: {
        adminId: adminId,
        action: 'Xóa tài khoản người dùng',
        targetId: userId,
        targetType: 'User',
      },
    });

    return { message: this.i18n.t('admin.user_deleted_successfully') };
  }

  async findAllItineraries(query?: string) {
    const where = query ? {
      OR: [
        { title: { contains: query } },
        { destination: { contains: query } },
      ],
    } : {};

    return this.prisma.itinerary.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getDashboardStats() {
    const today = new Date();
    
    const totalItineraries = await this.prisma.itinerary.count();
    
    const thisWeekStart = startOfWeek(today, { weekStartsOn: 1 }); 
    const thisWeekItineraries = await this.prisma.itinerary.count({
      where: {
        createdAt: {
          gte: thisWeekStart,
        },
      },
    });

    const thisMonthStart = startOfMonth(today);
    const thisMonthItineraries = await this.prisma.itinerary.count({
      where: {
        createdAt: {
          gte: thisMonthStart,
        },
      },
    });

    const thisYearStart = startOfYear(today);
    const thisYearItineraries = await this.prisma.itinerary.count({
      where: {
        createdAt: {
          gte: thisYearStart,
        },
      },
    });

    return {
      totalItineraries,
      thisWeekItineraries,
      thisMonthItineraries,
      thisYearItineraries,
    };
  }
  async findItineraryById(itineraryId: string) {
    const itinerary = await this.prisma.itinerary.findUnique({
      where: { id: itineraryId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        posts: {
          select: { id: true, content: true },
        },
        activities: {
          select: { id: true, name: true, location: true },
        },
      },
    });

    if (!itinerary) {
      throw new NotFoundException(this.i18n.t('admin.itinerary_not_found'));
    }

    return itinerary;
  }

  async deleteItinerary(adminId: string, itineraryId: string) {
    const itinerary = await this.prisma.itinerary.findUnique({
      where: { id: itineraryId },
      include: { user: { select: { id: true, email: true, name: true } } },
    });

    if (!itinerary) {
      throw new NotFoundException(this.i18n.t('admin.itinerary_not_found'));
    }

    await this.prisma.itinerary.delete({
      where: { id: itineraryId },
    });

    await this.prisma.adminLog.create({
      data: {
        adminId: adminId,
        action: 'Xóa lịch trình',
        targetId: itineraryId,
        targetType: 'Itinerary',
      },
    });

    await this.mailsService.sendItineraryDeletionNotification({
      to: itinerary.user.email,
      data: {
        user_name: itinerary.user.name || itinerary.user.email,
        itinerary_title: itinerary.title,
      },
    });

    return { message: this.i18n.t('admin.itinerary_deleted_successfully') };
  }
}
