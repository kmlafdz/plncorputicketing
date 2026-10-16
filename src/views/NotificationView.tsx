import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  Ticket as TicketIcon,
  ChevronRight,
  Shield,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import { AppNotification, User as UserType } from '../types';
import { storageService } from '../services/storageService';

interface NotificationViewProps {
  currentUser: UserType;
  onNavigate: (view: string, ticketId?: string) => void;
}

export const NotificationView: React.FC<NotificationViewProps> = ({
  currentUser,
  onNavigate,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    storageService.getNotifications(currentUser.uid)
  );

  const refreshData = () => {
    setNotifications(storageService.getNotifications(currentUser.uid));
  };

  const handleMarkAllRead = () => {
    storageService.markAllNotificationsAsRead(currentUser.uid);
    refreshData();
  };

  const handleClick = (notif: AppNotification) => {
    storageService.markNotificationAsRead(notif.id);
    refreshData();
    if (notif.ticketId) {
      onNavigate('ticket-detail', notif.ticketId);
    }
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Pusat Notifikasi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Informasi terkini mengenai tiket Anda, penugasan baru, dan pembaruan dari tim teknis.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-slate-100 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              Semua ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                filter === 'unread' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              Belum Dibaca ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer"
            >
              Tandai Semua Dibaca
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden divide-y divide-slate-100">
        {filteredNotifs.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <Bell className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">Tidak ada notifikasi saat ini</p>
            <p className="text-slate-400 mt-0.5">Semua pesan dan notifikasi telah Anda baca.</p>
          </div>
        ) : (
          filteredNotifs.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleClick(notif)}
              className={`p-4 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                !notif.isRead ? 'bg-emerald-50/40' : ''
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    notif.type === 'assignment'
                      ? 'bg-sky-100 text-sky-700'
                      : notif.type === 'sla'
                      ? 'bg-rose-100 text-rose-700'
                      : notif.type === 'comment'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {notif.type === 'assignment' && <TicketIcon className="w-4 h-4" />}
                  {notif.type === 'sla' && <AlertTriangle className="w-4 h-4" />}
                  {notif.type === 'comment' && <MessageSquare className="w-4 h-4" />}
                  {notif.type === 'status' && <CheckCircle2 className="w-4 h-4" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">{notif.title}</span>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                    )}
                    {notif.ticketNumber && (
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-mono-numbers font-semibold">
                        #{notif.ticketNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                  <span className="text-[10px] text-slate-400 font-mono-numbers flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(notif.createdAt).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-2" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
