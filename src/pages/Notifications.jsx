import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Bell, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Notifications() {
  const { profile } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');

      if (!profile?.id) {
        setNotifications([]);
        return;
      }

      // Notifications belong to the user's profile
      const data = await api.get(`/notifications?user_id=${profile.id}`);

      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError(err.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [profile?.id]);

  const getIcon = (type) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle size={20} />;

      case 'WARNING':
      case 'ALERT':
        return <AlertTriangle size={20} />;

      default:
        return <Info size={20} />;
    }
  };

  const getIconStyle = (type) => {
    switch (type) {
      case 'SUCCESS':
        return {
          backgroundColor: '#e8f1f0',
          color: 'var(--color-primary-dark)'
        };

      case 'WARNING':
      case 'ALERT':
        return {
          backgroundColor: '#fcf2ed',
          color: 'var(--color-terracotta)'
        };

      default:
        return {
          backgroundColor: '#e0f2fe',
          color: '#0369a1'
        };
    }
  };

  const formatDate = (date) => {
    if (!date) return '';

    const notificationDate = new Date(date);

    if (Number.isNaN(notificationDate.getTime())) {
      return '';
    }

    return notificationDate.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <Navbar
        title="Notifications"
        subtitle="System alerts, appointment updates, and reminders"
      />

      {loading ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '2.5rem',
            color: 'var(--color-text-muted)'
          }}
        >
          Loading notifications...
        </div>
      ) : error ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '2rem',
            color: '#dc2626',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca'
          }}
        >
          {error}
        </div>
      ) : notifications.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'var(--color-text-muted)'
          }}
        >
          <Bell
            size={40}
            style={{
              marginBottom: '1rem',
              opacity: 0.5
            }}
          />

          <h3
            style={{
              color: 'var(--color-primary-dark)',
              marginBottom: '0.5rem'
            }}
          >
            No notifications
          </h3>

          <p>
            You're all caught up! New appointment updates and alerts will
            appear here.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem'
              }}
            >
              {/* Notification Icon */}
              <div
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  ...getIconStyle(notification.type)
                }}
              >
                {getIcon(notification.type)}
              </div>

              {/* Notification Content */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '1rem'
                  }}
                >
                  <h4
                    style={{
                      fontWeight: 700,
                      color: 'var(--color-primary-dark)',
                      margin: 0
                    }}
                  >
                    {notification.title}
                  </h4>

                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--color-text-muted)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {formatDate(
                      notification.created_at || notification.date
                    )}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: '0.9rem',
                    color: 'var(--color-text-main)',
                    marginTop: '0.4rem',
                    marginBottom: 0
                  }}
                >
                  {notification.message}
                </p>

                {/* Unread indicator */}
                {notification.is_read === false && (
                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: '0.6rem',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: '#0369a1',
                      backgroundColor: '#e0f2fe',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '6px'
                    }}
                  >
                    NEW
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}