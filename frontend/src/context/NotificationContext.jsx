import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (user && token) {
      const socketInstance = io(
        'http://localhost:3000/notifications',
        {
          auth: {
            token: token,
          },
          autoConnect: true,
        }
      );

      socketInstance.on('connect', () => {
        console.log('Connected to notification server');
        setIsConnected(true);
      });

      socketInstance.on('disconnect', () => {
        console.log('Disconnected from notification server');
        setIsConnected(false);
      });

      socketInstance.on('notification:unreadCount', (data) => {
        setUnreadCount(data.count);
      });

      socketInstance.on('notification:newFollow', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        addToast({
          id: Date.now(),
          type: 'info',
          title: notification.title,
          message: notification.message,
          duration: 5000,
        });
      });

      socketInstance.on('notification:newInteraction', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        addToast({
          id: Date.now(),
          type: 'info',
          title: notification.title,
          message: notification.message,
          duration: 5000,
        });
      });

      socketInstance.on('notification:allNotifications', (notifications) => {
        setNotifications(notifications);
      });

      socketInstance.on('notification:unreadNotifications', (notifications) => {
        const unreadNotifications = notifications.filter(n => !n.isRead);
        setNotifications(prev => {
          const updatedNotifications = [...prev];
          unreadNotifications.forEach(newNotification => {
            const existingIndex = updatedNotifications.findIndex(n => n.id === newNotification.id);
            if (existingIndex === -1) {
              updatedNotifications.unshift(newNotification);
            }
          });
          return updatedNotifications;
        });
      });

      socketInstance.on('notification:markAsReadSuccess', ({ notificationId }) => {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, isRead: true }
              : notification
          )
        );
      });

      socketInstance.on('notification:markAllAsReadSuccess', () => {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, isRead: true }))
        );
      });

      socketInstance.on('notification:error', (error) => {
        console.error('Notification error:', error);
        addToast({
          id: Date.now(),
          type: 'error',
          title: 'Lỗi',
          message: error.message || 'Có lỗi xảy ra với thông báo',
          duration: 3000,
        });
      });

      setSocket(socketInstance);

      setTimeout(() => {
        socketInstance.emit('notification:getAll');
      }, 1000);

      return () => {
        socketInstance.close();
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [user, token]);

  const removeToast = useCallback((toastId) => {
    setToasts(prev => prev.filter(toast => toast.id !== toastId));
  }, []);

  const addToast = useCallback((toast) => {
    setToasts(prev => [...prev, toast]);
    
    if (toast.duration) {
      setTimeout(() => {
        removeToast(toast.id);
      }, toast.duration);
    }
  }, [removeToast]);

  const getAllNotifications = useCallback(() => {
    if (socket && isConnected) {
      socket.emit('notification:getAll');
    }
  }, [socket, isConnected]);

  const getUnreadNotifications = useCallback(() => {
    if (socket && isConnected) {
      socket.emit('notification:getUnread');
    }
  }, [socket, isConnected]);

  const markAsRead = useCallback((notificationId) => {
    if (socket && isConnected) {
      socket.emit('notification:markAsRead', { notificationId });
    }
  }, [socket, isConnected]);

  const markAllAsRead = useCallback(() => {
    if (socket && isConnected) {
      socket.emit('notification:markAllAsRead');
    }
  }, [socket, isConnected]);

  const value = {
    socket,
    isConnected,
    notifications,
    unreadCount,
    toasts,
    addToast,
    removeToast,
    getAllNotifications,
    getUnreadNotifications,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
