import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useUser } from "../../../context/UserContext";

import itineraryService from "../../../services/itinerary";
import activityService from "../../../services/activity";
import bookmarkService from "../../../services/bookmark";
import postService from "../../../services/post";
import ActivityFormModal from "../../Activity/ActivityFormModal/ActivityFormModal";
import CreatePost from "../../Post/CreatePost/CreatePost";
import PostCard from "../../Post/PostCard/PostCard";
import ratingsService from "../../../services/ratings";
import StarRating from "../../../component/StarRating/StarRating";

import styles from "./ItineraryDetail.module.css";
import { useNotification } from "../../../hooks/useNotification";

const LoadingSkeleton = () => (
  <div className={styles.mainWrapper}>
    <div className={styles.container}>
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <p>Đang tải hành trình...</p>
      </div>
    </div>
  </div>
);

const LazyImage = ({ src, alt, className, onLoad }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setLoaded(true);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setError(true);
  };

  return (
    <div className={`${styles.imageContainer} ${loaded ? styles.loaded : ""}`}>
      {!loaded && !error && (
        <div className={styles.imageSkeleton}>
          <div className={styles.shimmer}></div>
        </div>
      )}
      <img
        src={
          error
            ? "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            : src
        }
        alt={alt}
        className={className}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        style={{ opacity: loaded ? 1 : 0 }}
      />
    </div>
  );
};

