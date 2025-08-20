import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import userService from "../../services/user.js";
import Header from "../../component/Header/Header";
import PostCard from "../Post/PostCard/PostCard";
import styles from "./Profile.module.css";
import defaultAvatar from "../../assets/images/default_avatar.png";
import usePostActions from "../../hooks/usePostAction.js";
import coverItinerary from "../../assets/images/coverItinerary.jpg";
import { Calendar, DollarSign } from "lucide-react";
import moment from "moment";
import BookmarkList from "../../component/Profile/BookmarkList.jsx";

function EditProfileForm({ editForm, setEditForm, onCancel, onSubmit }) {
  return (
    <div
      className={styles.modalOverlay}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Chỉnh sửa thông tin</h3>
          <button className={styles.modalCloseButton} onClick={onCancel}>
            ×
          </button>
        </div>

        <form onSubmit={onSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label>Họ và tên</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
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
              onChange={(e) =>
                setEditForm({ ...editForm, location: e.target.value })
              }
              placeholder="Nhập địa chỉ"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Giới thiệu bản thân</label>
            <textarea
              value={editForm.bio}
              onChange={(e) =>
                setEditForm({ ...editForm, bio: e.target.value })
              }
              placeholder="Giới thiệu về bản thân..."
              maxLength={500}
            />
            <div className={styles.charCount}>{editForm.bio.length}/500</div>
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onCancel}
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
  );
}

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("itineraries");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [postsLoading, setPostsLoading] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    location: "",
    bio: "",
  });

  const {
    posts,
    setPosts,
    editingPostId,
    setEditingPostId,
    handleDeletePost,
    handleEditPost,
    handleUpdatePost,
  } = usePostActions([]);

  const isOwnProfile = !userId || userId === currentUser?.id;

  useEffect(() => {
    loadProfile();
    loadItineraries();
    if (isOwnProfile) loadStats();
  }, [userId, currentUser]);

  useEffect(() => {
    if (activeTab === "posts") loadPosts();
  }, [activeTab, userId, currentUser]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = isOwnProfile
        ? await userService.getMyProfile()
        : await userService.getUserProfile(userId);

      setProfile(profileData);
      setEditForm({
        name: profileData.name || "",
        email: profileData.email || "",
        location: "Hà Nội, Việt Nam",
        bio: profileData.bio || "",
      });
      setIsFollowing(Boolean(profileData.isFollowing));
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
      console.error("Failed to load stats:", err);
    }
  };

  const loadItineraries = async () => {
    try {
      const data = isOwnProfile
        ? await userService.getMyItineraries()
        : await userService.getUserItineraries(userId);
      setItineraries(data);
    } catch (err) {
      console.error("Failed to load itineraries:", err);
    }
  };

  const loadPosts = async () => {
    try {
      setPostsLoading(true);
      const targetUserId = isOwnProfile ? currentUser?.id : userId;
      if (!targetUserId) return;
      const data = await userService.getUserPosts(targetUserId);
      setPosts(Array.isArray(data) ? data : data?.posts || []);
    } catch (err) {
      console.error("Failed to load posts:", err);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      const updatedProfile = await userService.updateProfile({
        name: editForm.name,
        bio: editForm.bio,
      });
      setProfile(updatedProfile);
      setIsEditing(false);
      setSuccess("Cập nhật thông tin thành công!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFollowToggle = async () => {
    try {
      setFollowLoading(true);
      if (isFollowing) {
        await userService.unfollowUser(userId);
        setIsFollowing(false);
        setSuccess("Đã bỏ theo dõi!");
      } else {
        await userService.followUser(userId);
        setIsFollowing(true);
        setSuccess("Đã theo dõi!");
      }
      setTimeout(() => setSuccess(""), 3000);
      loadStats();
    } catch (err) {
      setError(err.message);
    } finally {
      setFollowLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) {
      return "Not specified";
    }
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className={styles.container}>
          <p>Đang tải hồ sơ...</p>
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Header />
        <div className={styles.container}>
          <p>Không tìm thấy hồ sơ</p>
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
          <div className={styles.avatarContainer}>
            <img
              src={profile.avatar || defaultAvatar}
              alt="Avatar"
              className={styles.avatar}
            />
          </div>
          <div className={styles.userDetails}>
            <h1>{profile.name || "Chưa có tên"}</h1>
            <p>{profile.email}</p>
            <p>
              <i className="ri-map-pin-line" /> Hà Nội, Việt Nam
            </p>
            {profile.bio && <p>{profile.bio}</p>}
          </div>

          <div>
            {isOwnProfile ? (
              <button
                className={styles.editButton}
                onClick={() => setIsEditing(true)}
              >
                Chỉnh sửa
              </button>
            ) : (
              <button
                className={
                  isFollowing ? styles.unfollowButton : styles.followButton
                }
                onClick={handleFollowToggle}
                disabled={followLoading}
              >
                {isFollowing ? "Bỏ theo dõi" : "Theo dõi"}
              </button>
            )}
          </div>
        </div>

        {stats && (
          <div className={styles.statsContainer}>
            <div>
              <b>{stats.totalItineraries}</b> lịch trình
            </div>
            <div>
              <b>{stats.followersCount}</b> người theo dõi
            </div>
            <div>
              <b>{stats.followingCount}</b> đang theo dõi
            </div>
          </div>
        )}

        <div className={styles.tabNavigation}>
          {["itineraries", "posts", ...(isOwnProfile ? ["saved"] : [])].map(
            (tab) => (
              <button
                key={tab}
                className={activeTab === tab ? styles.active : ""}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "itineraries" && "Lịch trình"}
                {tab === "posts" && "Bài đăng"}
                {tab === "saved" && "Đã lưu"}
              </button>
            )
          )}
        </div>

        <div className={styles.tabContent}>
          {activeTab === "itineraries" && (
            <div className={styles.itinerariesGrid}>
              {itineraries.length > 0 ? (
                itineraries.map((it) => (
                  <div key={it.id} className={styles.itineraryCard}>
                    <img src={coverItinerary} alt="cover" />
                    <h3>{it.title}</h3>
                    <p>
                      <i className="ri-map-pin-line"></i>{" "}
                      {it.destination || "Chưa có địa điểm"}
                    </p>
                    <p>
                      <Calendar size={16} />{" "}
                      {moment(it.startDate).format("DD/MM/YYYY")} -{" "}
                      {moment(it.endDate).format("DD/MM/YYYY")}
                    </p>
                    <p>
                      <DollarSign size={16} /> {formatCurrency(it.budget)}
                    </p>
                    <Link
                      to={`/itineraries/${it.id}`}
                      className={styles.itineraryButton}
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                ))
              ) : (
                <p>Chưa có lịch trình</p>
              )}
            </div>
          )}

          {activeTab === "posts" && (
            <div className={styles.postsGrid}>
              {postsLoading ? (
                <p>Đang tải...</p>
              ) : posts.length === 0 ? (
                <p>Chưa có bài đăng</p>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onEdit={() => handleEditPost(post)}
                    onDelete={() => handleDeletePost(post.id)}
                    isEditing={editingPostId === post.id}
                    onCancelEdit={() => setEditingPostId(null)}
                    onSubmitEdit={handleUpdatePost}
                  />
                ))
              )}
            </div>
          )}

          {activeTab === "saved" && <BookmarkList />}
        </div>

        {isEditing && (
          <EditProfileForm
            editForm={editForm}
            setEditForm={setEditForm}
            onCancel={() => setIsEditing(false)}
            onSubmit={handleEditSubmit}
          />
        )}
      </div>
    </>
  );
}
