import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import itineraryService from "../../../services/itinerary";
import { Calendar, DollarSign, Globe, Lock } from "lucide-react";
import moment from "moment";
import styles from "./ItineraryFeature.module.css";
import avatarDefault from "../../../assets/images/default_avatar.png";
import bookmarkService from "../../../services/bookmark";

const ItineraryFeature = () => {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        const data = await itineraryService.getFeatureItineraries();
        setItineraries(data);
      } catch (err) {
        setError("Failed to load itineraries.");
      } finally {
        setLoading(false);
      }
    };
    fetchItineraries();
  }, []);

  const [bookmarks, setBookmarks] = useState({});

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const statusPromises = itineraries.map(async (itinerary) => {
          const res = await bookmarkService.check("ITINERARY", itinerary.id);
          return {
            id: itinerary.id,
            isBookmarked: res.isBookmarked,
            bookmarkId: res.bookmarkId || null,
          };
        });

        const results = await Promise.all(statusPromises);
        const bookmarkMap = results.reduce((acc, cur) => {
          acc[cur.id] = {
            isBookmarked: cur.isBookmarked,
            bookmarkId: cur.bookmarkId,
          };
          return acc;
        }, {});
        setBookmarks(bookmarkMap);
      } catch (err) {
        console.error("Error fetching bookmark status:", err);
      }
    };

    if (itineraries.length > 0) {
      fetchBookmarks();
    }
  }, [itineraries]);

  const handleBookmark = async (itineraryId) => {
    try {
      const current = bookmarks[itineraryId] || {};
      if (current.isBookmarked) {
        await bookmarkService.remove(current.bookmarkId);
        setBookmarks((prev) => ({
          ...prev,
          [itineraryId]: { isBookmarked: false, bookmarkId: null },
        }));
      } else {
        const newBookmark = await bookmarkService.create({
          type: "ITINERARY",
          itemId: itineraryId,
        });
        setBookmarks((prev) => ({
          ...prev,
          [itineraryId]: { isBookmarked: true, bookmarkId: newBookmark.id },
        }));
      }
    } catch (error) {
      console.error("Error handling bookmark:", error);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) {
      return "Not specified";
    }
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div>
      {error && <p className={styles.error}>{error}</p>}

      {itineraries.length === 0 ? (
        <p className={styles.emptyMessage}>No featured itineraries yet.</p>
      ) : (
        <div className={styles.itineraryGrid}>
          {itineraries.map((itinerary) => (
            <div
              key={itinerary.id}
              className={styles.itineraryCard}
              onClick={() => navigate(`/itineraries/${itinerary.id}`)}
            >
              <h2 className={styles.cardTitle}>{itinerary.title}</h2>
              <button
                className={styles.bookmarkButton}
                onClick={(e) => {
                  e.stopPropagation();
                  handleBookmark(itinerary.id);
                }}
              >
                <div className={styles.iconWrapper}>
                  {bookmarks[itinerary.id]?.isBookmarked ? (
                    <i
                      className="ri-bookmark-fill"
                      style={{ color: "gold" }}
                    ></i>
                  ) : (
                    <i className="ri-bookmark-line"></i>
                  )}
                </div>
              </button>

              <div className={styles.cardInfo}>
                <div className={styles.cardItem}>
                  <Calendar size={16} className={styles.itemIcon} />
                  <span>
                    {moment(itinerary.startDate).format("DD/MM/YYYY")} -{" "}
                    {moment(itinerary.endDate).format("DD/MM/YYYY")}
                  </span>
                </div>
                <div className={styles.cardItem}>
                  <DollarSign size={16} className={styles.itemIcon} />
                  <span className={styles.cardBudget}>
                    {formatCurrency(itinerary.budget)}
                  </span>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.userInfo}>
                  <img
                    src={itinerary.user.avatar || avatarDefault}
                    alt={itinerary.user.name}
                    className={styles.userAvatar}
                  />
                  <span className={styles.userName}>{itinerary.user.name}</span>
                </div>
                <div className={styles.stats}>
                  <i className={`ri-heart-fill ${styles.likeIcon}`}></i>
                  <span>{itinerary.totalLikes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ItineraryFeature;
