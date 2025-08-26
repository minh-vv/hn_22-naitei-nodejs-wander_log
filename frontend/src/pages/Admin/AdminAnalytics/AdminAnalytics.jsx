import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';
import { ArrowLeft, TrendingUp, Users, MapPin, Image, Heart, Star, MessageSquare } from 'lucide-react';
import styles from './AdminAnalytics.module.css';
import { getMonthlyGrowthData, getTopItinerariesByRatings, getTopPostsByLikes, getItineraryVisibilityData } from '../../../services/admin';

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const [growthData, setGrowthData] = useState([]);
  const [topItineraries, setTopItineraries] = useState([]);
  const [topPosts, setTopPosts] = useState([]);
  const [itineraryDistribution, setItineraryDistribution] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const [
          monthlyGrowth,
          topRatedItineraries,
          topLikedPosts,
          distribution,
        ] = await Promise.all([
          getMonthlyGrowthData(),
          getTopItinerariesByRatings(),
          getTopPostsByLikes(),
          getItineraryVisibilityData(),
        ]);

        setGrowthData(monthlyGrowth);
        setTopItineraries(topRatedItineraries);
        setTopPosts(topLikedPosts);
        setItineraryDistribution(distribution);
      } catch (error) {
        console.error("Failed to fetch analytics data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalyticsData();
  }, []);

const LoadingHeart = () => (
    <div className={styles.loadingContainer}>
        <div className={styles.loadingHeart}>
            <Heart className={styles.heartIcon} />
        </div>
        <p>Loading itinerary</p>
    </div>
);

  if (loading) {
    return <LoadingHeart />;
  }

  const PIE_COLORS = ['#F8BBd0', '#e91e63'];

  return (
    <div className={styles.analyticsContainer}>
      <header className={styles.analyticsHeader}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>
        <h1 className={styles.analyticsTitle}>Dashboard Analytics</h1>
        <p className={styles.analyticsSubtitle}>Detailed insights into platform performance</p>
      </header>

      <div className={styles.chartGrid}>
        {/* Biểu đồ 1: Xu hướng tăng trưởng theo tháng */}
        <div className={styles.chartCard}>
          <div className={styles.chartTitleWrapper}>
            <TrendingUp size={20} className={styles.chartIcon} />
            <h2 className={styles.chartTitle}>Monthly Platform Growth</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={growthData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fce4ec" />
              <XAxis dataKey="month" stroke="#e91e63" />
              <YAxis stroke="#e91e63" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', border: 'none', borderRadius: '8px' }} />
              <Legend />
              <Line type="monotone" dataKey="newUsers" name="New Users" stroke="#ff80ab" activeDot={{ r: 8 }} strokeWidth={2} />
              <Line type="monotone" dataKey="newItineraries" name="New Itineraries" stroke="#f48fb1" activeDot={{ r: 8 }} strokeWidth={2} />
              <Line type="monotone" dataKey="newPosts" name="New Posts" stroke="#a0d4ff" activeDot={{ r: 8 }} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Biểu đồ 2: Top Itineraries được đánh giá cao */}
        <div className={styles.chartCard}>
          <div className={styles.chartTitleWrapper}>
            <Star size={20} className={styles.chartIcon} />
            <h2 className={styles.chartTitle}>Top Itineraries by Ratings</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topItineraries} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fce4ec" />
              <XAxis type="number" stroke="#e91e63" />
              <YAxis type="category" dataKey="title" stroke="#e91e63" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', border: 'none', borderRadius: '8px' }} />
              <Bar dataKey="ratingCount" name="Ratings" fill="#ff80ab" barSize={20} radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Biểu đồ 3: Top Posts được yêu thích */}
        <div className={styles.chartCard}>
          <div className={styles.chartTitleWrapper}>
            <Heart size={20} className={styles.chartIcon} />
            <h2 className={styles.chartTitle}>Top Posts by Likes</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topPosts} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fce4ec" />
              <XAxis type="number" stroke="#e91e63" />
              <YAxis type="category" dataKey="content" stroke="#e91e63" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', border: 'none', borderRadius: '8px' }} />
              <Bar dataKey="likeCount" name="Likes" fill="#f48fb1" barSize={20} radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Biểu đồ 4: Phân bố lịch trình (công khai/riêng tư) */}
        <div className={styles.chartCard}>
          <div className={styles.chartTitleWrapper}>
            <MapPin size={20} className={styles.chartIcon} />
            <h2 className={styles.chartTitle}>Itinerary Visibility</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={itineraryDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {itineraryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', border: 'none', borderRadius: '8px' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
