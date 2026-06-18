import React, { useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';
import { notificationAPI } from '../services/api';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { Bell, Check, Trash } from 'lucide-react';
import { formatDate } from '../utils/utils';

const Notifications = () => {
  const { toastSuccess, toastError } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getAll();
      if (res.data && res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      toastError('Failed to fetch notifications.');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchNotifications();
      setLoading(false);
    };
    init();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      const res = await notificationAPI.markAsRead(id);
      if (res.data && res.data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (err) {
      toastError('Failed to update notification status.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await notificationAPI.markAllAsRead();
      if (res.data && res.data.success) {
        toastSuccess('All notifications marked as read.');
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (err) {
      toastError('Failed to update notifications.');
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            Notifications Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Keep track of club join updates, posts alerts, likes, and administration messages.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-semibold text-brand-600 hover:text-brand-800 dark:text-brand-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <Check className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <SkeletonLoader type="list" />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-10 h-10 text-slate-400" />}
          title="All Clear!"
          message="No notifications received at this time."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800/40">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              className={`p-5 flex items-start justify-between gap-4 transition-colors ${
                notif.isRead
                  ? 'bg-transparent'
                  : 'bg-brand-50/20 dark:bg-brand-950/5'
              }`}
            >
              <div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                  {!notif.isRead && <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0"></span>}
                  {notif.title}
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-xs mt-1 leading-relaxed whitespace-pre-wrap">
                  {notif.message}
                </p>
                <span className="text-[10px] text-slate-400 mt-2.5 block">
                  {formatDate(notif.createdAt)}
                </span>
              </div>

              {!notif.isRead && (
                <button
                  onClick={() => handleMarkRead(notif._id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Mark read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
