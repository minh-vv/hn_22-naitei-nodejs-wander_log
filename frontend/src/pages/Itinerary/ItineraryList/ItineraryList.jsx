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
import Header from "../../../component/Header/Header";
import ItineraryModal from "../../../component/ItineraryModal/ItineraryModal"; 

const ItineraryList = () => {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItinerary, setEditingItinerary] = useState(null);

  const fetchItineraries = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem("userToken");
      if (!token) {
        navigate("/signin");
        return;
      }
      const data = await itineraryService.getAllItineraries();
      setItineraries(data);
    } catch (err) {
      setError("Không thể tải danh sách lịch trình.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItineraries();
  }, [navigate]);

  const handleDelete = async (id, e) => {
    e.stopPropagation(); 
    if (window.confirm("Bạn có chắc chắn muốn xóa lịch trình này không?")) {
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
        setError("Không thể xóa lịch trình. Vui lòng thử lại.");
      }
    }
  };

  const handleOpenCreateModal = () => {
    setEditingItinerary(null); 
    setIsModalOpen(true);
  };

  const handleOpenEditModal = async (itineraryId, e) => {
    e.stopPropagation(); 
    e.preventDefault(); 
    setLoading(true);
    try {
      const token = sessionStorage.getItem("userToken");
      if (!token) {
        navigate("/signin");
        return;
      }
      const data = await itineraryService.getItineraryById(itineraryId);
      setEditingItinerary(data);
      setIsModalOpen(true);
    } catch (err) {
      setError("Không thể tải lịch trình để chỉnh sửa.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItinerary(null);
  };

  const handleSaveSuccess = () => {
    fetchItineraries();
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || amount === "") {
      return "Không xác định";
    }
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading && !editingItinerary) {
    return <div className={styles.loading}>Đang tải...</div>;
  }

  const placeholderImage =
    "https://www.thetravelmagazine.net/wp-content/uploads/maxresdefault4.jpg";

  return (
    <div className={styles.wrapper}>
      <Header />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Lịch trình của bạn</h1>
          <button
            onClick={handleOpenCreateModal} 
            className={styles.primaryButton}
          >
            <Plus size={20} /> Tạo lịch trình mới
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {itineraries.length === 0 ? (
          <p className={styles.emptyMessage}>
            Chưa có lịch trình nào nha ní :D{" "}
          </p>
        ) : (
          <div className={styles.itineraryGrid}>
            {itineraries.map((itinerary) => (
              <div key={itinerary.id} className={styles.itineraryCard}>
                <Link to={`/itineraries/${itinerary.slug}`}>
                  <div className={styles.cardImageContainer}>
                    <img
                      src={
                        itinerary.coverImage
                          ? itinerary.coverImage
                          : placeholderImage
                      }
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
                      <span>Công khai</span>
                    </div>
                  )}
                  {itinerary.visibility === "PRIVATE" && (
                    <div className={`${styles.cardVisibility} ${styles.private}`}>
                      <Lock size={14} />
                      <span>Riêng tư</span>
                    </div>
                  )}
                  <div className={styles.actionButtons}>
                    <button
                      onClick={(e) => handleOpenEditModal(itinerary.id, e)}
                      className={`${styles.iconButton} ${styles.editButton}`}
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(itinerary.id, e)}
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

      <ItineraryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialItineraryData={editingItinerary}
        onSave={handleSaveSuccess}
      />
    </div>
  );
};

export default ItineraryList;
