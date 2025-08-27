import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import userService from "../../services/user";
import { Users, MapPin, Eye } from "lucide-react";
import styles from "./FeatureBlogger.module.css";
import avatarDefault from "../../assets/images/default_avatar.png";
import { useNotification } from "../../hooks/useNotification";

const FeatureBlogger = () => {
  const [bloggers, setBloggers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchBloggers = async () => {
      try {
        const token = sessionStorage.getItem("userToken");
        let currentUserId = null;
        
        if (token) {
          try {
            const profile = await userService.getMyProfile();
            currentUserId = profile.id;
          } catch (err) {
          }
        }
        
        const data = await userService.getFeaturedBloggers(8, currentUserId);
        setBloggers(data);
      } catch (err) {
        setError("Failed to load featured bloggers.");
      } finally {
        setLoading(false);
      }
    };
    fetchBloggers();
  }, []);

  const handleFollowToggle = async (userId, isFollowing) => {
    try {
      const token = sessionStorage.getItem("userToken");
      if (!token) {
        showNotification("Vui lòng đăng nhập để theo dõi blogger!", "warning");
        return;
      }

      if (isFollowing) {
        await userService.unfollowUser(userId);
        showNotification("Đã bỏ theo dõi blogger!", "success");
      } else {
        await userService.followUser(userId);
        showNotification("Đã theo dõi blogger!", "success");
      }
      setBloggers(prev =>
        prev.map(blogger =>
          blogger.id === userId
            ? { 
                ...blogger, 
                isFollowing: !isFollowing,
                followersCount: isFollowing 
                  ? blogger.followersCount - 1 
                  : blogger.followersCount + 1
              }
            : blogger
        )
      );
    } catch (error) {
      console.error("Error handling follow:", error);
      showNotification("Có lỗi xảy ra khi theo dõi!", "error");
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div>
      {error && <p className={styles.error}>{error}</p>}

      {bloggers.length === 0 ? (
        <p className={styles.emptyMessage}>No featured bloggers yet.</p>
      ) : (
        <div className={styles.bloggerGrid}>
          {bloggers.map((blogger) => (
            <div
              key={blogger.id}
              className={styles.bloggerCard}
              onClick={() => navigate(`/profile/${blogger.id}`)}
            >
              <div className={styles.cardHeader}>
                <img
                  src={blogger.avatar || avatarDefault}
                  alt={blogger.name}
                  className={styles.bloggerAvatar}
                />
                <button
                  className={`${styles.followButton} ${
                    blogger.isFollowing ? styles.following : styles.notFollowing
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFollowToggle(blogger.id, blogger.isFollowing);
                  }}
                >
                  {blogger.isFollowing ? "Đang theo dõi" : "Theo dõi"}
                </button>
              </div>

              <div className={styles.bloggerInfo}>
                <h3 className={styles.bloggerName}>{blogger.name}</h3>
                {blogger.bio && (
                  <p className={styles.bloggerBio}>{blogger.bio}</p>
                )}
              </div>

              <div className={styles.bloggerStats}>
                <div className={styles.statItem}>
                  <Users size={16} className={styles.statIcon} />
                  <span>{blogger.followersCount} người theo dõi</span>
                </div>
                <div className={styles.statItem}>
                  <MapPin size={16} className={styles.statIcon} />
                  <span>{blogger.itinerariesCount} lịch trình</span>
                </div>
                <div className={styles.statItem}>
                  <Eye size={16} className={styles.statIcon} />
                  <span>{blogger.totalViews.toLocaleString('vi-VN')} lượt xem</span>
                </div>
                {blogger.location && (
                  <div className={styles.statItem}>
                    <MapPin size={16} className={styles.statIcon} />
                    <span>{blogger.location}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeatureBlogger;
