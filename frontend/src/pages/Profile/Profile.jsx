import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/user.js';
import Header from '../../component/Header/Header';
import styles from './Profile.module.css';
import defaultAvatar from '../../assets/images/default_avatar.png';

function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('itineraries');
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    location: '',
    bio: ''
  });

  const isOwnProfile = !userId || userId === currentUser?.id;

  useEffect(() => {
    loadProfile();
    loadItineraries();
    if (isOwnProfile) {
      loadStats();
    }
  }, [userId, currentUser]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      let profileData;
      
      if (isOwnProfile) {
        profileData = await userService.getMyProfile();
      } else {
        profileData = await userService.getUserProfile(userId);
      }
      
      setProfile(profileData);
      setEditForm({
        name: profileData.name || '',
        email: profileData.email || '',
        location: 'Hà Nội, Việt Nam', 
        bio: profileData.bio || ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await userService.getUserStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const loadItineraries = async () => {
    try {
      let itinerariesData;
      if (isOwnProfile) {
        itinerariesData = await userService.getMyItineraries();
      } else {
        itinerariesData = await userService.getUserItineraries(userId);
      }
      setItineraries(itinerariesData);
    } catch (err) {
      console.error('Failed to load itineraries:', err);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const updatedProfile = await userService.updateProfile({
        name: editForm.name,
        bio: editForm.bio
      });
      setProfile(updatedProfile);
      setIsEditing(false);
      setSuccess('Cập nhật thông tin thành công!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFollow = async () => {
    try {
      await userService.followUser(userId);
      setSuccess('Đã theo dõi người dùng!');
      setTimeout(() => setSuccess(''), 3000);
      loadStats();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUnfollow = async () => {
    try {
      await userService.unfollowUser(userId);
      setSuccess('Đã bỏ theo dõi người dùng!');
      setTimeout(() => setSuccess(''), 3000);
      loadStats();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleModalClose = (e) => {
    if (e.target === e.currentTarget) {
      setIsEditing(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className={styles.container}>
          <div className={styles.loading}>Đang tải hồ sơ...</div>
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Header />
        <div className={styles.container}>
          <div className={styles.error}>Không tìm thấy hồ sơ</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className={styles.container}>
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        <div className={styles.profileHeader}>
          <div className={styles.profileInfo}>
            <div className={styles.avatarContainer}>
              <img 
                src={profile.avatar || defaultAvatar} 
                alt="Avatar" 
                className={styles.avatar}
              />
            </div>

            <div className={styles.userDetails}>
              <h1 className={styles.userName}>
                {profile.name || 'Chưa có tên'}
              </h1>
              
              <div className={styles.userEmail}>{profile.email}</div>
              
              <div className={styles.userLocation}>
                <i className="ri-map-pin-line"></i>
                Hà Nội, Việt Nam
              </div>
              
              {profile.bio && (
                <div className={styles.userBio}>{profile.bio}</div>
              )}
            </div>

            <div className={styles.actionButtons}>
              {isOwnProfile ? (
                <button 
                  className={styles.editButton}
                  onClick={() => setIsEditing(true)}
                >
                  Chỉnh sửa
                </button>
              ) : (
                <div>
                  <button 
                    className={styles.followButton}
                    onClick={handleFollow}
                  >
                    Theo dõi
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {stats && (
          <div className={styles.statsContainer}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{stats.totalItineraries}</span>
              <span className={styles.statLabel}>lịch trình</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{stats.followersCount}</span>
              <span className={styles.statLabel}>người theo dõi</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{stats.followingCount}</span>
              <span className={styles.statLabel}>đang theo dõi</span>
            </div>
          </div>
        )}

        <div className={styles.tabNavigation}>
          <button 
            className={`${styles.tabButton} ${activeTab === 'itineraries' ? styles.active : ''}`}
            onClick={() => setActiveTab('itineraries')}
          >
            Lịch trình của tôi
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'posts' ? styles.active : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            Bài đăng
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'saved' ? styles.active : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            Đã lưu
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'itineraries' && (
            <div className={styles.itinerariesGrid}>
              {itineraries.map((itinerary) => (
                <div key={itinerary.id} className={styles.itineraryCard}>
                  <div className={styles.itineraryImage}>
                    <img 
                      src="https://via.placeholder.com/300x200" 
                      alt={itinerary.title}
                    />
                    <div className={styles.itineraryStatus}>
                      {itinerary.visibility === 'PUBLIC' ? 'Công khai' : 'Riêng tư'}
                    </div>
                  </div>
                  <div className={styles.itineraryInfo}>
                    <h3 className={styles.itineraryTitle}>{itinerary.title}</h3>
                    <div className={styles.itineraryMeta}>
                      <span className={styles.itineraryLocation}>
                        <i className="ri-map-pin-line"></i>
                        {itinerary.destination || 'Chưa có địa điểm'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'posts' && (
            <div className={styles.postsGrid}>
              <p>Bài đăng sẽ được hiển thị ở đây</p>
            </div>
          )}

          {activeTab === 'saved' && (
            <div className={styles.savedGrid}>
              <p>Nội dung đã lưu sẽ được hiển thị ở đây</p>
            </div>
          )}
        </div>

        {isEditing && (
          <div className={styles.modalOverlay} onClick={handleModalClose}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h3>Chỉnh sửa thông tin</h3>
                <button 
                  className={styles.modalCloseButton}
                  onClick={() => setIsEditing(false)}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className={styles.modalForm}>
                <div className={styles.formGroup}>
                  <label>Họ và tên</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    placeholder="Nhập họ và tên"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    disabled
                    className={styles.disabledInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Địa chỉ</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                    placeholder="Nhập địa chỉ"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Giới thiệu bản thân</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    placeholder="Giới thiệu về bản thân..."
                    maxLength={500}
                  />
                  <div className={styles.charCount}>
                    {editForm.bio.length}/500
                  </div>
                </div>

                <div className={styles.modalActions}>
                  <button 
                    type="button" 
                    className={styles.cancelButton}
                    onClick={() => setIsEditing(false)}
                  >
                    Hủy
                  </button>
                  <button type="submit" className={styles.saveButton}>
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Profile;
