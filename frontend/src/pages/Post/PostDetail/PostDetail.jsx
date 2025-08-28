import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './PostDetail.module.css';
import PostCard from '../PostCard/PostCard';
import Header from '../../../component/Header/Header';
import postService from '../../../services/post';
import { useAuth } from '../../../context/AuthContext';
import usePostActions from '../../../hooks/usePostAction';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      navigate('/signin');
      return;
    }

    const fetchPost = async () => {
      try {
        setLoading(true);
        const post = await postService.getPostById(id);
        setPosts([post]);
      } catch (err) {
        console.error('Failed to fetch post:', err);
        setError('Không thể tải bài đăng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, token, navigate, setPosts]);

  if (loading) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.content}>
          <div className={styles.loadingMessage}>Đang tải bài đăng...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.content}>
          <div className={styles.errorMessage}>
            {error}
            <button 
              className={styles.backButton}
              onClick={() => navigate('/posts/feed')}
            >
              Quay lại News Feed
            </button>
          </div>
        </div>
      </div>
    );
  }

  const post = posts[0];

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
        <div className={styles.postContainer}>
          <button 
            className={styles.backButton}
            onClick={() => navigate('/posts/feed')}
          >
            ← Quay lại News Feed
          </button>
          
          {post && (
            <PostCard
              key={post.id}
              post={post}
              isEditing={editingPostId === post.id}
              onDelete={handleDeletePost}
              onEdit={() => handleEditPost(post)}
              onCancelEdit={() => setEditingPostId(null)}
              onSubmitEdit={handleUpdatePost}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
