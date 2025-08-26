import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import styles from './NotificationDropdown.module.css';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    getAllNotifications,
  } = useNotification();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      getAllNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = (notificationId, event) => {
    event.stopPropagation();
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'NEW_FOLLOW':
        return '👥';
      case 'NEW_COMMENT':
        return '💬';
      case 'NEW_LIKE':
        return '❤️';
      case 'NEW_RATING':
        return '⭐';
      default:
        return '🔔';
    }
  };

  const formatTimeAgo = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { 
        addSuffix: true, 
        locale: vi 
      });
    } catch (error) {
      return 'Vừa xong';
    }
  };

  return (
    <div className={styles.notificationContainer} ref={dropdownRef}>
      <button 
        className={styles.notificationButton}
        onClick={handleToggle}
        aria-label={`Thông báo ${unreadCount > 0 ? `(${unreadCount} chưa đọc)` : ''}`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className={styles.badge}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <h3>Thông báo</h3>
            {unreadCount > 0 && (
              <button 
                className={styles.markAllButton}
                onClick={handleMarkAllAsRead}
                title="Đánh dấu tất cả đã đọc"
              >
                <CheckCheck size={16} />
              </button>
            )}
          </div>

          <div className={styles.notificationList}>
            {notifications.length === 0 ? (
              <div className={styles.emptyState}>
                <Bell size={32} className={styles.emptyIcon} />
                <p>Không có thông báo nào</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`${styles.notificationItem} ${
                    !notification.isRead ? styles.unread : ''
                  }`}
                >
                  <div className={styles.notificationIcon}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className={styles.notificationContent}>
                    <div className={styles.notificationHeader}>
                      <h4 className={styles.title}>{notification.title}</h4>
                      <span className={styles.time}>
                        {formatTimeAgo(notification.createdAt)}
                      </span>
                    </div>
                    
                    <p className={styles.message}>{notification.message}</p>
                    
                    {notification.fromUser && (
                      <div className={styles.fromUser}>
                        {notification.fromUser.avatar && (
                          <img 
                            src={notification.fromUser.avatar} 
                            alt={notification.fromUser.name}
                            className={styles.avatar}
                          />
                        )}
                        <span className={styles.userName}>
                          {notification.fromUser.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className={styles.actions}>
                    {!notification.isRead && (
                      <button
                        className={styles.markReadButton}
                        onClick={(e) => handleMarkAsRead(notification.id, e)}
                        title="Đánh dấu đã đọc"
                      >
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 5 && (
            <div className={styles.footer}>
              <button className={styles.viewAllButton}>
                Xem tất cả thông báo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
