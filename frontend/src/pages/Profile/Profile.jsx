import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../context/UserContext";
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
import postService from "../../services/post";
import FollowModal from "../../component/FollowModal/FollowModal.jsx"
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
  const {
    updateAvatar,
    isUpdatingAvatar,
    currentUser: userContextUser,
  } = useUser();

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
  const [loadUpload, setLoadUpload] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [followList, setFollowList] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState(null);

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    location: "",
    bio: "",
  });

  const [isAvatarViewerOpen, setIsAvatarViewerOpen] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const avatarMenuRef = useRef(null);
  const avatarFileInputRef = useRef(null);

  const {
    posts,
    setPosts,
    editingPostId,
    setEditingPostId,
    handleDeletePost,
    handleEditPost,
    handleUpdatePost,
  } = usePostActions([]);

  const isOwnProfile =
    !userId || userId === (userContextUser?.id || currentUser?.id);

useEffect(() => {
  const targetUserId = userId || currentUser?.id;
  
  if (targetUserId) {
    loadProfile();
    loadItineraries();
    loadStats(targetUserId); 
    if (isOwnProfile) {
    }
  }

}, [userId, currentUser, isOwnProfile]); 

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
        location: profileData.location || "",
        bio: profileData.bio || "",
      });
      setIsFollowing(Boolean(profileData.isFollowing));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async (targetUserId) => {
      try {
          const statsData = await userService.getUserStats(targetUserId);
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
        location: editForm.location,
      });
      setProfile(updatedProfile);
      setIsEditing(false);
      setSuccess("Cập nhật thông tin thành công!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAvatarClick = () => {
    if (isOwnProfile) {
      setIsAvatarMenuOpen((prev) => !prev);
    } else {
      setIsAvatarViewerOpen(true);
    }
  };

  const handleViewAvatar = () => {
    setIsAvatarMenuOpen(false);
    setIsAvatarViewerOpen(true);
  };

  const handleChooseAvatar = () => {
    setIsAvatarMenuOpen(false);
    avatarFileInputRef.current?.click();
  };

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setError("");
      setLoadUpload("Đang upload ảnh! Hãy đợi ít phút!");
      const result = await updateAvatar(file);
      if (result.success) {
        setProfile((prev) => ({ ...prev, avatar: result.avatarUrl }));
        setSuccess("Đã cập nhật ảnh đại diện!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError(err.message || "Cập nhật ảnh đại diện thất bại");
    } finally {
      if (avatarFileInputRef.current) avatarFileInputRef.current.value = "";
      setLoadUpload("");
    }
  };

  useEffect(() => {
    if (!isAvatarMenuOpen) return;
    const handleClickOutside = (e) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target)) {
        setIsAvatarMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAvatarMenuOpen]);

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

  const handleOpenModal = async (type) => {
  const targetUserId = userId || currentUser?.id;
  if (!targetUserId || !currentUser) return; 

  setModalOpen(true);
  setListLoading(true);
  setListError(null);

  try {
    let data = [];
    if (type === 'followers') {
      setModalTitle('Người theo dõi');
      data = await userService.getFollowersList(targetUserId, currentUser.id);
    } else {
      setModalTitle('Đang theo dõi');
      data = await userService.getFollowingList(targetUserId, currentUser.id);
    }
    setFollowList(data);
  } catch (err) {
    setListError('Không thể tải danh sách. Vui lòng thử lại.');
  } finally {
    setListLoading(false);
  }
};

  const handleCloseModal = () => {
    setModalOpen(false);
    setFollowList([]);
    setListError(null);
  };
  
  const handleFollowFromModal = async (targetUserId) => {
    try {
      await userService.followUser(targetUserId);
      setFollowList(prevList => prevList.map(u => u.id === targetUserId ? { ...u, isFollowing: true } : u));
      loadStats();
    } catch (error) {
      console.error('Failed to follow:', error);
    }
  };

  const handleUnfollowFromModal = async (targetUserId) => {
    try {
      await userService.unfollowUser(targetUserId);
      setFollowList(prevList => prevList.map(u => u.id === targetUserId ? { ...u, isFollowing: false } : u));
      loadStats();
    } catch (error) {
      console.error('Failed to unfollow:', error);
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
        {loadUpload && <div className={styles.loadUpload}>{loadUpload}</div>}
        <div className={styles.profileHeader}>
          <div className={styles.avatarContainer}>
            <img
              src={profile.avatar || userContextUser?.avatar || defaultAvatar}
              alt="Avatar"
              className={styles.avatar}
              onClick={handleAvatarClick}
            />
            {isOwnProfile && (
              <div className={styles.cameraBadge} onClick={handleAvatarClick}>
                <i className="ri-camera-fill"></i>
              </div>
            )}
            {isOwnProfile && isAvatarMenuOpen && (
              <div className={styles.avatarMenu} ref={avatarMenuRef}>
                <button
                  onClick={handleViewAvatar}
                  className={styles.avatarMenuItem}
                >
                  <i className="ri-image-2-line"></i> Xem ảnh đại diện
                </button>
                <button
                  onClick={handleChooseAvatar}
                  className={styles.avatarMenuItem}
                  disabled={isUpdatingAvatar}
                >
                  <i className="ri-upload-2-line"></i>{" "}
                  {isUpdatingAvatar ? "Đang tải..." : "Chọn ảnh đại diện"}
                </button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              ref={avatarFileInputRef}
              onChange={handleAvatarFileChange}
            />
          </div>
          <div className={styles.userDetails}>
            <h1>{profile.name || "Chưa có tên"}</h1>
            <p>{profile.email}</p>
            <p>
              <i className="ri-map-pin-line" /> {profile.location}
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
            <div className={styles.statsItem} onClick={() => handleOpenModal('followers')}>
              <b>{stats.followersCount}</b> người theo dõi
            </div>
            <div className={styles.statsItem} onClick={() => handleOpenModal('following')}>
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
                    <img
                      src={it.coverImage ? it.coverImage : coverItinerary}
                      alt={it.title}
                    />
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
                      to={`/itineraries/${it.slug}`}
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
                    onDelete={() => handleDeletePost(post)}
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

        {isAvatarViewerOpen && (
          <div
            className={styles.avatarViewerOverlay}
            onClick={() => setIsAvatarViewerOpen(false)}
          >
            <button
              className={`${styles.avatarViewerButton} ${styles.avatarViewerClose}`}
              onClick={() => setIsAvatarViewerOpen(false)}
            >
              <i className="ri-close-line"></i>
            </button>
            <div
              className={styles.avatarViewerContent}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={profile.avatar || userContextUser?.avatar || defaultAvatar}
                alt="Avatar full view"
                className={styles.avatarViewerImage}
              />
            </div>
          </div>
        )}
      </div>
      {modalOpen && (
          <FollowModal
            title={modalTitle}
            users={followList}
            loading={listLoading}
            error={listError}
            onClose={handleCloseModal}
            onFollow={handleFollowFromModal}
            onUnfollow={handleUnfollowFromModal}
            currentUserId={currentUser.id}
          />
      )}
    </>
  );
}
