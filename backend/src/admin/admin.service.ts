import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { I18nService } from 'nestjs-i18n';
import { MailsService } from 'src/mails/mails.service';
import { addDays, addMonths, addYears, subDays, startOfWeek, subWeeks, startOfMonth, subMonths, startOfYear, subYears, format } from 'date-fns';


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
    const thisWeekStart = startOfWeek(today, { weekStartsOn: 1 }); 
    const [
      totalUsers,
      newUsersThisWeek,
      totalItineraries,
      newItinerariesThisWeek,
      activeUsers,
      totalPosts,
      totalComments,
      totalRatings,
      publicItineraries,
      privateItineraries,
    ] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: thisWeekStart } } }),
      this.prisma.itinerary.count(),
      this.prisma.itinerary.count({ where: { createdAt: { gte: thisWeekStart } } }),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.post.count(), 
      this.prisma.comment.count(),
      this.prisma.rating.count(),
      this.prisma.itinerary.count({ where: { visibility: 'PUBLIC' } }),
      this.prisma.itinerary.count({ where: { visibility: 'PRIVATE' } }),
    ]);

    const inactiveUsers = totalUsers - activeUsers;

    return {
      totalUsers,
      newUsersThisWeek,
      totalItineraries,
      newItinerariesThisWeek,
      activeUsers,
      inactiveUsers,
      totalPosts,
      totalComments,
      totalRatings,
      publicItineraries,
      privateItineraries,
    };
  }

  async getMonthlyGrowthData() {
  const now = new Date();
  const twelveMonthsAgo = subMonths(now, 11);
  twelveMonthsAgo.setDate(1);

  const [users, itineraries, posts] = await Promise.all([
    this.prisma.user.findMany({
      where: { createdAt: { gte: twelveMonthsAgo } },
      select: { createdAt: true },
    }),
    this.prisma.itinerary.findMany({
      where: { createdAt: { gte: twelveMonthsAgo } },
      select: { createdAt: true },
    }),
    this.prisma.post.findMany({
      where: { createdAt: { gte: twelveMonthsAgo } },
      select: { createdAt: true },
    }),
  ]);

  const monthlyDataMap = {};
  for (let i = 0; i < 12; i++) {
    const month = subMonths(now, i);
    const monthKey = format(month, 'MMM yyyy');
    monthlyDataMap[monthKey] = {
      month: format(month, 'MMM'),
      newUsers: 0,
      newItineraries: 0,
      newPosts: 0,
    };
  }

  users.forEach(u => {
    const monthKey = format(u.createdAt, 'MMM yyyy');
    if (monthlyDataMap[monthKey]) {
      monthlyDataMap[monthKey].newUsers++;
    }
  });

  itineraries.forEach(i => {
    const monthKey = format(i.createdAt, 'MMM yyyy');
    if (monthlyDataMap[monthKey]) {
      monthlyDataMap[monthKey].newItineraries++;
    }
  });

  posts.forEach(p => {
    const monthKey = format(p.createdAt, 'MMM yyyy');
    if (monthlyDataMap[monthKey]) {
      monthlyDataMap[monthKey].newPosts++;
    }
  });

  return Object.values(monthlyDataMap).sort((a: { month: string }, b: { month: string }) => {
    const dateA = new Date(a.month + ' 1, 2000');
    const dateB = new Date(b.month + ' 1, 2000');
    return dateA.getMonth() - dateB.getMonth();
    });
}

async getTopItinerariesByRatings(limit = 5) {
  const topItineraries = await this.prisma.itinerary.findMany({
    orderBy: {
      ratings: {
        _count: 'desc',
      },
    },
    take: limit,
    select: {
      title: true,
      _count: {
        select: { ratings: true },
      },
    },
  });

  return topItineraries.map(item => ({
    title: item.title,
    ratingCount: item._count.ratings,
  }));
}

async getTopPostsByLikes(limit = 5) {
  const topPosts = await this.prisma.post.findMany({
    orderBy: {
      likeCount: 'desc',
    },
    take: limit,
    select: {
      content: true,
      likeCount: true,
    },
  });

  return topPosts.map(item => ({
    content: item.content ? item.content.substring(0, 20) + '...' : 'Untitled Post',
    likeCount: item.likeCount,
  }));
}

async getItineraryVisibilityData() {
  const [publicCount, privateCount] = await Promise.all([
    this.prisma.itinerary.count({ where: { visibility: 'PUBLIC' } }),
    this.prisma.itinerary.count({ where: { visibility: 'PRIVATE' } }),
  ]);

  return [
    { name: 'PUBLIC', value: publicCount },
    { name: 'PRIVATE', value: privateCount },
  ];
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
          select: { 
            id: true, 
            name: true, 
            location: true,
            date: true,       
            startTime: true,   
            description: true, 
            cost: true,        
          },
          orderBy: [
            { date: "asc" },
            { startTime: "asc" }
          ]
        },
        _count: {
          select: { ratings: true },
        },
        ratings: {
          select: { value: true }
        }
      },
    });

    if (!itinerary) {
      throw new NotFoundException(this.i18n.t('admin.itinerary_not_found'));
    }

    const totalRating = itinerary.ratings.reduce((sum, r) => sum + r.value, 0);
    const averageRating = itinerary.ratings.length > 0
      ? totalRating / itinerary.ratings.length
      : 0;

    const itineraryWithRating: any = {
      ...itinerary,
      averageRating: parseFloat(averageRating.toFixed(1)),
      ratingCount: itinerary._count.ratings,
    };

    delete itineraryWithRating.ratings;
    delete itineraryWithRating._count;
    
    return itineraryWithRating;
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
