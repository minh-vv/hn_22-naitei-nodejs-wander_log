import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  Users,
  MapPin,
  MessageSquare,
  LogOut,
  Heart,
  Star,
  Eye,
  AlertTriangle,
  Shield,
  Settings,
  BarChart3,
  Activity,
  Image,
} from 'lucide-react';
import styles from './AdminDashboard.module.css';
import { fetchDashboardStats } from '../../../services/admin';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getStats = async () => {
      try {
        const dashboardStats = await fetchDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
        setStats({
          totalUsers: 0,
          newUsersThisWeek: 0,
          totalItineraries: 0,
          newItinerariesThisWeek: 0,
          activeUsers: 0,
          pendingReports: 0,
          totalPosts: 0,
          totalComments: 0,
          totalLikes: 0,
          totalRatings: 0,
          totalViews: 0,
          publicItineraries: 0,
          privateItineraries: 0,
        });
      } finally {
        setLoading(false);
      }
    };
    getStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingHeart}>
          <Heart className={styles.heartIcon} />
        </div>
        <p>Đang tải bảng điều khiển quản trị...</p>
      </div>
    );
  }

  return (
    <div className={styles.adminDashboard}>
      <header className={styles.dashboardHeader}>
        <div className={styles.headerContent}>
          <div className={styles.welcomeSection}>
            <h1 className={styles.welcomeTitle}>Xin chào Admin! 💖</h1>
            <p className={styles.welcomeSubtitle}>Đây là những gì đang xảy ra trong WanderLog hôm nay</p>
          </div>
          <button onClick={handleLogout} className={styles.logoutButton}>
            <LogOut size={20} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </header>

      <div className={styles.quickStats}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.users}`}>
            <Users size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statNumber}>{stats.totalUsers?.toLocaleString()}</div>
            <div className={styles.statLabel}>Tổng số người dùng</div>
            <div className={styles.statChange}>+{stats.newUsersThisWeek} mới trong tuần</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.itineraries}`}>
            <MapPin size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statNumber}>{stats.totalItineraries?.toLocaleString()}</div>
            <div className={styles.statLabel}>Tổng số lịch trình</div>
            <div className={styles.statChange}>+{stats.newItinerariesThisWeek} mới trong tuần</div>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.comments}`}>
            <MessageSquare size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statNumber}>{stats.totalComments?.toLocaleString()}</div>
            <div className={styles.statLabel}>Tổng số bình luận</div>
            <div className={styles.statChange}>+{stats.newCommentsThisWeek} mới trong tuần</div>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.posts}`}>
            <Image size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statNumber}>{stats.totalPosts?.toLocaleString()}</div>
            <div className={styles.statLabel}>Tổng số bài viết</div>
            <div className={styles.statChange}>+{stats.newPostsThisWeek} mới trong tuần</div>
          </div>
        </div>
      </div>
      
      <div className={styles.mainActions}>
        <div className={styles.actionGrid}>
          <Link to="/admin/users" className={`${styles.actionCard} ${styles.primary}`}>
            <Users size={32} />
            <div className={styles.actionContent}>
              <h3>Quản lý người dùng</h3>
              <p>Xem, chỉnh sửa và quản lý tài khoản người dùng</p>
            </div>
          </Link>
          <Link to="/admin/itineraries" className={`${styles.actionCard} ${styles.secondary}`}>
            <MapPin size={32} />
            <div className={styles.actionContent}>
              <h3>Quản lý lịch trình</h3>
              <p>Xem xét và kiểm duyệt lịch trình du lịch</p>
            </div>
          </Link>
          <Link to="/admin/analytics" className={`${styles.actionCard} ${styles.tertiary}`}>
            <BarChart3 size={32} />
            <div className={styles.actionContent}>
              <h3>Xem phân tích</h3>
              <p>Xem thống kê chi tiết của nền tảng</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
