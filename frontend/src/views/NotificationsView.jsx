import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  NotificationIcon, 
  AnnouncementIcon, 
  CommentIcon 
} from '../components/icons/ParvarishIcons';
import { CheckCheck, Award } from 'lucide-react';

export function NotificationsView({ onOpenPost }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await api.getNotifications();
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (ntf) => {
    if (!ntf.isRead) {
      await api.markNotificationRead(ntf.id).catch(() => {});
    }
    if (ntf.referenceId && onOpenPost) {
      onOpenPost(ntf.referenceId);
    } else {
      fetchNotifications();
    }
  };

  return (
    <div className="flex-1 bg-slate-100 min-h-screen p-4 pb-16 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <NotificationIcon size={22} selected={true} className="text-emerald-700" />
          <h2 className="font-serif-title text-xl font-bold text-slate-900">Notifications</h2>
          {unreadCount > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs text-emerald-700 font-semibold hover:underline flex items-center space-x-1"
          >
            <CheckCheck size={14} />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Checking activity feed...</div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500 text-xs space-y-2">
            <NotificationIcon size={32} className="mx-auto text-slate-300" />
            <p className="font-semibold text-slate-700">You're all caught up!</p>
            <p className="text-[11px]">No notifications right now.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3 ${
                !n.isRead ? 'bg-emerald-50/60 border-emerald-200 shadow-sm' : 'bg-white border-slate-200 opacity-85'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                n.type === 'ANNOUNCEMENT' ? 'bg-emerald-100 text-emerald-700' : n.type === 'ACHIEVEMENT' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
              }`}>
                {n.type === 'ANNOUNCEMENT' ? <AnnouncementIcon size={18} /> : n.type === 'ACHIEVEMENT' ? <Award size={18} /> : <CommentIcon size={18} />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{n.title}</h4>
                  <span className="text-[10px] text-slate-400">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 leading-snug">{n.message}</p>
              </div>

              {!n.isRead && (
                <span className="w-2 h-2 rounded-full bg-emerald-600 mt-2 shrink-0"></span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
