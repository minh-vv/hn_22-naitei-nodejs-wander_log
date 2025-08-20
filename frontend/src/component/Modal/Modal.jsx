import React from "react";
import styles from "./Modal.module.css";

export default function Modal({ children, onClose }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          ✕
        </button>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
