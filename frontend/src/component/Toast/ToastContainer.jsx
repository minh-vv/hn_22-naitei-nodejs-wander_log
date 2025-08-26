import React from 'react';
import Toast from './Toast';
import { useNotification } from '../../context/NotificationContext';
import styles from './Toast.module.css';

const ToastContainer = () => {
  const { toasts, removeToast } = useNotification();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className={styles.toastContainer}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onClose={removeToast}
        />
      ))}
    </div>
  );
};

export default ToastContainer;


