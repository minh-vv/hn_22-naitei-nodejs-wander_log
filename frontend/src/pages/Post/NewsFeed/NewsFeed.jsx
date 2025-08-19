import React, { useState, useEffect } from "react";
import styles from "./NewsFeed.module.css";
import CreatePost from "../CreatePost/CreatePost";
import PostCard from "../PostCard/PostCard";
import { useNavigate } from "react-router-dom";

import postService from "../../../services/post";
import { useAuth } from "../../../context/AuthContext";
import Header from "../../../component/Header/Header";
import usePostActions from "../../../hooks/usePostAction";

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
      <button type="submit">Save</button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </form>
  );
}

export default function FeedPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { token } = useAuth();

  const {
    posts,
    setPosts,
    editingPostId,
    setEditingPostId,
    handleDeletePost,
    handleEditPost,
    handleUpdatePost,
  } = usePostActions([]);

  useEffect(() => {
    if (!token) {
      navigate("/signin");
      return;
    }
    const fetchPosts = async () => {
      try {
        const data = await postService.getNewsFeed();
        setPosts(data);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setError("Unable to load posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [token, navigate, setPosts]);

  const renderContent = () => {
    if (loading) {
      return <div className={styles.statusMessage}>Loading posts...</div>;
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
              onEdit={() => handleEditPost(post)}
              onCancelEdit={() => setEditingPostId(null)}
              onSubmitEdit={handleUpdatePost}
            />
          ))}
        </div>

        <div className={styles.loadMoreContainer}>
          <button className={styles.loadMoreButton}>Load more posts</button>
        </div>
      </>
    );
  };

  return (
    <div className={styles.feedPageContainer}>
      <Header />
      <div className={styles.contentWrapper}>
        <CreatePost
          onPostCreated={(newPost) => setPosts((prev) => [newPost, ...prev])}
        />
        {renderContent()}
      </div>
    </div>
  );
}
