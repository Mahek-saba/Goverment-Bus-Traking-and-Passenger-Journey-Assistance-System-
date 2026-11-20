import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Trash2,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { passengerApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useLanguage } from '../context/LanguageContext';

export const NotificationsPage = () => {
  const { refreshNotificationsCount } = useAuth();
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread
  const [actionMsg, setActionMsg] = useState('');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await passengerApi.getNotifications();
      if (res.success) {
        setNotifications(res.data || []);
      }
    } catch (err) {
      // Quiet fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await passengerApi.markNotificationRead(id);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        refreshNotificationsCount();
      }
    } catch (err) {
      // Ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await passengerApi.markAllNotificationsRead();
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setActionMsg('All notifications marked as read.');
        refreshNotificationsCount();
        setTimeout(() => setActionMsg(''), 3000);
      }
    } catch (err) {
      // Ignore
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'alert':
      case 'breakdown':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'delay':
        return <Clock className="w-5 h-5 text-orange-600" />;
      case 'cancellation':
        return <ShieldAlert className="w-5 h-5 text-rose-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Batch Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-orange-600" />
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t('notifications.pageTitle')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {t('notifications.pageSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            disabled={notifications.every((n) => n.isRead)}
            className="btn-secondary px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-40"
          >
            <CheckCheck className="w-4 h-4 text-orange-600" />
            <span>{t('notifications.markAllReadBtn')}</span>
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-lg bg-slate-100 border border-slate-200 w-fit text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-md transition font-bold ${
            filter === 'all'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('notifications.allTab')} ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1 rounded-md transition font-bold ${
            filter === 'unread'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('notifications.unreadTab')} ({notifications.filter((n) => !n.isRead).length})
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <LoadingSpinner text={t('common.loading')} size="large" />
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3 shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">{t('notifications.noUnreadTitle')}</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {t('notifications.noUnreadDesc')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <div
              key={notif._id}
              className={`p-4 rounded-xl border transition flex items-start gap-3.5 shadow-2xs ${
                notif.isRead
                  ? 'bg-white border-slate-200'
                  : 'bg-orange-50/40 border-orange-300 shadow-xs'
              }`}
            >
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 shrink-0 mt-0.5">
                {getIcon(notif.type)}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900">{notif.title}</h4>
                  <span className="text-[10px] text-slate-400 font-mono font-semibold">
                    {new Date(notif.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                    {t('notifications.typeLabel')} <strong className="text-orange-700">{notif.type}</strong>
                  </span>

                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notif._id)}
                      className="text-xs text-orange-600 hover:text-orange-700 font-bold hover:underline"
                    >
                      {t('notifications.markAsReadAction')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
