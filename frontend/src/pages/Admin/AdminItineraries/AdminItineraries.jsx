import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./AdminItineraries.module.css";
import {
  MapPin,
  Eye,
  Trash2,
  ArrowLeft,
  Search,
  Heart,
  Globe,
  Lock,
} from "lucide-react";
import { fetchItineraries, deleteItinerary, fetchDashboardStats } from "../../../services/admin";

const AdminItineraries = () => {
  const [itineraries, setItineraries] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const getData = async () => {
      try {
        const [itinerariesData, statsData] = await Promise.all([
          fetchItineraries(searchTerm),
          fetchDashboardStats(),
        ]);
        setItineraries(itinerariesData);
        setDashboardStats(statsData);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [searchTerm]);

  const handleDeleteItinerary = async (itineraryId) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa lịch trình này? Hành động này không thể hoàn tác."
      )
    ) {
      return;
    }
    setDeletingId(itineraryId);
    try {
      await deleteItinerary(itineraryId);
      const [itinerariesData, statsData] = await Promise.all([
        fetchItineraries(searchTerm),
        fetchDashboardStats(),
      ]);
      setItineraries(itinerariesData);
      setDashboardStats(statsData);
    } catch (error) {
      console.error("Failed to delete itinerary", error);
    } finally {
      setDeletingId(null);
    }
  };

const LoadingHeart = () => (
    <div className={styles.loadingContainer}>
        <div className={styles.loadingHeart}>
            <Heart className={styles.heartIcon} />
        </div>
        <p>Loading itinerary</p>
    </div>
);

  if (loading) {
    return <LoadingHeart />;
  }


  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link to="/admin/dashboard" className={styles.backButton}>
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className={styles.title}>Manage Itineraries</h1>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <MapPin size={40} className={styles.statIconTotal} />
          <div className={styles.statContent}>
            <span className={styles.statValue}>{dashboardStats?.totalItineraries?.toLocaleString() || 0}</span>
            <span className={styles.statLabel}>Total Itineraries</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <Globe size={40} className={styles.statIconPublic} />
          <div className={styles.statContent}>
            <span className={styles.statValue}>{dashboardStats?.publicItineraries?.toLocaleString() || 0}</span>
            <span className={styles.statLabel}>Public Itineraries</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <Lock size={40} className={styles.statIconPrivate} />
          <div className={styles.statContent}>
            <span className={styles.statValue}>{dashboardStats?.privateItineraries?.toLocaleString() || 0}</span>
            <span className={styles.statLabel}>Private Itineraries</span>
          </div>
        </div>
      </div>

      <div className={styles.searchAndTableContainer}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search itineraries by title or destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <Search className={styles.searchIcon} />
        </div>
        <div className={styles.tableContainer}>
          <table className={styles.itineraryTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>User</th>
                <th>Destination</th>
                <th>Visibility</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {itineraries.length > 0 ? (
                itineraries.map((itinerary) => (
                  <tr key={itinerary.id}>
                    <td>{itinerary.id.substring(0, 8)}...</td>
                    <td>{itinerary.title}</td>
                    <td>{itinerary.user.name || itinerary.user.email}</td>
                    <td>{itinerary.destination}</td>
                    <td>
                      <span className={itinerary.visibility === 'PUBLIC' ? styles.statusPublic : styles.statusPrivate}>
                        {itinerary.visibility}
                      </span>
                    </td>
                    <td className={styles.actions}>
                      <Link
                        to={`/admin/itineraries/${itinerary.id}`}
                        className={`${styles.actionButton} ${styles.view}`}
                      >
                        <Eye size={16} />
                      </Link>
                      <button
                        className={`${styles.actionButton} ${styles.delete}`}
                        onClick={() => handleDeleteItinerary(itinerary.id)}
                        disabled={deletingId === itinerary.id}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className={styles.noData}>No itineraries found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminItineraries;