const AnimatedCounter = ({ value, suffix = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    if (start === end) return;

    const incrementTime = (2000 / end) * 2;
    const timer = setInterval(() => {
      start += Math.ceil(end / 100);
      if (start > end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

const ItineraryDetail = () => {
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);

  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState(null);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);

  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [userRating, setUserRating] = useState(0);

  const navigate = useNavigate();
  const { slug } = useParams();

  const { user: currentUser } = useAuth();

  const { currentUser: userContextUser } = useUser();
  const hasViewedRef = useRef(false);
  const heroImageRef = useRef(null);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (heroImageRef.current) {
        const scrolled = window.pageYOffset;
        const parallax = scrolled * 0.5;
        heroImageRef.current.style.transform = `translateY(${parallax}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchItineraryData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem("userToken");
      if (!token) {
        navigate("/signin");
        return;
      }

      const data = await itineraryService.getItineraryBySlug(slug);
      setItinerary(data);
      setPosts(data.posts || []);
    } catch (err) {
      console.error(err);
      setError("Không thể tải chi tiết hành trình. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRatings = async () => {
    if (!itinerary) return;

    try {
      const ratings = await ratingsService.getAverageRating(itinerary.id);
      setAverageRating(ratings.averageRating);
      setRatingCount(ratings.ratingCount);
    } catch (error) {
      console.error("Error fetching average rating:", error);
    }
  };

  const fetchUserRating = async () => {
    if (!itinerary || !currentUser) return;

    try {
      const userRatingData = await ratingsService.getUserRating(
        itinerary.id,
        currentUser.id
      );
      if (userRatingData) {
        setUserRating(userRatingData.value);
      }
    } catch (error) {
      console.error("Error fetching user rating:", error);
    }
  };

  const handleRateItinerary = async (value) => {
    if (!itinerary || !currentUser) {
      navigate("/signin");
      return;
    }

    if (isOwner) {
      showNotification(
        "Bạn không thể tự đánh giá hành trình của mình.",
        "warning"
      );
      return;
    }

    try {
      await ratingsService.rate(itinerary.id, value);
      setUserRating(value);
      fetchRatings();

      showNotification("Bạn đã đánh giá thành công!", "success");
    } catch (error) {
      console.error("Lỗi khi gửi đánh giá:", error);
      showNotification("Gửi đánh giá thất bại. Vui lòng thử lại.", "error");
    }
  };

  const { showNotification } = useNotification();

  const checkBookmarkStatus = async () => {
    if (!itinerary) return;
    try {
      const res = await bookmarkService.check("ITINERARY", itinerary.id);
      setIsBookmarked(res.isBookmarked);
      setBookmarkId(res.bookmarkId || null);
    } catch (error) {
      console.error("Error checking bookmark status:", error);
    }
  };

  const isOwner =
    itinerary && currentUser && itinerary.user.id === currentUser.id;

  useEffect(() => {
    fetchItineraryData();

    if (!hasViewedRef.current) {
      itineraryService.increaseItineraryViews(slug);
      hasViewedRef.current = true;
    }
  }, [slug, navigate]);

  useEffect(() => {
    if (itinerary) {
      checkBookmarkStatus();
      fetchRatings();
      if (currentUser && !isOwner) {
        fetchUserRating();
      } else {
        setUserRating(0);
      }
    }
  }, [itinerary, currentUser, isOwner]);

  const handleDeleteItinerary = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hành trình này không?")) {
      try {
        await itineraryService.deleteItinerary(itinerary.id);
        showNotification("Xóa hành trình thành công!", "success");
        navigate("/itineraries");
      } catch (err) {
        setError("Không thể xóa hành trình. Vui lòng thử lại.");
        showNotification(
          "Không thể xóa hành trình. Vui lòng thử lại.",
          "error"
        );
      }
    }
  };

  const handleAddActivityClick = () => {
    setEditingActivity(null);
    setShowActivityModal(true);
  };

  const handleEditActivityClick = (activity) => {
    setEditingActivity(activity);
    setShowActivityModal(true);
  };

  const handleSaveActivity = async (activityData) => {
    try {
      if (activityData.id) {
        await activityService.updateActivity(activityData.id, activityData);
        showNotification("Cập nhật hoạt động thành công!", "success");
      } else {
        await activityService.createActivity(activityData);
        showNotification("Thêm hoạt động thành công!", "success");
      }
      await fetchItineraryData();
    } catch (err) {
      showNotification("Có lỗi xảy ra. Vui lòng thử lại.", "error");
      throw err;
    }
  };

  const handleDeleteActivityClick = async (activityId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hoạt động này không?")) {
      try {
        await activityService.deleteActivity(activityId);
        showNotification("Xóa hoạt động thành công!", "success");
        await fetchItineraryData();
      } catch (err) {
        setError(err.message || "Không thể xóa hoạt động. Vui lòng thử lại.");
        showNotification("Không thể xóa hoạt động. Vui lòng thử lại.", "error");
      }
    }
  };

  const handleBookmarkClick = async () => {
    if (!itinerary) return;

    setBookmarkLoading(true);

    const wasBookmarked = isBookmarked;
    setIsBookmarked(!isBookmarked);

    try {
      if (wasBookmarked) {
        await bookmarkService.remove(bookmarkId);
        setBookmarkId(null);
        showNotification("Đã bỏ lưu hành trình", "info");
      } else {
        const newBookmark = await bookmarkService.create({
          type: "ITINERARY",
          itemId: itinerary.id,
        });
        setBookmarkId(newBookmark.id);
        showNotification("Đã lưu hành trình thành công!", "success");
      }
    } catch (error) {
      setIsBookmarked(wasBookmarked);
      console.error("Error toggling bookmark:", error);
      showNotification(
        "Không thể cập nhật bookmark. Vui lòng thử lại.",
        "error"
      );
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleCreatePostClick = () => {
    setShowCreatePost(true);
  };

  const handlePostCreated = (newPost) => {
    setShowCreatePost(false);
    setPosts((prevPosts) => [newPost, ...prevPosts]);
    showNotification("Tạo bài viết thành công!", "success");
  };

  const handleCancelCreatePost = () => {
    setShowCreatePost(false);
  };

  const handleDeletePost = async (post) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
      try {
        await postService.deletePost(post.id);
        setPosts((prevPosts) => prevPosts.filter((p) => p.id !== post.id));
        showNotification("Xóa bài viết thành công!", "success");
      } catch (error) {
        console.error("Error when delete post:", error);
        showNotification("Không thể xóa bài viết. Vui lòng thử lại.", "error");
      }
    }
  };

  const handleEditPost = (post) => {
    setEditingPostId(post.id);
  };

  const handleUpdatePost = async (updatedPostData) => {
    try {
      const res = await postService.updatePost(
        updatedPostData.id,
        updatedPostData
      );
      setPosts((prevPosts) =>
        prevPosts.map((p) => (p.id === res.id ? res : p))
      );
      setEditingPostId(null);
      showNotification("Cập nhật bài viết thành công!", "success");
    } catch (error) {
      console.error("Error when update:", error);
      showNotification(
        "Không thể cập nhật bài viết. Vui lòng thử lại.",
        "error"
      );
    }
  };

  const groupActivitiesByDate = (activities) => {
    if (!activities) return {};
    const grouped = {};
    activities.forEach((activity) => {
      const dateObj = new Date(activity.date);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      const dateKey = `${year}-${month}-${day}`;

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

  const groupedActivities = itinerary
    ? groupActivitiesByDate(itinerary.activities)
    : {};
  const sortedDates = Object.keys(groupedActivities).sort();

  const formatDate = (dateString, formatType) => {
    const date = new Date(dateString);
    if (formatType === "DD/MM/YYYY") {
      return date.toLocaleDateString("vi-VN");
    } else if (formatType === "dddd, DD MMMM YYYY") {
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

  const calculateDayNumber = (dateKey) => {
    if (!itinerary?.startDate) return 0;
    const startDate = new Date(itinerary.startDate);
    const currentDate = new Date(dateKey);
    const timeDifference = currentDate.getTime() - startDate.getTime();
    const dayDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    return dayDifference + 1;
  };

  const calculateTotalDays = () => {
    if (!itinerary?.startDate || !itinerary?.endDate) return 0;
    const startDate = new Date(itinerary.startDate);
    const endDate = new Date(itinerary.endDate);
    const timeDifference = endDate.getTime() - startDate.getTime();
    return Math.floor(timeDifference / (1000 * 60 * 60 * 24)) + 1;
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>
            <i className="ri-error-warning-line"></i>
          </div>
          <div className={styles.error}>{error}</div>
          <button
            onClick={() => navigate("/itineraries")}
            className={styles.backButtonError}
          >
            <i className="ri-arrow-left-line"></i>
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.notFoundContainer}>
          <div className={styles.notFoundIcon}>
            <i className="ri-map-2-line"></i>
          </div>
          <div className={styles.message}>Không tìm thấy hành trình.</div>
          <button
            onClick={() => navigate("/itineraries")}
            className={styles.backButtonError}
          >
            <i className="ri-arrow-left-line"></i>
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.mainWrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <button onClick={() => navigate(-1)} className={styles.backLink}>
            <i className="ri-arrow-left-line"></i>
          </button>
          <h1 className={styles.headerTitle}>{itinerary.title}</h1>
        </div>

        <div className={styles.heroSection} id="hero">
          <div className={styles.heroImageContainer}>
            <LazyImage
              ref={heroImageRef}
              src={
                itinerary.coverImage
                  ? itinerary.coverImage
                  : "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              }
              alt={itinerary.title}
              className={styles.heroImage}
            />
            <div className={styles.heroOverlay}></div>
            <div className={styles.heroContent}>
              <div className={styles.heroDetails}>
                <span className={styles.heroDetailItem}>
                  <i className="ri-map-pin-line"></i>
                  {itinerary.destination || "Chưa xác định"}
                </span>
                <span className={styles.heroDetailItem}>
                  <i className="ri-time-line"></i>
                  <AnimatedCounter
                    value={calculateTotalDays()}
                    suffix=" ngày"
                  />
                </span>
                <span className={styles.heroDetailItem}>
                  <i className="ri-money-dollar-circle-line"></i>
                  {itinerary.budget
                    ? `${itinerary.budget.toLocaleString("vi-VN")} VND`
                    : "Chưa xác định"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.authorSection} id="author">
          <div className={styles.authorInfo}>
            <Link to={`/profile/${itinerary.user?.id}`}>
              <LazyImage
                src={
                  itinerary.user?.avatar ||
                  "https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20a%20young%20Asian%20female%20traveler%20with%20a%20warm%20confident%20smile%2C%20wearing%20casual%20modern%20clothing%2C%20clean%20studio%20background%20with%20soft%20professional%20lighting&width=50&height=50&seq=author-profile&orientation=squarish"
                }
                alt={itinerary.user?.name || "Tác giả"}
                className={styles.authorAvatar}
              />
            </Link>
            <div>
              <div className={styles.authorNameContainer}>
                <Link to={`/profile/${itinerary.user?.id}`}>
                  <h3 className={styles.authorName}>
                    {itinerary.user?.name || "Ẩn danh"}
                  </h3>
                </Link>
                {itinerary.user?.verified && (
                  <div className={styles.verifiedIcon}>
                    <i className="ri-verified-badge-fill"></i>
                  </div>
                )}
              </div>
              <p className={styles.createdAt}>
                Tạo ngày:{" "}
                {itinerary.createdAt
                  ? new Date(itinerary.createdAt).toLocaleDateString("vi-VN")
                  : "Không xác định"}
              </p>
            </div>
          </div>

          <div className={styles.actionButtons}>
            {isOwner && (
              <button
                onClick={handleCreatePostClick}
                className={styles.createPostButton}
              >
                <i className="ri-add-circle-line"></i>
                <span>Tạo bài viết</span>
              </button>
            )}
            <div className={styles.viewsCount}>
              <i className="ri-eye-line"></i>
              <AnimatedCounter value={itinerary.views || 0} />
            </div>
            <button
              onClick={handleBookmarkClick}
              className={styles.bookmarkButton}
              disabled={bookmarkLoading}
            >
              <i
                className={
                  isBookmarked ? "ri-bookmark-fill" : "ri-bookmark-line"
                }
              ></i>
              <span>
                {bookmarkLoading
                  ? "Đang xử lý..."
                  : isBookmarked
                  ? "Đã lưu"
                  : "Lưu"}
              </span>
            </button>
            <div className={styles.averageRatingDisplay}>
              <span className={styles.ratingNumber}>
                {averageRating.toFixed(1)}/5
              </span>
              <span className={styles.ratingCount}>
                (<AnimatedCounter value={ratingCount} /> đánh giá)
              </span>
            </div>
          </div>
        </div>
        {currentUser && !isOwner && (
          <div className={styles.userRatingSection}>
            <p className={styles.userRatingPrompt}>
              Gửi đánh giá của riêng bạn
            </p>
            <StarRating
              initialRating={userRating}
              onRate={handleRateItinerary}
            />
          </div>
        )}

        {isOwner && showCreatePost && (
          <CreatePost
            itinerary={itinerary}
            onPostCreated={handlePostCreated}
            onCancel={handleCancelCreatePost}
          />
        )}

        {isOwner && (
          <div className={styles.actionButtonsRow}>
            <button
              onClick={handleAddActivityClick}
              className={styles.actionButton}
            >
              <i className="ri-add-circle-line"></i>
              <span>Thêm hoạt động</span>
            </button>
            <button
              onClick={() => navigate(`/itineraries/edit/${itinerary.id}`)}
              className={`${styles.actionButton} ${styles.editActionButton}`}
            >
              <i className="ri-edit-line"></i>
              Chỉnh sửa
            </button>
            <button
              onClick={handleDeleteItinerary}
              className={`${styles.actionButton} ${styles.deleteActionButton}`}
            >
              <i className="ri-delete-bin-line"></i>
              Xóa
            </button>
          </div>
        )}

        <div className={styles.itineraryDays} id="activities">
          {sortedDates.length === 0 ? (
            <div className={styles.emptyActivities}>
              <div className={styles.emptyIcon}>
                <i className="ri-calendar-line"></i>
              </div>
              <p>Chưa có hoạt động nào được lên kế hoạch cho hành trình này.</p>
              {isOwner && (
                <button
                  onClick={handleAddActivityClick}
                  className={styles.addFirstActivityButton}
                >
                  <i className="ri-add-circle-line"></i>
                  Thêm hoạt động đầu tiên
                </button>
              )}
            </div>
          ) : (
            sortedDates.map((dateKey, dateIndex) => (
              <div
                key={dateKey}
                className={styles.dayCard}
                style={{ "--index": dateIndex }}
              >
                <div className={styles.dayHeader}>
                  <div className={styles.dayNumber}>
                    {calculateDayNumber(dateKey)}
                  </div>
                  <div>
                    <h2 className={styles.dayTitle}>
                      Ngày {calculateDayNumber(dateKey)}
                    </h2>
                    <p className={styles.dayDate}>
                      {formatDate(dateKey, "dddd, DD MMMM YYYY")}
                    </p>
                  </div>
                </div>

                <div className={styles.activitiesList}>
                  {groupedActivities[dateKey].map((activity, index) => (
                    <div
                      key={activity.id}
                      className={styles.activityItem}
                      style={{ "--index": index }}
                    >
                      <div className={styles.activityTime}>
                        {activity.startTime || "Cả ngày"}
                      </div>
                      <div className={styles.activityContent}>
                        <div className={styles.activityHeader}>
                          <h4 className={styles.activityName}>
                            {activity.name}
                          </h4>
                          {isOwner && (
                            <div className={styles.activityControls}>
                              <button
                                onClick={() =>
                                  handleEditActivityClick(activity)
                                }
                                className={styles.editActivityButton}
                                title="Chỉnh sửa hoạt động"
                              >
                                <i className="ri-edit-line"></i>
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteActivityClick(activity.id)
                                }
                                className={styles.deleteActivityButton}
                                title="Xóa hoạt động"
                              >
                                <i className="ri-delete-bin-line"></i>
                              </button>
                            </div>
                          )}
                        </div>
                        <p className={styles.activityDescription}>
                          {activity.description || "Chưa có mô tả"}
                        </p>
                        <div className={styles.activityDetails}>
                          <div className={styles.activityLocation}>
                            <i className="ri-map-pin-line"></i>
                            <span>{activity.location || "Chưa xác định"}</span>
                          </div>
                          <span className={styles.activityCost}>
                            {activity.cost
                              ? `${activity.cost.toLocaleString("vi-VN")} VND`
                              : "Miễn phí"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.postsSection} id="posts">
          <h2 className={styles.sectionTitle}>Bài viết liên quan</h2>
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isEditing={editingPostId === post.id}
                onDelete={handleDeletePost}
                onEdit={() => handleEditPost(post)}
                onCancelEdit={() => setEditingPostId(null)}
                onSubmitEdit={handleUpdatePost}
              />
            ))
          ) : (
            <div className={styles.noPostsMessage}>
              <div className={styles.noPostsIcon}>
                <i className="ri-article-line"></i>
              </div>
              <p>Chưa có bài viết nào cho hành trình này.</p>
            </div>
          )}
        </div>
      </div>

      {isOwner && itinerary && (
        <ActivityFormModal
          show={showActivityModal}
          onClose={() => setShowActivityModal(false)}
          onSave={handleSaveActivity}
          activityData={editingActivity}
          itineraryId={itinerary.id}
          itineraryStartDate={itinerary.startDate}
          itineraryEndDate={itinerary.endDate}
        />
      )}

      <div className={styles.floatingActions}>
        <button
          className={styles.floatingButton}
          onClick={() => scrollToSection("hero")}
          title="Về đầu trang"
        >
          <i className="ri-arrow-up-line"></i>
        </button>
      </div>

      <div className={styles.progressBar}>
        <div className={styles.progressFill}></div>
      </div>
    </div>
  );
};

export default ItineraryDetail;
