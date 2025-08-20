import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

import itineraryService from "../../../services/itinerary";
import activityService from "../../../services/activity";
import ActivityFormModal from "../../Activity/ActivityFormModal/ActivityFormModal";

import styles from "./ItineraryDetail.module.css";

const ItineraryDetail = () => {
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  const navigate = useNavigate();
  const { id } = useParams();

  const { user: currentUser } = useAuth();

  const fetchItineraryData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem("userToken");
      if (!token) {
        navigate("/signin");
        return;
      }
      const data = await itineraryService.getItineraryById(id);
      setItinerary(data);
    } catch (err) {
      setError("Unable to load itinerary details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItineraryData();
  }, [id, navigate]);

  const isOwner = itinerary && currentUser && itinerary.user.id === currentUser.id;

  const handleDeleteItinerary = async () => {
    if (window.confirm("Are you sure you want to delete this itinerary?")) {
      try {
        await itineraryService.deleteItinerary(id);
        navigate("/itineraries");
      } catch (err) {
        setError("Unable to delete itinerary. Please try again.");
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
      } else {
        await activityService.createActivity(activityData);
      }
      await fetchItineraryData();
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteActivityClick = async (activityId) => {
    if (window.confirm("Are you sure you want to delete this activity?")) {
      try {
        await activityService.deleteActivity(activityId);
        await fetchItineraryData();
      } catch (err) {
        setError(err.message || "Unable to delete activity. Please try again.");
      }
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

  const groupedActivities = itinerary ? groupActivitiesByDate(itinerary.activities) : {};
  const sortedDates = Object.keys(groupedActivities).sort();

  const formatDate = (dateString, formatType) => {
    const date = new Date(dateString);
    if (formatType === "DD/MM/YYYY") {
      return date.toLocaleDateString("en-GB");
    } else if (formatType === "dddd, DD MMMM YYYY") {
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "2-digit",
      };
      return new Intl.DateTimeFormat("en-GB", options).format(date);
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

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.loading}>Loading itinerary...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.error}>{error}</div>
        <button
          onClick={() => navigate("/itineraries")}
          className={styles.backButtonError}
        >
          Back
        </button>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.message}>Itinerary not found.</div>
        <button
          onClick={() => navigate("/itineraries")}
          className={styles.backButtonError}
        >
          Back
        </button>
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

        <div className={styles.heroSection}>
          <div className={styles.heroImageContainer}>
            <img
              src={
                itinerary.coverImage ||
                "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              }
              alt={itinerary.title}
              className={styles.heroImage}
            />
            <div className={styles.heroOverlay}></div>
            <div className={styles.heroContent}>
              <div className={styles.heroDetails}>
                <span className={styles.heroDetailItem}>
                  <i className="ri-map-pin-line"></i>
                  {itinerary.destination || "Unknown"}
                </span>
                <span className={styles.heroDetailItem}>
                  <i className="ri-time-line"></i>
                  {itinerary.startDate && itinerary.endDate
                    ? `${
                        (new Date(itinerary.endDate) -
                          new Date(itinerary.startDate)) /
                          (1000 * 60 * 60 * 24) +
                        1
                      } days`
                    : "Unknown"}
                </span>
                <span className={styles.heroDetailItem}>
                  <i className="ri-money-dollar-circle-line"></i>
                  {itinerary.budget
                    ? `${itinerary.budget.toLocaleString("en-GB")} VND`
                    : "Unknown"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.authorSection}>
          <div className={styles.authorInfo}>
            <img
              src={
                itinerary.user?.avatar ||
                "https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20a%20young%20Asian%20female%20traveler%20with%20a%20warm%20confident%20smile%2C%20wearing%20casual%20modern%20clothing%2C%20clean%20studio%20background%20with%20soft%20professional%20lighting&width=50&height=50&seq=author-profile&orientation=squarish"
              }
              alt={itinerary.user?.name || "Author"}
              className={styles.authorAvatar}
            />
            <div>
              <div className={styles.authorNameContainer}>
                <h3 className={styles.authorName}>
                  {itinerary.user?.name || "Anonymous"}
                </h3>
                {itinerary.user?.verified && (
                  <div className={styles.verifiedIcon}>
                    <i className="ri-verified-badge-fill"></i>
                  </div>
                )}
              </div>
              <p className={styles.createdAt}>
                Created:{" "}
                {itinerary.createdAt
                  ? new Date(itinerary.createdAt).toLocaleDateString()
                  : "Unknown"}
              </p>
            </div>
          </div>

          <div className={styles.actionButtons}>
            {isOwner && (
              <button onClick={() => {}} className={styles.createPostButton}>
                <i className="ri-add-circle-line"></i>
                <span>Create Post</span>
              </button>
            )}
            <button onClick={() => {}} className={`${styles.likeButton} `}>
              <i className="ri-heart-line"></i>
              <span>123</span>
            </button>

            <button onClick={() => {}} className={styles.shareButton}>
              <i className="ri-share-line"></i>
              <span>Share</span>
            </button>
          </div>
        </div>

        <div className={styles.descriptionContainer}>
          <p className={styles.description}>{itinerary.description}</p>
        </div>

        {isOwner && (
          <div className={styles.actionButtonsRow}>
            <button
              onClick={handleAddActivityClick}
              className={styles.actionButton}
            >
              <i className="ri-add-circle-line"></i>
              <span>Add Activity</span>
            </button>
            <button
              onClick={() => navigate(`/itineraries/edit/${itinerary.id}`)}
              className={`${styles.actionButton} ${styles.editActionButton}`}
            >
              <i className="ri-edit-line"></i>
              Edit
            </button>
            <button
              onClick={handleDeleteItinerary}
              className={`${styles.actionButton} ${styles.deleteActionButton}`}
            >
              <i className="ri-delete-bin-line"></i>
              Delete
            </button>
          </div>
        )}

        <div className={styles.itineraryDays}>
          {sortedDates.length === 0 ? (
            <div className={styles.emptyActivities}>
              <p>No activities planned for this itinerary.</p>
            </div>
          ) : (
            sortedDates.map((dateKey) => (
              <div key={dateKey} className={styles.dayCard}>
                <div className={styles.dayHeader}>
                  <div className={styles.dayNumber}>
                    {calculateDayNumber(dateKey)}
                  </div>
                  <div>
                    <h2 className={styles.dayTitle}>
                      Day {calculateDayNumber(dateKey)}
                    </h2>
                    <p className={styles.dayDate}>
                      {formatDate(dateKey, "dddd, DD MMMM YYYY")}
                    </p>
                  </div>
                </div>

                <div className={styles.activitiesList}>
                  {groupedActivities[dateKey].map((activity) => (
                    <div key={activity.id} className={styles.activityItem}>
                      <div className={styles.activityTime}>
                        {activity.startTime}
                      </div>
                      <div className={styles.activityContent}>
                        <div className={styles.activityHeader}>
                          <h4 className={styles.activityName}>
                            {activity.name}
                          </h4>
                          {isOwner && (
                            <div className={styles.activityControls}>
                              <button
                                onClick={() => handleEditActivityClick(activity)}
                                className={styles.editActivityButton}
                                title="Edit activity"
                              >
                                <i className="ri-edit-line"></i>
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteActivityClick(activity.id)
                                }
                                className={styles.deleteActivityButton}
                                title="Delete activity"
                              >
                                <i className="ri-delete-bin-line"></i>
                              </button>
                            </div>
                          )}
                        </div>
                        <p className={styles.activityDescription}>
                          {activity.description}
                        </p>
                        <div className={styles.activityDetails}>
                          <div className={styles.activityLocation}>
                            <i className="ri-map-pin-line"></i>
                            <span>{activity.location}</span>
                          </div>
                          <span className={styles.activityCost}>
                            {activity.cost
                              ? `${activity.cost.toLocaleString("en-GB")} VND`
                              : "Unknown"}
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
    </div>
  );
};

export default ItineraryDetail;
