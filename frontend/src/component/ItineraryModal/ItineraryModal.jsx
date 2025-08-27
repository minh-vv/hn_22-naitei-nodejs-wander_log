import React from "react";
import styles from "./ItineraryModal.module.css";
import ItineraryForm from "../../pages/Itinerary/ItineraryForm/ItineraryForm"; 

const ItineraryModal = ({ isOpen, onClose, initialItineraryData }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()} 
      >
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>
        <ItineraryForm
          initialItineraryData={initialItineraryData}
          onClose={onClose}
        />
      </div>
    </div>
  );
};

export default ItineraryModal;
