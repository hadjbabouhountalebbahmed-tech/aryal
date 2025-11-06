import React, { createContext, useContext, useState, ReactNode } from 'react';
// Fix: added .ts extension
import { Notification, NotificationType } from '../types.ts';

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (message: string, type: NotificationType, action?: Notification['action']) => void;
  removeNotification: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (message: string, type: NotificationType, action?: Notification['action']) => {
    const id = new Date().getTime();
    setNotifications(prev => [...prev, { id, message, type, action }]);
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

// Custom hook for easier access from components
export const useNotifier = () => {
  const { addNotification } = useNotificationContext();
  return {
    success: (message: string, action?: Notification['action']) => addNotification(message, 'success', action),
    error: (message: string, action?: Notification['action']) => addNotification(message, 'error', action),
    info: (message: string, action?: Notification['action']) => addNotification(message, 'info', action),
  };
};