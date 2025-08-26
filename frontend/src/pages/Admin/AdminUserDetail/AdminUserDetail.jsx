import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './AdminUserDetail.module.css';
import {
  ArrowLeft,
  User,
  Mail,
  Briefcase,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Eye,
  List,
  Heart, 
  MapPin,
} from 'lucide-react';
import { fetchUserById } from '../../../services/admin';

const LoadingHeart = () => (
    <div className={styles.loadingContainer}>
        <div className={styles.loadingHeart}>
            <Heart className={styles.heartIcon} />
        </div>
        <p>Loading user details...</p>
    </div>
);

const AdminUserDetail = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const data = await fetchUserById(userId);
        setUser(data);
      } catch (error) {
        console.error("Failed to fetch user details", error);
      } finally {
        setLoading(false);
      }
    };
    getUserDetails();
  }, [userId]);

  if (loading) {
    return <LoadingHeart />;
  }

  if (!user) {
    return <div className={styles.container}>User not found.</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link to="/admin/users" className={styles.backButton}>
          <ArrowLeft size={20} />
          <span>Back to List</span>
        </Link>
        <h1 className={styles.title}>User Details</h1>
      </header>

      {user.coverPhoto && (
        <div className={styles.coverPhotoWrapper}>
          <img src={user.coverPhoto } alt="Cover" className={styles.coverPhoto} />
        </div>
      )}

      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <img
            src={user.avatar || 'https://via.placeholder.com/150/ff80ab/ffffff?text=U'}
            alt="User Avatar"
            className={styles.avatar}
          />
          <div className={styles.userInfo}>
            <h2 className={styles.userName}>{user.name || 'N/A'}</h2>
            <div className={styles.statusContainer}>
              {user.isActive ? (
                <span className={styles.statusActive}>
                  <ToggleRight size={16} /> Active
                </span>
              ) : (
                <span className={styles.statusInactive}>
                  <ToggleLeft size={16} /> Inactive
                </span>
              )}
            </div>
            {user.bio && <p className={styles.userBio}>{user.bio}</p>}
          </div>
        </div>

        <div className={styles.detailsGrid}>
          <div className={styles.detailItem}>
            <Mail size={20} className={styles.detailIcon} />
            <span className={styles.detailLabel}>Email:</span>
            <span className={styles.detailValue}>{user.email}</span>
          </div>
          <div className={styles.detailItem}>
            <Briefcase size={20} className={styles.detailIcon} />
            <span className={styles.detailLabel}>Role:</span>
            <span className={styles.detailValue}>{user.role}</span>
          </div>
          <div className={styles.detailItem}>
            <Calendar size={20} className={styles.detailIcon} />
            <span className={styles.detailLabel}>Joined At:</span>
            <span className={styles.detailValue}>{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {user.itineraries && user.itineraries.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <List size={24} className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>User's Itineraries ({user.itineraries.length})</h2>
          </div>
          <div className={styles.itineraryGrid}>
            {user.itineraries.map(itinerary => (
              <div key={itinerary.id} className={styles.itineraryCard}>
                <h3 className={styles.itineraryTitle}>{itinerary.title}</h3>
                <div className={styles.itineraryInfo}>
                  <div className={styles.itineraryMeta}>
                    <MapPin size={16} />
                    <span>{itinerary.destination}</span>
                  </div>
                  <div className={styles.itineraryMeta}>
                    <Calendar size={16} />
                    <span>{new Date(itinerary.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className={styles.itineraryMeta}>
                    <span className={itinerary.visibility === 'PUBLIC' ? styles.visibilityPublic : styles.visibilityPrivate}>
                      {itinerary.visibility}
                    </span>
                  </div>
                </div>
                <Link to={`/admin/itineraries/${itinerary.id}`} className={styles.viewButton}>
                  <Eye size={16} /> View Details
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserDetail;
