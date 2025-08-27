import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CreatePost.module.css";
import avatarDefault from "../../../assets/images/default_avatar.png";
import itineraryService from "../../../services/itinerary";
import postService from "../../../services/post";
import { useAuth } from "../../../context/AuthContext";
import uploadService from "../../../services/upload";
import { useNotification } from "../../../hooks/useNotification";

const CreatePost = ({ itinerary, onPostCreated, onCancel }) => {
  const [postContent, setPostContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [selectedItinerary, setSelectedItinerary] = useState(itinerary || null);
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showItineraryList, setShowItineraryList] = useState(false);
  const itineraryListRef = useRef(null);
  const [error, setError] = useState(null);
  const [uploadedResults, setUploadedResults] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { user, token } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { showNotification } = useNotification();

  const isPostButtonEnabled =
    postContent.trim() &&
    selectedFiles.length > 0 &&
    selectedItinerary &&
    !uploading;

  useEffect(() => {
    setSelectedItinerary(itinerary || null);
  }, [itinerary]);

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);

    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    setSelectedFiles((prev) => [...prev, ...files]);

    setUploading(true);
    try {
      const uploaded = await uploadService.uploadMediaFiles(files);
      const uploadedWithType = uploaded.map((item, idx) => ({
        ...item,
        type: files[idx].type,
      }));

      setUploadedResults((prev) => [...(prev || []), ...uploadedWithType]);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleAddMediaClick = () => {
    fileInputRef.current.click();
  };

  const handleRemoveFile = async (indexToRemove) => {
    const removedFile = uploadedResults[indexToRemove];

    if (removedFile.publicId) {
      try {
        await uploadService.deleteMedia(
          removedFile.publicId,
          removedFile.type.startsWith("video") ? "video" : "image"
        );
        console.log("Deleted from Cloudinary:", removedFile.publicId);
      } catch (err) {
        console.error("Failed to delete media", err);
      }
    }

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

      const postData = {
        content: postContent,
        itineraryId: selectedItinerary.id,
        mediaFiles: uploadedResults,
      };

      const createdPost = await postService.createPost(postData);
      if (onPostCreated) {
        onPostCreated(createdPost);
      }
      showNotification("Tạo bài viết thành công!", "susses");
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
    setSelectedItinerary(itinerary || null);
    setItineraries([]);
    if (onCancel) onCancel();
  };

  return (
    <div className={styles.createPostContainer}>
      {uploading && (
        <div className={styles.uploadingNotice}>
          Uploading files, please wait...
        </div>
      )}

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

      {showItineraryList && (
        <>
          {itineraries.length > 0 ? (
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
                    setShowItineraryList(false);
                  }}
                >
                  {item.title}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noItineraryMessage}>
              <i className={`ri-route-line ${styles.iconBlue}`}></i>
              <span>
                Bạn không có lịch trình công khai nào! Hãy tạo 1 lịch trình cho
                bản thân trước nhé!
              </span>
            </div>
          )}
        </>
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

            {!itinerary && (
              <button
                onClick={handleSelectItinerary}
                className={styles.actionButton}
              >
                <div className={styles.iconWrapper}>
                  <i className={`ri-route-line ${styles.iconBlue}`}></i>
                </div>
                <span className={styles.actionButtonLabel}>Itinerary</span>
              </button>
            )}
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
