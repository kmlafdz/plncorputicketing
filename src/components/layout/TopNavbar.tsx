import React, { useState, useEffect } from 'react';
import {
  Bell,
  Search,
  User,
  ChevronDown,
  LogOut,
  Layers,
  Clock,
  Sparkles,
  Settings as SettingsIcon,
} from 'lucide-react';
import { User as UserType, AppNotification } from '../../types';
import { storageService } from '../../services/storageService';

interface TopNavbarProps {
  currentUser: UserType;
  onNavigate: (view: string, ticketId?: string) => void;
  onSearch: (query: string) => void;
  onLogout: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  currentUser,
  onNavigate,
  onSearch,
  onLogout,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const refreshData = () => {
    setNotifications(storageService.getNotifications(currentUser.uid));
  };

  useEffect(() => {
    refreshData();
    const unsubscribe = storageService.subscribe(refreshData);
    return () => unsubscribe();
  }, [currentUser.uid]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      onNavigate(currentUser.role === 'pelapor' ? 'my-tickets' : 'all-tickets');
    }
  };

  const handleMarkAllRead = () => {
    storageService.markAllNotificationsAsRead(currentUser.uid);
  };

  const handleNotificationClick = (notif: AppNotification) => {
    storageService.markNotificationAsRead(notif.id);
    setShowNotifDropdown(false);
    if (notif.ticketId) {
      onNavigate('ticket-detail', notif.ticketId);
    }
  };

  const rolePill = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="bg-[#D9EEFF] text-[#1765B3] border border-[#B8DEFF] text-[10px] font-bold px-2 py-0.5 rounded-full">
            ADMIN
          </span>
        );
      case 'manajemen':
        return (
          <span className="bg-purple-100 text-purple-900 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
            MANAJEMEN CORPU
          </span>
        );
      case 'pic': {
        const picLabel =
          currentUser.uid === 'user-pic-1'
            ? 'PIC 1 · NETWORK'
            : currentUser.uid === 'user-pic-2'
            ? 'PIC 2 · HARDWARE'
            : currentUser.uid === 'user-pic-3'
            ? 'PIC 3 · APLIKASI'
            : 'PETUGAS PIC';
        return (
          <span className="bg-[#D9EEFF] text-[#1765B3] border border-[#B8DEFF] text-[10px] font-bold px-2 py-0.5 rounded-full">
            {picLabel}
          </span>
        );
      }
      case 'pelapor':
      default:
        return (
          <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
            PELAPOR
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#DCEAF7] shadow-2xs">
      {/* Main Top Header - Clean Enterprise Light Blue & White */}
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-hidden"
          >
            {/* Stylized PLN Bolt Logo Badge with Light Blue Gradient */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2589E8] to-[#1765B3] flex items-center justify-center text-amber-300 shadow-xs border border-[#1765B3]/20 group-hover:opacity-95 transition-all">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M13 2L3 14h8l-2 8 10-12h-8l2-8z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-[#172B4D] leading-none">
                  PLN CORPORATE UNIVERSITY
                </span>
              </div>
              <span className="text-[10px] font-semibold text-[#2589E8] tracking-wider uppercase block">
                Ticketing Management System
              </span>
            </div>
          </button>
        </div>

        {/* Center: Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor tiket, kendala, atau departemen..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#F5FAFF] border border-[#DCEAF7] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2589E8] focus:bg-white text-[#172B4D] placeholder:text-[#94A3B8] transition-all"
            />
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-2.5 top-2.5 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  onSearch('');
                }}
                className="absolute right-2.5 top-2 text-[#94A3B8] hover:text-[#172B4D] text-xs font-bold"
              >
                ×
              </button>
            )}
          </form>
        </div>

        {/* Right: Notifications & User Profile */}
        <div className="flex items-center gap-3">
          {/* Notification Bell Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2 rounded-lg text-[#64748B] hover:text-[#172B4D] hover:bg-[#F0F7FF] transition-colors focus:outline-hidden cursor-pointer"
              aria-label="Notifikasi"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#2589E8] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white font-mono-numbers shadow-2xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-[#DCEAF7] z-50 overflow-hidden animate-in fade-in-50">
                <div className="p-3 bg-[#F5FAFF] border-b border-[#DCEAF7] flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-[#172B4D]">Notifikasi</span>
                    {unreadCount > 0 && (
                      <span className="bg-[#D9EEFF] text-[#1765B3] text-[10px] font-bold px-2 py-0.5 rounded-full font-mono-numbers">
                        {unreadCount} baru
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] text-[#2589E8] hover:text-[#1765B3] font-semibold cursor-pointer"
                    >
                      Tandai sudah dibaca
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-[#DCEAF7]/60">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-[#94A3B8] text-xs">
                      Tidak ada notifikasi saat ini
                    </div>
                  ) : (
                    notifications.slice(0, 6).map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-3 text-xs hover:bg-[#F0F7FF] cursor-pointer transition-colors ${
                          !notif.isRead ? 'bg-[#EFF8FF]' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className={`font-semibold ${!notif.isRead ? 'text-[#1765B3]' : 'text-[#172B4D]'}`}>
                            {notif.title}
                          </span>
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-[#2589E8] shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-[#64748B] text-[11px] line-clamp-2 mb-1">
                          {notif.message}
                        </p>
                        <span className="text-[10px] text-[#94A3B8] flex items-center gap-1 font-mono-numbers">
                          <Clock className="w-3 h-3 text-[#94A3B8]" />
                          {new Date(notif.createdAt).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2.5 bg-[#F5FAFF] border-t border-[#DCEAF7] text-center">
                  <button
                    onClick={() => {
                      setShowNotifDropdown(false);
                      onNavigate('notifications');
                    }}
                    className="text-xs text-[#2589E8] hover:text-[#1765B3] font-bold cursor-pointer w-full"
                  >
                    Buka Semua Notifikasi ({notifications.length})
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Area */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-[#F0F7FF] transition-colors focus:outline-hidden cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2589E8] to-[#1765B3] text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                {currentUser.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')}
              </div>
              <div className="hidden sm:block text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#172B4D] truncate max-w-[130px]">
                    {currentUser.name}
                  </span>
                  {rolePill(currentUser.role)}
                </div>
                <span className="text-[11px] text-[#64748B] truncate max-w-[150px] block">
                  {currentUser.department}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-[#94A3B8]" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#DCEAF7] z-50 overflow-hidden py-1 animate-in fade-in-50">
                <div className="p-3 bg-[#F5FAFF] border-b border-[#DCEAF7]">
                  <p className="text-xs font-bold text-[#172B4D]">{currentUser.name}</p>
                  <p className="text-[11px] text-[#64748B] font-mono-numbers">{currentUser.employeeId}</p>
                  <p className="text-[11px] text-[#2589E8] font-medium mt-0.5">{currentUser.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    onNavigate('profile');
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-[#172B4D] hover:bg-[#F0F7FF] flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <User className="w-4 h-4 text-[#2589E8]" />
                  Profil Saya
                </button>
                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onNavigate('settings');
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-[#172B4D] hover:bg-[#F0F7FF] flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <SettingsIcon className="w-4 h-4 text-[#2589E8]" />
                    Pengaturan Akun
                  </button>
                )}
                <div className="border-t border-[#DCEAF7] my-1" />
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    onLogout();
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-semibold cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
