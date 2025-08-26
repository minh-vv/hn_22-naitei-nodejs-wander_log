import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './AdminItineraryDetail.module.css';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  MapPin,
  Eye,
  User,
  Image,
  Star,
  Clock,
  LayoutGrid,
  Heart,
} from 'lucide-react';
import { fetchItineraryById } from '../../../services/admin';

const AdminItineraryDetail = () => {
  const { itineraryId } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getItinerary = async () => {
      try {
        const data = await fetchItineraryById(itineraryId);
        setItinerary(data);
      } catch (error) {
        console.error("Failed to fetch itinerary details", error);
      } finally {
        setLoading(false);
      }
    };
    getItinerary();
  }, [itineraryId]);

  const groupActivitiesByDate = (activities) => {
    if (!activities) return {};
    const grouped = {};
    activities.forEach((activity) => {
      if (!activity.date) {
        const dateKey = 'undated'; 
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(activity);
        return;
      }
      
      const dateObj = new Date(activity.date);
      if (isNaN(dateObj.getTime())) {
        const dateKey = 'invalid';
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(activity);
        return;
      }
      
      const dateKey = dateObj.toISOString().split('T')[0];

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(activity);
    });
    for (const dateKey in grouped) {
      grouped[dateKey].sort((a, b) => {
        if (a.startTime && b.startTime) {
          return a.startTime.localeCompare(b.startTime);
        }
        return 0;
      });
    }
    return grouped;
  };

  const calculateDayNumber = (dateKey) => {
    if (!itinerary?.startDate || dateKey === 'undated' || dateKey === 'invalid') return 'N/A';
    const startDate = new Date(itinerary.startDate);
    const currentDate = new Date(dateKey);
    const timeDifference = currentDate.getTime() - startDate.getTime();
    const dayDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    return dayDifference + 1;
  };

  const formatDate = (dateString, formatType) => {
    if (!dateString) {
        return 'Ngày không xác định';
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return 'Ngày không hợp lệ';
    }

    if (formatType === "dddd, DD MMMM YYYY") {
        const options = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "2-digit",
        };
        return new Intl.DateTimeFormat("vi-VN", options).format(date);
    }
    return dateString;
};


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

  if (!itinerary) {
    return <div className={styles.container}>Itinerary not found.</div>;
  }
  
  const groupedActivities = itinerary ? groupActivitiesByDate(itinerary.activities) : {};
  const sortedDates = Object.keys(groupedActivities).sort();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link to="/admin/itineraries" className={styles.backButton}>
          <ArrowLeft size={20} />
          <span>Back to List</span>
        </Link>
        <h1 className={styles.title}>{itinerary.title}</h1>
        <p className={styles.subtitle}>
          By:{' '}
          <Link to={`/admin/users/${itinerary.user.id}`} className={styles.userLink}>
            <User size={16} />
            {itinerary.user.name || itinerary.user.email}
          </Link>
        </p>
      </header>

      {itinerary.coverImage && (
        <div className={styles.coverImageWrapper}>
          <img src={itinerary.coverImage} alt={itinerary.title} className={styles.coverImage} />
        </div>
      )}

      <div className={styles.detailsGrid}>
        <div className={styles.detailCard}>
          <div className={styles.cardHeader}>
            <MapPin size={24} className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>Destination</h2>
          </div>
          <p className={styles.cardValue}>{itinerary.destination || 'N/A'}</p>
        </div>

        <div className={styles.detailCard}>
          <div className={styles.cardHeader}>
            <Calendar size={24} className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>Dates</h2>
          </div>
          <p className={styles.cardValue}>
            {new Date(itinerary.startDate).toLocaleDateString()} to{' '}
            {new Date(itinerary.endDate).toLocaleDateString()}
          </p>
        </div>

        <div className={styles.detailCard}>
          <div className={styles.cardHeader}>
            <DollarSign size={24} className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>Budget</h2>
          </div>
          <p className={styles.cardValue}>${itinerary.budget?.toLocaleString() || 0}</p>
        </div>
        
        <div className={`${styles.detailCard} ${styles.ratingCard}`}>
          <div className={styles.cardHeader}>
            <Star size={24} className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>Average Rating</h2>
          </div>
          <p className={styles.cardValue}>
            {itinerary.averageRating?.toFixed(1) || '0.0'} / 5 ({itinerary.ratingCount || 0} ratings)
          </p>
        </div>

        <div className={styles.detailCard}>
          <div className={styles.cardHeader}>
            <Eye size={24} className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>Views</h2>
          </div>
          <p className={styles.cardValue}>{itinerary.views?.toLocaleString() || 0}</p>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.itineraryDays}>
          <div className={styles.sectionHeaderActivities}>
            <LayoutGrid size={24} className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>Itinerary Activities</h2>
          </div>
          
          {sortedDates.length === 0 ? (
            <div className={styles.emptyActivities}>
              <h3 className={styles.emptyTitle}>No Activities Found</h3>
              <p className={styles.emptyText}>There are no activities planned for this itinerary yet.</p>
            </div>
          ) : (
            sortedDates.map((dateKey) => (
              <div key={dateKey} className={styles.dayCard}>
                <div className={styles.dayHeader}>
                  <div className={styles.dayNumber}>
                    {dateKey === 'undated' ? 'N/A' : (dateKey === 'invalid' ? 'Error' : `Day ${calculateDayNumber(dateKey)}`)}
                  </div>
                  <h3 className={styles.dayDate}>
                    {dateKey === 'undated' ? 'Undated Activities' : (dateKey === 'invalid' ? 'Invalid Date Activities' : formatDate(dateKey, "dddd, DD MMMM YYYY"))}
                  </h3>
                </div>

                <ul className={styles.activitiesList}>
                  {groupedActivities[dateKey].map((activity) => (
                    <li key={activity.id} className={styles.activityItem}>
                      <div className={styles.activityTime}><Clock size={16} />{activity.startTime || "All Day"}</div>
                      <div className={styles.activityContent}>
                        <h4 className={styles.activityName}>{activity.name}</h4>
                        <p className={styles.activityDescription}>{activity.description || "No description"}</p>
                        <div className={styles.activityMeta}>
                          <span className={styles.activityLocation}>
                            <MapPin size={16} />
                            {activity.location || "N/A"}
                          </span>
                          <span className={styles.activityCost}>
                            <DollarSign size={16} />
                            {activity.cost ? `${activity.cost.toLocaleString("vi-VN")} VND` : "Free"}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>

        {itinerary.posts && itinerary.posts.length > 0 && (
          <div className={styles.contentCard}>
            <div className={styles.contentHeader}>
              <Image size={24} className={styles.contentIcon} />
              <h2 className={styles.contentTitle}>Posts</h2>
            </div>
            <ul className={styles.contentList}>
              {itinerary.posts.map((post) => (
                <li key={post.id} className={styles.contentItem}>
                  <div className={styles.postContent}>
                    {post.content ? (
                      <p>{post.content.length > 200 ? `${post.content.substring(0, 200)}...` : post.content}</p>
                    ) : (
                      <p>No content provided.</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminItineraryDetail;
