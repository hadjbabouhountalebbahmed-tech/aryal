import React from 'react';
import { useNotificationContext } from '../../contexts/NotificationContext.tsx';
import Toast from './Toast.tsx';

const ToastContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotificationContext();

  return (
    <div className="fixed top-5 right-5 z-50">
      {notifications.map(notification => (
        <Toast 
          key={notification.id} 
          notification={notification} 
          onClose={removeNotification} 
        />
      ))}
    </div>
  );
};

export default ToastContainer;