import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import itineraryService from "../../../services/itinerary";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  Globe,
  Lock,
} from "lucide-react";
import moment from "moment";
import styles from "./ItineraryList.module.css";

const ItineraryList = () => {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        const token = sessionStorage.getItem("userToken");
        if (!token) {
          navigate("/signin");
          return;
        }
        const data = await itineraryService.getAllItineraries();
        setItineraries(data);
      } catch (err) {
        setError("Failed to load itineraries.");
      } finally {
        setLoading(false);
      }
    };
    fetchItineraries();
  }, [navigate]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this itinerary?")) {
      try {
        const token = sessionStorage.getItem("userToken");
        if (!token) {
          navigate("/signin");
          return;
        }
        await itineraryService.deleteItinerary(id);
        setItineraries((prev) =>
          prev.filter((itinerary) => itinerary.id !== id)
        );
      } catch (err) {
        setError("Failed to delete itinerary. Please try again.");
      }
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

  const placeholderImage = "https://www.thetravelmagazine.net/wp-content/uploads/maxresdefault4.jpg";

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Itineraries</h1>
          <button
            onClick={() => navigate("/itineraries/new")}
            className={styles.primaryButton}
          >
            <Plus size={20} /> New Itinerary
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {itineraries.length === 0 ? (
          <p className={styles.emptyMessage}>You have no itineraries yet.</p>
        ) : (
          <div className={styles.itineraryGrid}>
            {itineraries.map((itinerary) => (
              <div
                key={itinerary.id}
                className={styles.itineraryCard}
              >
                <Link to={`/itineraries/${itinerary.slug}`}>
                  <div className={styles.cardImageContainer}>
                    <img 
                      src={itinerary.coverImage ? `${process.env.REACT_APP_API_BASE_URL}${itinerary.coverImage}` : placeholderImage}
                      alt={itinerary.title}
                      className={styles.cardImage}
                    />
                  </div>
                  <div className={styles.cardContent}>
                    <h2 className={styles.cardTitle}>{itinerary.title}</h2>
                    <div className={styles.cardInfo}>
                      <div className={styles.cardItem}>
                        <Calendar size={16} className={styles.itemIcon} />
                        <span className={styles.cardDates}>
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
                  </div>
                </Link>
                <div className={styles.cardActions}>
                  {itinerary.visibility === "PUBLIC" && (
                    <div className={styles.cardVisibility}>
                      <Globe size={14} />
                      <span>Public</span>
                    </div>
                  )}
                  {itinerary.visibility === "PRIVATE" && (
                    <div className={`${styles.cardVisibility} ${styles.private}`}>
                      <Lock size={14} />
                      <span>Private</span>
                    </div>
                  )}
                  <div className={styles.actionButtons}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/itineraries/edit/${itinerary.id}`);
                      }}
                      className={`${styles.iconButton} ${styles.editButton}`}
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(itinerary.id);
                      }}
                      className={`${styles.iconButton} ${styles.deleteButton}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ItineraryList;
