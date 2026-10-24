import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Inbox, Clock } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const NotificationDropdown = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Format relative timestamp
  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Recently';
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) {
      markAsRead(notif._id);
    }
    setIsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  return (
    <div className="notification-dropdown-container" ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className="btn btn-secondary btn-sm notification-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        title="Notifications"
        style={{
          position: 'relative',
          padding: '0.45rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px'
        }}
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span
            className="notification-unread-badge"
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#ef4444',
              color: '#ffffff',
              fontSize: '0.65rem',
              fontWeight: 700,
              padding: '0.1rem 0.35rem',
              borderRadius: '999px',
              minWidth: '16px',
              textAlign: 'center',
              lineHeight: 1.2
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="notification-dropdown-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '320px',
            maxWidth: '90vw',
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border-light, #e2e8f0)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-lg, 0 10px 15px -3px rgba(0,0,0,0.1))',
            zIndex: 1000,
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border-light, #e2e8f0)',
              background: 'var(--bg-surface, #f8fafc)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary, #0f172a)' }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary, #1e40af)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <CheckCheck size={13} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
                <Inbox size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                <p style={{ margin: 0, fontSize: '0.85rem' }}>No notifications yet</p>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                  Updates on applications and status changes will appear here.
                </span>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid var(--border-light, #f1f5f9)',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                    background: n.isRead ? 'transparent' : 'var(--bg-accent, #eff6ff)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-surface, #f8fafc)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = n.isRead
                      ? 'transparent'
                      : 'var(--bg-accent, #eff6ff)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span
                      style={{
                        fontWeight: n.isRead ? 500 : 700,
                        fontSize: '0.825rem',
                        color: 'var(--text-primary, #0f172a)'
                      }}
                    >
                      {n.title}
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-muted, #94a3b8)',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem'
                      }}
                    >
                      <Clock size={10} />
                      {formatTimeAgo(n.createdAt)}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.775rem',
                      color: 'var(--text-secondary, #475569)',
                      lineHeight: 1.35
                    }}
                  >
                    {n.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
