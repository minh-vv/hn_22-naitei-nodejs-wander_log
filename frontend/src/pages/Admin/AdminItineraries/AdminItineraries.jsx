import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./AdminItineraries.module.css";
import { FaEye, FaTrash, FaArrowLeft, FaSearch } from "react-icons/fa";
import { fetchItineraries, deleteItinerary } from "../../../services/admin";

const AdminItineraries = () => {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const getItineraries = async () => {
      try {
        const data = await fetchItineraries(searchTerm);
        setItineraries(data);
      } catch (error) {
        console.error("Failed to fetch itineraries", error);
      } finally {
        setLoading(false);
      }
    };
    getItineraries();
  }, [searchTerm]);

  const getItineraries = async () => {
    try {
      const data = await fetchItineraries();
      setItineraries(data);
    } catch (error) {
      console.error("Failed to fetch itineraries", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItinerary = async (itineraryId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this itinerary? This action is irreversible."
      )
    ) {
      return;
    }
    setDeletingId(itineraryId);
    try {
      await deleteItinerary(itineraryId);
      getItineraries();
    } catch (error) {
      console.error("Failed to delete itinerary", error);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading itineraries...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link to="/admin/dashboard" className={styles.backButton}>
          <FaArrowLeft /> Back to Dashboard
        </Link>
        <h1 className={styles.title}>Manage Itineraries</h1>
        <p className={styles.subtitle}>Admin Panel</p>
      </header>
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search itineraries by title or destination..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <FaSearch className={styles.searchIcon} />
      </div>
      <div className={styles.tableContainer}>
        <table className={styles.itineraryTable}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>User</th>
              <th>Destination</th>
              <th>Start Date</th>
              <th>Visibility</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {itineraries.map((itinerary) => (
              <tr key={itinerary.id}>
                <td>{itinerary.id}</td>
                <td>{itinerary.title}</td>
                <td>{itinerary.user.name || itinerary.user.email}</td>
                <td>{itinerary.destination}</td>
                <td>{new Date(itinerary.startDate).toLocaleDateString()}</td>
                <td>{itinerary.visibility}</td>
                <td className={styles.actions}>
                  <Link
                    to={`/admin/itineraries/${itinerary.id}`}
                    className={`${styles.actionButton} ${styles.view}`}
                  >
                    <FaEye /> View
                  </Link>
                  <button
                    className={`${styles.actionButton} ${styles.delete}`}
                    onClick={() => handleDeleteItinerary(itinerary.id)}
                    disabled={deletingId === itinerary.id}
                  >
                    <FaTrash /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminItineraries;
