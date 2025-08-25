import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import itineraryService from "../../../services/itinerary";
import uploadService from "../../../services/upload"; 
import { Plus, Edit, ArrowLeft } from "lucide-react";
import styles from "./ItineraryForm.module.css";

const ItineraryForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    destination: "",
    startDate: "",
    endDate: "",
    budget: "",
    visibility: "PRIVATE",
    coverImage: null,
    slug: "", 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isEditing) {
      const fetchItinerary = async () => {
        setLoading(true);
        try {
          const token = sessionStorage.getItem("userToken");
          if (!token) {
            navigate("/signin");
            return;
          }
          const itineraryData = await itineraryService.getItineraryById(id); 
          setFormData({
            ...itineraryData,
            startDate: itineraryData.startDate.split("T")[0],
            endDate: itineraryData.endDate.split("T")[0],
            budget: itineraryData.budget !== null ? itineraryData.budget : "",
            visibility: itineraryData.visibility,
            coverImage: itineraryData.coverImage || null,
            slug: itineraryData.slug || "", 
          });
          if (itineraryData.coverImage) {
            setCoverImagePreview(`${process.env.REACT_APP_API_BASE_URL}${itineraryData.coverImage}`);
          }
        } catch (err) {
          setError("Failed to load itinerary for editing.");
        } finally {
          setLoading(false);
        }
      };
      fetchItinerary();
    }
  }, [id, isEditing, navigate]);

  useEffect(() => {
    if (!coverImageFile) {
      if (!isEditing || !formData.coverImage) {
        setCoverImagePreview(null);
      }
      return;
    }
    const objectUrl = URL.createObjectURL(coverImageFile);
    setCoverImagePreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [coverImageFile, isEditing, formData.coverImage]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? "PUBLIC" : "PRIVATE") : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImageFile(file);
    } else {
      setCoverImageFile(null);
    }
  };

  const handleRemoveImage = () => {
    setCoverImageFile(null);
    setCoverImagePreview(null);
    setFormData((prev) => ({ ...prev, coverImage: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage("");

    let finalCoverImageUrl = formData.coverImage;

    try {
      const token = sessionStorage.getItem("userToken");
      if (!token) {
        navigate("/signin");
        return;
      }

      if (coverImageFile) {
        finalCoverImageUrl = await uploadService.uploadItineraryCover(coverImageFile);
      } else if (isEditing && !formData.coverImage) {
        finalCoverImageUrl = null;
      }

      const dataToSend = {
        title: formData.title,
        destination: formData.destination,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        budget: formData.budget !== "" ? Number(formData.budget) : null,
        visibility: formData.visibility,
        coverImage: finalCoverImageUrl,
      };

      if (isEditing) {
        const updatedItinerary = await itineraryService.updateItinerary(id, dataToSend);
        setMessage("Itinerary updated successfully!");
        setTimeout(() => navigate(`/itineraries/${updatedItinerary.slug}`), 2000);
      } else {
        const newItinerary = await itineraryService.createItinerary(dataToSend);
        setMessage("Itinerary created successfully!");
        setTimeout(() => navigate(`/itineraries/${newItinerary.slug}`), 2000);
      }
    } catch (err) {
      setError(`Error: ${err.message || "Failed to save itinerary."}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <h2 className={styles.title}>Loading Itinerary...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <button
            onClick={() => navigate(`/itineraries/${formData.slug}`)}
            className={styles.backButton}
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className={styles.title}>
            {isEditing ? "Edit Itinerary" : "Create New Itinerary"}
          </h2>
        </div>

        {message && <p className={styles.success}>{message}</p>}
        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Itinerary Name:</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="destination">Destination:</label>
            <input
              type="text"
              id="destination"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="startDate">Start Date:</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="endDate">End Date:</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="budget">Estimated Budget:</label>
            <input
              type="number"
              id="budget"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
          <div className={`${styles.formGroup} ${styles.checkboxGroup}`}>
            <input
              type="checkbox"
              id="visibility"
              name="visibility"
              checked={formData.visibility === "PUBLIC"}
              onChange={handleChange}
              className={styles.checkbox}
            />
            <label htmlFor="visibility">Make Public</label>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="coverImageUpload">Cover Photo:</label>
            <input
              type="file"
              id="coverImageUpload"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: "none" }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className={styles.uploadButton}
            >
              {coverImagePreview ? "Change Photo" : "Choose Photo"}
            </button>
            {coverImagePreview && (
              <div className={styles.imagePreviewContainer}>
                <img src={coverImagePreview} alt="Cover Preview" className={styles.imagePreview} />
                <button type="button" onClick={handleRemoveImage} className={styles.removeImageButton}>
                  &times;
                </button>
              </div>
            )}
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? (
              "Saving..."
            ) : (
              <>
                {isEditing ? (
                  <Edit size={20} className={styles.buttonIcon} />
                ) : (
                  <Plus size={20} className={styles.buttonIcon} />
                )}
                {isEditing ? "Update" : "Create"}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ItineraryForm;
