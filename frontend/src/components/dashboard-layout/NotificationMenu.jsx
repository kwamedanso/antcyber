// components/layout/NotificationMenu.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { 
  FiBell, 
  FiCheckSquare, 
  FiFileText, 
  FiInfo,
  FiCheck
} from 'react-icons/fi';
import useOutsideClick from './useOutsideClick';
import { useNotifications } from '../../hooks/useNotifications';
import styles from './styles/NotificationMenu.module.css';

// Helper to pick the right icon based on the notification type
const getIconData = (type) => {
  switch (type) {
    case 'task_assigned': return { icon: <FiCheckSquare size={16} />, color: '#ea580c', bg: '#ffedd5' };
    case 'report_submitted': return { icon: <FiFileText size={16} />, color: '#2563eb', bg: '#dbeafe' };
    case 'system': return { icon: <FiInfo size={16} />, color: '#16a34a', bg: '#dcfce7' };
    default: return { icon: <FiBell size={16} />, color: '#6b7280', bg: '#f3f4f6' };
  }
};

const NotificationMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useOutsideClick(() => setIsOpen(false));
  
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    handleMarkAsRead, 
    handleMarkAllAsRead 
  } = useNotifications();

  const handleNotificationClick = (notification) => {
    // Mark as read if unread
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }
    
    // Navigate to the link if it exists
    if (notification.link) {
      navigate(notification.link);
    }
    
    setIsOpen(false);
  };

  return (
    <div className={styles.container} ref={menuRef}>
      <button 
        className={styles.bellButton} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span className={styles.badge}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button className={styles.markAllBtn} onClick={handleMarkAllAsRead}>
                <FiCheck size={14} /> Mark all as read
              </button>
            )}
          </div>

          <div className={styles.list}>
            {isLoading ? (
              <div className={styles.empty}>Loading...</div>
            ) : notifications.length === 0 ? (
              <div className={styles.empty}>No new notifications</div>
            ) : (
              notifications.map((notif) => {
                const iconData = getIconData(notif.type);
                return (
                  <div 
                    key={notif.id} 
                    className={`${styles.item} ${!notif.is_read ? styles.unread : ''}`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <div className={styles.iconWrapper} style={{ color: iconData.color, backgroundColor: iconData.bg }}>
                      {iconData.icon}
                    </div>
                    <div className={styles.content}>
                      <p className={styles.title}>{notif.title}</p>
                      <p className={styles.message}>{notif.message}</p>
                      <span className={styles.time}>
                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    {!notif.is_read && <div className={styles.unreadDot} />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationMenu;