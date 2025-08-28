import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import styles from './Toast.module.css';

const Toast = ({ toast, onClose }) => {
  const { id, type = 'info', title, message, url, duration = 5000 } = toast;
  const navigate = useNavigate();

  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className={styles.icon} />;
      case 'error':
        return <AlertCircle className={styles.icon} />;
      case 'warning':
        return <AlertTriangle className={styles.icon} />;
      case 'info':
      default:
        return <Info className={styles.icon} />;
    }
  };

  const handleToastClick = () => {
    if (url) {
      navigate(url);
      onClose(id);
    }
  };

  return (
    <div 
      className={`${styles.toast} ${styles[type]} ${url ? styles.clickable : ''}`}
      onClick={handleToastClick}
    >
      <div className={styles.content}>
        <div className={styles.iconContainer}>
          {getIcon()}
        </div>
        <div className={styles.textContent}>
          <div className={styles.title}>{title}</div>
          <div className={styles.message}>{message}</div>
          {url && (
            <div className={styles.actionText}>Nhấn để xem chi tiết</div>
          )}
        </div>
      </div>
      <button
        className={styles.closeButton}
        onClick={(e) => {
          e.stopPropagation();
          onClose(id);
        }}
        aria-label="Đóng thông báo"
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default Toast;