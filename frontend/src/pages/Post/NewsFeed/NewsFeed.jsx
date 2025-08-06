import React, { useState, useEffect } from "react";
import styles from "./NewsFeed.module.css";
import CreatePost from "../CreatePost/CreatePost";
import PostCard from "../PostCard/PostCard";
import { useNavigate } from "react-router-dom";

import postService from "../../../services/post";

function EditPostForm({ post, onCancel, onSubmit }) {
  const [content, setContent] = useState(post.content);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...post, content });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.editPostForm}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
      />
      <button type="submit">Lưu</button>
      <button type="button" onClick={onCancel}>
        Hủy
      </button>
    </form>
  );
}

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("userToken");

  useEffect(() => {
    if (!token) {
      navigate("/signin");
      return;
    }
    const fetchPosts = async () => {
      try {
        const data = await postService.getPosts(token);
        setPosts(data);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setError("Không thể tải bài viết. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
      return;
    }

    try {
      await postService.delete(token, postId);
      setPosts((currentPosts) =>
        currentPosts.filter((post) => post.id !== postId)
      );
      alert("Đã xóa bài viết thành công!");
    } catch (error) {
      console.error("Failed to delete post:", error);
      alert(error.message);
    }
  };

  const handleEditPost = (postId) => {
    setEditingPostId(postId);
  };

  const handleUpdatePost = async (updatedPost) => {
    try {
      const updated = await postService.update(token, updatedPost.id, {
        content: updatedPost.content,
      });

      setPosts((posts) =>
        posts.map((post) => (post.id === updated.id ? updated : post))
      );
      setEditingPostId(null);
      alert("Đã chỉnh sửa bài viết thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật bài viết:", error);
      alert(error.message || "Đã xảy ra lỗi.");
    }
  };

  const renderContent = () => {
    if (loading) {
      return <div className={styles.statusMessage}>Đang tải bài viết...</div>;
    }

    if (error) {
      return (
        <div className={`${styles.statusMessage} ${styles.errorMessage}`}>
          {error}
        </div>
      );
    }

    return (
      <>
        <div className={styles.feedList}>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isEditing={editingPostId === post.id}
              onDelete={handleDeletePost}
              onEdit={() => handleEditPost(post.id)}
              onCancelEdit={() => setEditingPostId(null)}
              onSubmitEdit={handleUpdatePost}
            />
          ))}
        </div>

        <div className={styles.loadMoreContainer}>
          <button className={styles.loadMoreButton}>Xem thêm bài đăng</button>
        </div>
      </>
    );
  };

  return (
    <div className={styles.feedPageContainer}>
      <div className={styles.contentWrapper}>
        <CreatePost />

        {renderContent()}
      </div>
    </div>
  );
}
