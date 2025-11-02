import React, { useState, useEffect } from 'react';
import { notificationsAPI } from '../services/api';

const NotificationBell = ({ colorScheme = 'primary' }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUnreadCount();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationsAPI.getUnreadCount();
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Failed to fetch unread count', error);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationsAPI.getNotifications({ limit: 10 });
      setNotifications(response.data.data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBellClick = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      fetchNotifications();
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'allocation':
        return '🎯';
      case 'vote':
        return '🗳️';
      case 'donation':
        return '🎁';
      case 'pickup':
        return '📦';
      case 'system':
        return 'ℹ️';
      default:
        return '📬';
    }
  };

  const colorClasses = {
    primary: {
      bell: 'text-primary-600 hover:text-primary-700',
      badge: 'bg-red-500',
      dropdown: 'bg-primary-50 border-primary-200',
      button: 'bg-primary-600 hover:bg-primary-700',
      unreadBg: 'bg-primary-100'
    },
    purple: {
      bell: 'text-purple-600 hover:text-purple-700',
      badge: 'bg-red-500',
      dropdown: 'bg-purple-50 border-purple-200',
      button: 'bg-purple-600 hover:bg-purple-700',
      unreadBg: 'bg-purple-100'
    },
    blue: {
      bell: 'text-blue-600 hover:text-blue-700',
      badge: 'bg-red-500',
      dropdown: 'bg-blue-50 border-blue-200',
      button: 'bg-blue-600 hover:bg-blue-700',
      unreadBg: 'bg-blue-100'
    },
    orange: {
      bell: 'text-orange-600 hover:text-orange-700',
      badge: 'bg-red-500',
      dropdown: 'bg-orange-50 border-orange-200',
      button: 'bg-orange-600 hover:bg-orange-700',
      unreadBg: 'bg-orange-100'
    }
  };

  const colors = colorClasses[colorScheme] || colorClasses.primary;

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={handleBellClick}
        className={`relative p-2 rounded-lg transition ${colors.bell}`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className={`absolute top-0 right-0 ${colors.badge} text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className={`absolute right-0 mt-2 w-80 ${colors.dropdown} rounded-lg shadow-xl border-2 z-50`}>
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications yet
              </div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
                      !notification.read ? colors.unreadBg : ''
                    }`}
                    onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 text-center">
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell;

