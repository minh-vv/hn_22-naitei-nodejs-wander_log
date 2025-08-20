import React, { useState, useEffect } from "react";
import styles from "./BookmarkList.module.css";
import bookmarkService from "../../services/bookmark";
import { useNavigate } from "react-router-dom";
import PostCard from "../../pages/Post/PostCard/PostCard";
import Modal from "../Modal/Modal";
import moment from "moment";
import usePostActions from "../../hooks/usePostAction";

export default function BookmarkList() {
  const [bookmarks, setBookmarks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [selectedPost, setSelectedPost] = useState(null);

  const {
    editingPostId,
    setEditingPostId,
    handleDeletePost,
    handleEditPost,
    handleUpdatePost,
  } = usePostActions([]);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const res = await bookmarkService.list();
      setBookmarks(res);
    } catch (err) {
      console.error("Lỗi khi tải bookmarks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkChange = () => {
    fetchBookmarks();
  };

  const handleDeletePostInBookmarks = (postId) => {
    setBookmarks((prev) => prev.filter((item) => item.post?.id !== postId));
  };

  const handleUpdatePostInBookmarks = (updatedPost) => {
    setBookmarks((prev) =>
      prev.map((item) =>
        item.post?.id === updatedPost.id
          ? { ...item, post: { ...item.post, ...updatedPost } }
          : item
      )
    );
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const filteredBookmarks = bookmarks.filter((item) =>
    filter === "all" ? true : item.type === filter
  );

  const handleClick = (item) => {
    if (item.type === "post") {
      if (item.post) {
        setSelectedPost(item.post);
      }
    } else {
      navigate(`/itineraries/${item.itinerary.id}`);
    }
  };

  if (loading) return <p>Đang tải dữ liệu...</p>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Danh sách đã lưu</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={styles.select}
        >
          <option value="all">Tất cả</option>
          <option value="post">Bài đăng</option>
          <option value="itinerary">Lịch trình</option>
        </select>
      </div>

      <div className={styles.list}>
        {filteredBookmarks.length === 0 ? (
          <p>Chưa có mục nào được lưu.</p>
        ) : (
          filteredBookmarks.map((item) => (
            <div
              key={item.id}
              className={styles.card}
              onClick={() => handleClick(item)}
            >
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                {item.type === "post" ? (
                  <span className={`${styles.tag} ${styles.tagPost}`}>
                    <i className="ri-article-line"></i> Bài đăng
                  </span>
                ) : (
                  <span className={`${styles.tag} ${styles.tagItinerary}`}>
                    <i className="ri-route-line"></i> Lịch trình
                  </span>
                )}
              </div>

              {item.type === "post" ? (
                <p className={styles.postContent}>{item.post.content}</p>
              ) : (
                <div className={styles.itineraryContent}>
                  <p>
                    <i className="ri-map-pin-line"></i>{" "}
                    {item.itinerary.destination}
                  </p>
                  <p>
                    <i className="ri-calendar-line"></i>{" "}
                    <span className={styles.cardDates}>
                      {moment(item.itinerary.startDate).format("DD/MM/YYYY")} -{" "}
                      {moment(item.itinerary.endDate).format("DD/MM/YYYY")}
                    </span>
                  </p>
                </div>
              )}

              <p className={styles.savedAt}>
                <i className="ri-bookmark-line"></i> Lưu ngày: {item.createdAt}
              </p>
            </div>
          ))
        )}
      </div>

      {selectedPost && (
        <Modal onClose={() => setSelectedPost(null)}>
          <PostCard
            post={selectedPost}
            onBookmarkChange={handleBookmarkChange}
            key={selectedPost.id}
            isEditing={editingPostId === selectedPost.id}
            onDelete={async (post) => {
              await handleDeletePost(post);
              handleDeletePostInBookmarks(post.id);
              setSelectedPost(null);
            }}
            onSubmitEdit={async (updatedPost) => {
              const post = await handleUpdatePost(updatedPost);
              if (post) {
                handleUpdatePostInBookmarks(post);
                setSelectedPost((prev) => ({ ...prev, ...post }));
              }
            }}
            onEdit={() => handleEditPost(selectedPost)}
            onCancelEdit={() => setEditingPostId(null)}
          />
        </Modal>
      )}
    </div>
  );
}
