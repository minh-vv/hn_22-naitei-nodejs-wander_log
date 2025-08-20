import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CreatePost.module.css";
import avatarDefault from "../../../assets/images/default_avatar.png";
import itineraryService from "../../../services/itinerary";
import postService from "../../../services/post";
import { useAuth } from "../../../context/AuthContext";

const CreatePost = ({ onPostCreated }) => {
  const [postContent, setPostContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showItineraryList, setShowItineraryList] = useState(false);
  const itineraryListRef = useRef(null);
  const [error, setError] = useState(null);

  const { user, token } = useAuth();

  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const isPostButtonEnabled =
    postContent.trim() && selectedFiles.length > 0 && selectedItinerary;

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles((prevFiles) => [...prevFiles, ...files]);

    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prevUrls) => [...prevUrls, ...newPreviewUrls]);
  };

  const handleAddMediaClick = () => {
    fileInputRef.current.click();
  };

  const handleRemoveFile = (indexToRemove) => {
    URL.revokeObjectURL(previewUrls[indexToRemove]);
    setSelectedFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove)
    );
    setPreviewUrls((prevUrls) =>
      prevUrls.filter((_, index) => index !== indexToRemove)
    );
  };

  const handlePost = async () => {
    if (!isPostButtonEnabled) return;

    try {
      if (!token) {
        navigate("/signin");
        return;
      }
      const mediaUrls = (await postService.uploadMediaFiles(selectedFiles))
        .map((url) => url.trim().replace(/^"|"$/g, ""))
        .filter((url) => url);

      const postData = {
        content: postContent,
        itineraryId: selectedItinerary.id,
        mediaUrls,
      };

      const createdPost = await postService.createPost(postData);
      if (onPostCreated) {
        onPostCreated(createdPost);
      }
      handleCancel();
    } catch (error) {
      console.error("Error posting:", error.message);
    }
  };

  const handleSelectItinerary = async () => {
    try {
      setLoading(true);
      if (!token) {
        navigate("/signin");
        return;
      }
      const data = await itineraryService.getAllItineraries();
      setItineraries(data);
      setShowItineraryList(true);
    } catch (err) {
      setError("Unable to load itinerary list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        itineraryListRef.current &&
        !itineraryListRef.current.contains(event.target)
      ) {
        setShowItineraryList(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCancel = () => {
    setPostContent("");
    setSelectedFiles([]);
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setSelectedItinerary(null);
    setItineraries([]);
  };

  return (
    <div className={styles.createPostContainer}>
      <div className={styles.contentWrapper}>
        <img
          src={user?.avatar || avatarDefault}
          alt="Your avatar"
          className={styles.avatar}
        />
        <div className={styles.inputWrapper}>
          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="Share your travel experience..."
            className={styles.postTextarea}
            rows={3}
            maxLength={500}
          />
        </div>
      </div>

      {previewUrls.length > 0 && (
        <div className={styles.previewContainer}>
          {previewUrls.map((url, index) => (
            <div key={index} className={styles.previewItem}>
              {selectedFiles[index].type.startsWith("image/") ? (
                <img src={url} alt="Preview" className={styles.previewMedia} />
              ) : (
                <video src={url} className={styles.previewMedia} controls />
              )}
              <button
                onClick={() => handleRemoveFile(index)}
                className={styles.removeButton}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedItinerary && (
        <div className={styles.itinerarySelected}>
          <i className={`ri-route-fill ${styles.iconBlue}`}></i>
          <span>
            Selected itinerary: <strong>{selectedItinerary.title}</strong>
          </span>
        </div>
      )}

      {showItineraryList && itineraries.length > 0 && (
        <div className={styles.itineraryList} ref={itineraryListRef}>
          {itineraries.map((item) => (
            <div
              key={item.id}
              className={styles.itineraryItem}
              onClick={() => {
                if (item.visibility === "PRIVATE") {
                  alert(
                    "Bạn không thể tạo bài viết với lịch trình chưa công khai"
                  );
                  return;
                }
                setSelectedItinerary(item);
                setItineraries([]);
              }}
            >
              {item.title}
            </div>
          ))}
        </div>
      )}

      <div className={styles.actionsContainer}>
        <div className={styles.actionsWrapper}>
          <div className={styles.actionButtons}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              accept="image/*,video/*"
              style={{ display: "none" }}
            />
            <button
              onClick={handleAddMediaClick}
              className={styles.actionButton}
            >
              <div className={styles.iconWrapper}>
                <i className={`ri-image-line ${styles.iconGreen}`}></i>
              </div>
              <span className={styles.actionButtonLabel}>Photo/Video</span>
            </button>

            <button
              onClick={handleSelectItinerary}
              className={styles.actionButton}
            >
              <div className={styles.iconWrapper}>
                <i className={`ri-route-line ${styles.iconBlue}`}></i>
              </div>
              <span className={styles.actionButtonLabel}>Itinerary</span>
            </button>
          </div>

          <div className={styles.postControls}>
            <span className={styles.charCount}>{postContent.length}/500</span>
            <button onClick={handleCancel} className={styles.cancelButton}>
              Cancel
            </button>
            <button
              onClick={handlePost}
              disabled={!isPostButtonEnabled}
              className={styles.postButton}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
