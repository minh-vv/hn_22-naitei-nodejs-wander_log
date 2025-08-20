import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./PostCard.module.css";
import { Link } from "react-router-dom";
import avatarDefault from "../../../assets/images/default_avatar.png";
import TimeAgo from "../../../component/TimeAgo";
import postService from "../../../services/post";
import bookmarkService from "../../../services/bookmark";

const PostCard = ({
  post,
  onEdit,
  onDelete,
  isEditing,
  onCancelEdit,
  onSubmitEdit,
  onBookmarkChange,
}) => {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likeCount);
  const [isLiking, setIsLiking] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [editedContent, setEditedContent] = useState(post.content);
  const [images, setImages] = useState(post.media || []);
  const [newImages, setNewImages] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState([]);

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentCount, setCommentCount] = useState(post.commentsCount || 0);
  const navigate = useNavigate();

  const menuRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    setIsLiked(post.isLiked);
    setLikesCount(post.likeCount);
    setEditedContent(post.content);
    setImages(post.media || []);
    setCommentCount(post.commentsCount || 0);
  }, [post]);

  useEffect(() => {
    if (isEditing) setEditedContent(post.content);
  }, [isEditing, post.content]);

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments]);

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const res = await postService.getComments(post.id);
      setComments(res.comments || []);
      setCommentCount(res.comments?.length || 0);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      await postService.createComment(post.id, { body: commentText });
      setCommentText("");
      const updated = await postService.getComments(post.id);
      setComments(updated.comments || []);
      setCommentCount(updated.comments?.length || 0);
    } catch (error) {
      console.error("Error creating comment:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;
    try {
      await postService.deleteComment(post.id, commentId);
      const updated = comments.filter((c) => c.id !== commentId);
      setComments(updated);
      setCommentCount(updated.length);
    } catch (error) {
      alert(error);
      console.error("Error deleting comment:", error);
    }
  };

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState(null);

  useEffect(() => {
    const fetchBookmarkStatus = async () => {
      try {
        const res = await bookmarkService.check("POST", post.id);
        setIsBookmarked(res.isBookmarked);
        if (res.bookmarkId) {
          setBookmarkId(res.bookmarkId);
        }
      } catch (error) {
        console.error("Error checking bookmark status:", error);
      }
    };
    fetchBookmarkStatus();
  }, [post.id]);

  const handleBookmark = async () => {
    try {
      if (isBookmarked) {
        await bookmarkService.remove(bookmarkId);
        setIsBookmarked(false);
        setBookmarkId(null);
      } else {
        const newBookmark = await bookmarkService.create({
          type: "POST",
          itemId: post.id,
        });
        setIsBookmarked(true);
        setBookmarkId(newBookmark.id);
      }
      onBookmarkChange?.();
    } catch (error) {
      console.error("Error handling bookmark:", error);
    }
  };

  const handleEditClick = () => {
    onEdit(post);
    setIsMenuOpen(false);
  };

  const handleDeleteClick = () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      onDelete(post);
    }
    setIsMenuOpen(false);
  };

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    const prevIsLiked = isLiked;
    const prevLikesCount = likesCount;

    try {
      const res = await postService.likePost(post.id);
      if (typeof res?.updatedPost?.likeCount === "number") {
        setLikesCount(res.updatedPost.likeCount);
      }
      if (typeof res?.action === "string") {
        setIsLiked(res.action === "like");
      }
    } catch (error) {
      console.error("Error liking post:", error);
      setIsLiked(prevIsLiked);
      setLikesCount(prevLikesCount);
    } finally {
      setIsLiking(false);
    }
  };

  useEffect(() => {
    if (isEditing) {
      setEditedContent(post.content);
      setImages(post.media || []);
      setNewImages([]);
      setRemovedImageIds([]);
    }
  }, [isEditing, post]);

  const handleRemoveImage = useCallback((id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    setRemovedImageIds((prev) => [...prev, id]);
  }, []);

  const handleRemoveNewImage = useCallback((index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleAddImages = (e) => {
    const files = Array.from(e.target.files);
    const mapped = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setNewImages((prev) => [...prev, ...mapped]);
  };

  const handleSaveEdit = async () => {
    if (editedContent.trim() === "") {
      alert("Content cannot be empty.");
      return;
    }

    try {
      const mediaUrls = (
        await postService.uploadMediaFiles(newImages.map((img) => img.file))
      )
        .map((url) => url.trim().replace(/^"|"$/g, ""))
        .filter((url) => url);

      onSubmitEdit({
        id: post.id,
        content: editedContent,
        mediaUrlsToAdd: mediaUrls,
        mediaIdsToDelete: removedImageIds,
      });
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("Upload images failed!");
    }
  };

  const handleImageClick = (index) => {
    setCurrentImageIndex(index);
    setIsLightboxOpen(true);
  };

  const handleCloseLightbox = () => setIsLightboxOpen(false);

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % post.media.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex(
      (prevIndex) => (prevIndex - 1 + post.media.length) % post.media.length
    );
  };

  const stopPropagation = (e) => e.stopPropagation();

  const renderMedia = () => {
    if (!post.media || post.media.length === 0) return null;

    const isVideo = (url) => /\.(mp4|mov|avi|mkv|wmv|flv|webm)$/i.test(url);

    if (post.media.length === 1) {
      const media = post.media[0];
      return isVideo(media.url) ? (
        <video
          src={media.url}
          controls
          className={styles.imageSingle}
          onClick={() => handleImageClick(0)}
        />
      ) : (
        <img
          src={media.url}
          alt="Post media"
          className={styles.imageSingle}
          onClick={() => handleImageClick(0)}
        />
      );
    }

    if (post.media.length === 2) {
      return (
        <div className={styles.imageGridTwo}>
          {post.media.map((media, index) =>
            isVideo(media.url) ? (
              <video
                key={index}
                src={media.url}
                controls
                className={styles.imageGridItem}
                onClick={() => handleImageClick(index)}
              />
            ) : (
              <img
                key={index}
                src={media.url}
                alt={`Post image ${index + 1}`}
                className={styles.imageGridItem}
                onClick={() => handleImageClick(index)}
              />
            )
          )}
        </div>
      );
    }

    // nhiều hơn 2
    return (
      <div className={styles.imageGridTwo}>
        {isVideo(post.media[0].url) ? (
          <video
            src={post.media[0].url}
            controls
            className={styles.imageGridItem}
            onClick={() => handleImageClick(0)}
          />
        ) : (
          <img
            src={post.media[0].url}
            alt="Post image 1"
            className={styles.imageGridItem}
            onClick={() => handleImageClick(0)}
          />
        )}

        <div
          className={styles.imageGridMore}
          onClick={() => handleImageClick(1)}
        >
          {isVideo(post.media[1].url) ? (
            <video
              src={post.media[1].url}
              controls
              className={styles.imageGridItem}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img
              src={post.media[1].url}
              alt="More post images"
              className={styles.imageGridItem}
            />
          )}
          <div className={styles.imageOverlay}>
            <span>+{post.media.length - 1}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.postCard}>
      <div className={styles.header}>
        <div className={styles.authorInfo}>
          <img
            src={post?.user?.avatar || avatarDefault}
            alt={post.user.name}
            className={styles.avatar}
            onClick={() => navigate(`/profile/${post.user.id}`)}
          />
          <div>
            <div className={styles.authorNameWrapper}>
              <div className={styles.authorName}>{post.user.name}</div>
            </div>
            <div className={styles.metaInfo}>
              <TimeAgo timestamp={post.createdAt} />
            </div>
          </div>
        </div>
        <div ref={menuRef} className={styles.moreButtonContainer}>
          <button className={styles.bookmarkButton} onClick={handleBookmark}>
            <div className={styles.iconWrapper}>
              {isBookmarked ? (
                <i className="ri-bookmark-fill" style={{ color: "gold" }}></i>
              ) : (
                <i className="ri-bookmark-line"></i>
              )}
            </div>
          </button>
          <button
            className={styles.moreButton}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className={styles.iconWrapper}>
              <i className="ri-more-line"></i>
            </div>
          </button>
          {isMenuOpen && (
            <div className={styles.optionsPopup}>
              <ul>
                <li onClick={handleEditClick}>
                  <i className="ri-pencil-line"></i>
                  <span>Edit</span>
                </li>
                <li onClick={handleDeleteClick} className={styles.deleteOption}>
                  <i className="ri-delete-bin-line"></i>
                  <span>Delete</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {post.itinerary && (
        <div className={styles.tripSection}>
          <Link
            to={`/itineraries/${post.itinerary.id}`}
            className={styles.tripLink}
          >
            <div className={styles.tripContent}>
              <div className={styles.iconWrapperSmall}>
                <i className={`ri-route-line ${styles.tripIcon}`}></i>
              </div>
              <span className={styles.tripTitle}>{post.itinerary.title}</span>
              <span className={styles.tripBudget}>
                {post.itinerary.budget} VND
              </span>
              <div className={styles.tripArrow}>
                <i className="ri-arrow-right-line"></i>
              </div>
            </div>
          </Link>
        </div>
      )}

      <div className={styles.contentSection}>
        {isEditing ? (
          <>
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={4}
              className={styles.editTextarea}
            />
            <div className={styles.editImages}>
              {images.map((img) => (
                <div key={img.id} className={styles.editImageItem}>
                  {/\.(mp4|mov|avi|mkv|wmv|flv|webm)$/i.test(img.url) ? (
                    <video
                      src={img.url}
                      className={styles.editImagePreview}
                      muted
                      loop
                    />
                  ) : (
                    <img
                      src={img.url}
                      alt=""
                      className={styles.editImagePreview}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(img.id)}
                    className={styles.removeImageButton}
                  >
                    <div className={styles.iconWrapper}>
                      <i className="ri-close-line"></i>
                    </div>
                  </button>
                </div>
              ))}

              {newImages.map((img, index) => (
                <div key={`new-${index}`} className={styles.editImageItem}>
                  {img.file?.type?.startsWith("video/") ? (
                    <video
                      src={img.preview}
                      className={styles.editImagePreview}
                      muted
                      loop
                    />
                  ) : (
                    <img
                      src={img.preview}
                      alt=""
                      className={styles.editImagePreview}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveNewImage(index)}
                    className={styles.removeImageButton}
                  >
                    <div className={styles.iconWrapper}>
                      <i className="ri-close-line"></i>
                    </div>
                  </button>
                </div>
              ))}

              <button
                type="button"
                className={styles.addMediaTile}
                onClick={() =>
                  fileInputRef.current && fileInputRef.current.click()
                }
              >
                <div className={styles.addMediaIcon}>+</div>
                <div className={styles.addMediaText}>Thêm ảnh/video</div>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleAddImages}
              className={styles.hiddenFileInput}
            />

            <div className={styles.editActions}>
              <button
                className={`${styles.editButton} ${styles.saveButton}`}
                onClick={handleSaveEdit}
              >
                Save
              </button>
              <button
                className={`${styles.editButton} ${styles.cancelButton}`}
                onClick={onCancelEdit}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <p className={styles.postContent}>{post.content}</p>
        )}
      </div>

      {!isEditing && post.media && post.media.length > 0 && (
        <div className={styles.imagesSection}>{renderMedia()}</div>
      )}

      <div className={styles.statsSection}>
        <div className={styles.statsWrapper}>
          <div className={styles.statsLeft}>
            <span className={styles.likesCount}>
              <div className={styles.iconWrapperSmall}>
                <i className={`ri-heart-fill ${styles.likeIcon}`}></i>
              </div>
              <span>{likesCount}</span>
            </span>
            <button
              onClick={() => setShowComments(!showComments)}
              className={styles.statsButton}
            >
              {commentCount} comments
            </button>
          </div>
        </div>
      </div>

      <div className={styles.actionsSection}>
        <div className={styles.actionsWrapper}>
          <button
            onClick={handleLike}
            className={`${styles.actionButton} ${isLiked ? styles.liked : ""}`}
          >
            <div className={styles.iconWrapper}>
              <i className={isLiked ? "ri-heart-fill" : "ri-heart-line"}></i>
            </div>
            <span>Like</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className={styles.actionButton}
          >
            <div className={styles.iconWrapper}>
              <i className="ri-chat-1-line"></i>
            </div>
            <span>Comment</span>
          </button>
        </div>
      </div>

      {showComments && (
        <div className={styles.commentsSection}>
          <div className={styles.commentInputWrapper}>
            <img
              src={avatarDefault}
              alt="Your avatar"
              className={styles.commentAvatar}
            />
            <div className={styles.commentInputContainer}>
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className={styles.commentInput}
                maxLength={200}
              />
              <button
                onClick={handleComment}
                disabled={!commentText.trim()}
                className={styles.sendCommentButton}
              >
                <div className={styles.iconWrapperSmall}>
                  <i className="ri-send-plane-line"></i>
                </div>
              </button>
            </div>
          </div>

          <div className={styles.commentsList}>
            {loadingComments ? (
              <p>Loading comments...</p>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className={styles.commentItem}>
                  <img
                    src={comment.user?.avatar || avatarDefault}
                    alt={comment.user?.name || "User"}
                    className={styles.commentAvatar}
                  />
                  <div className={styles.commentContent}>
                    <div className={styles.commentBubble}>
                      <p className={styles.commenterName}>
                        {comment.user?.name}
                      </p>
                      <p className={styles.commentText}>{comment.body}</p>
                    </div>
                    <div className={styles.commentActions}>
                      <TimeAgo timestamp={comment.createdAt} />
                      <button onClick={() => handleDeleteComment(comment.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No comments yet.</p>
            )}
          </div>
        </div>
      )}

      {isLightboxOpen && post.media && post.media.length > 0 && (
        <div className={styles.lightboxOverlay} onClick={handleCloseLightbox}>
          <button
            className={`${styles.lightboxButton} ${styles.closeButton}`}
            onClick={handleCloseLightbox}
          >
            <i className="ri-close-line"></i>
          </button>
          <button
            className={`${styles.lightboxButton} ${styles.prevButton}`}
            onClick={(e) => {
              stopPropagation(e);
              handlePrevImage();
            }}
          >
            <i className="ri-arrow-left-s-line"></i>
          </button>
          <div className={styles.lightboxContent} onClick={stopPropagation}>
            {/\.(mp4|mov|avi|mkv|wmv|flv|webm)$/i.test(
              post.media[currentImageIndex].url
            ) ? (
              <video
                src={post.media[currentImageIndex].url}
                controls
                className={styles.lightboxVideo}
                autoPlay
              />
            ) : (
              <img
                src={post.media[currentImageIndex].url}
                alt={`View ${currentImageIndex + 1}`}
                className={styles.lightboxImage}
              />
            )}
            <div className={styles.lightboxCounter}>
              {currentImageIndex + 1} / {post.media.length}
            </div>
          </div>
          <button
            className={`${styles.lightboxButton} ${styles.nextButton}`}
            onClick={(e) => {
              stopPropagation(e);
              handleNextImage();
            }}
          >
            <i className="ri-arrow-right-s-line"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default PostCard;
