import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = useCallback((message, type = 'info', duration = 5000) => {
        const id = Date.now() + Math.random();
        const notification = {
            id,
            message,
            type,
            timestamp: new Date()
        };

        setNotifications(prev => [...prev, notification]);

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }

        return id;
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, []);

    const clearAllNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    // Convenience methods
    const showSuccess = useCallback((message, duration = 4000) => {
        return addNotification(message, 'success', duration);
    }, [addNotification]);

    const showError = useCallback((message, duration = 6000) => {
        return addNotification(message, 'error', duration);
    }, [addNotification]);

    const showWarning = useCallback((message, duration = 5000) => {
        return addNotification(message, 'warning', duration);
    }, [addNotification]);

    const showInfo = useCallback((message, duration = 4000) => {
        return addNotification(message, 'info', duration);
    }, [addNotification]);

    const value = {
        notifications,
        addNotification,
        removeNotification,
        clearAllNotifications,
        showSuccess,
        showError,
        showWarning,
        showInfo
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
            <NotificationContainer />
        </NotificationContext.Provider>
    );
};

// Notification Container Component
const NotificationContainer = () => {
    const { notifications, removeNotification } = useNotification();

    const getNotificationStyles = (type) => {
        const baseStyles = "mb-3 p-4 rounded-lg shadow-lg border-l-4 flex items-start justify-between max-w-md animate-slide-in";

        switch (type) {
            case 'success':
                return `${baseStyles} bg-green-50 border-green-400 text-green-800`;
            case 'error':
                return `${baseStyles} bg-red-50 border-red-400 text-red-800`;
            case 'warning':
                return `${baseStyles} bg-yellow-50 border-yellow-400 text-yellow-800`;
            case 'info':
                return `${baseStyles} bg-blue-50 border-blue-400 text-blue-800`;
            default:
                return `${baseStyles} bg-gray-50 border-gray-400 text-gray-800`;
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return '✅';
            case 'error':
                return '❌';
            case 'warning':
                return '⚠️';
            case 'info':
                return 'ℹ️';
            default:
                return '📢';
        }
    };

    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={getNotificationStyles(notification.type)}
                >
                    <div className="flex items-start">
                        <span className="mr-3 text-lg">{getIcon(notification.type)}</span>
                        <div className="flex-1">
                            <p className="text-sm font-medium">{notification.message}</p>
                            <p className="text-xs opacity-75 mt-1">
                                {notification.timestamp.toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => removeNotification(notification.id)}
                        className="ml-4 text-xl font-bold opacity-70 hover:opacity-100 transition-opacity"
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
};

// Add CSS for animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slide-in {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  .animate-slide-in {
    animation: slide-in 0.3s ease-out;
  }
`;
document.head.appendChild(style);
