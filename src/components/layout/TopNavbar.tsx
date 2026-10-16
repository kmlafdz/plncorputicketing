import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Search,
  User,
  ChevronDown,
  LogOut,
  Clock,
  Settings as SettingsIcon,
  Menu,
  X,
  Check,
} from 'lucide-react';
import { User as UserType, AppNotification } from '../../types';
import { storageService } from '../../services/storageService';

interface TopNavbarProps {
  currentUser: UserType;
  onNavigate: (view: string, ticketId?: string) => void;
  onSearch: (query: string) => void;
  onLogout: () => void;
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  currentUser,
  onNavigate,
  onSearch,
  onLogout,
  isMobileMenuOpen = false,
  onToggleMobileMenu,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const refreshData = () => {
    setNotifications(storageService.getNotifications(currentUser.uid));
  };

  useEffect(() => {
    refreshData();
    const unsubscribe = storageService.subscribe(refreshData);
    return () => unsubscribe();
  }, [currentUser.uid]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setShowMobileSearch(false);
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
          <span className="bg-[#EFF8FF] text-[#0A3D73] border border-[#B8DEFF] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
            ADMIN
          </span>
        );
      case 'manajemen':
        return (
          <span className="bg-purple-50 text-purple-900 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
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
          <span className="bg-[#EFF8FF] text-[#0A3D73] border border-[#B8DEFF] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
            {picLabel}
          </span>
        );
      }
      case 'pelapor':
      default:
        return (
          <span className="bg-slate-100 text-slate-800 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
            PELAPOR
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#E2E8F0] shadow-xs shrink-0 w-full max-w-full overflow-hidden">
      {/* Main Top Header */}
      <div className="w-full px-2.5 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-1.5 sm:gap-3 max-w-full">
        {/* Left: Mobile Toggle & Brand Identity */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1 sm:flex-initial">
          {/* Hamburger button for Mobile / Tablet (Admin Only - non-admin uses BottomNavbar) */}
          {currentUser.role === 'admin' && onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-[#F0F7FF] active:scale-90 transition-all cursor-pointer focus-ring shrink-0"
              aria-label={isMobileMenuOpen ? 'Tutup navigasi' : 'Buka navigasi'}
            >
              <div className={`transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-90' : 'rotate-0'}`}>
                {isMobileMenuOpen ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5" />}
              </div>
            </button>
          )}

          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 sm:gap-2.5 text-left group cursor-pointer focus-ring rounded-lg p-0.5 min-w-0 truncate"
          >
            {/* Stylized PLN Lightning Bolt Emblem */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#0A3D73] via-[#1765B3] to-[#2589E8] flex items-center justify-center text-amber-300 shadow-sm border border-[#1765B3]/30 group-hover:scale-105 transition-transform shrink-0">
              <svg className="w-4 h-4 sm:w-6 sm:h-6 fill-current filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" viewBox="0 0 24 24">
                <path d="M13 2L3 14h8l-2 8 10-12h-8l2-8z" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs sm:text-base tracking-tight text-[#0F172A] leading-tight truncate">
                  PLN CORPU
                </span>
                <span className="hidden md:inline-block text-[10px] font-bold bg-[#EFF8FF] text-[#1765B3] border border-[#B8DEFF] px-1.5 py-0.2 rounded shrink-0">
                  HELP-DESK
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold text-[#2589E8] tracking-wider uppercase block truncate">
                <span className="hidden sm:inline">Ticketing Management System</span>
                <span className="sm:hidden">Service Desk</span>
              </span>
            </div>
          </button>
        </div>

        {/* Center: Search Bar (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor tiket, kendala, atau ruangan..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2589E8] focus:bg-white text-[#0F172A] placeholder:text-[#94A3B8] transition-all font-medium"
            />
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  onSearch('');
                }}
                className="absolute right-2.5 top-2 text-[#64748B] hover:text-[#0F172A] text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors"
              >
                ×
              </button>
            )}
          </form>
        </div>

        {/* Right: Mobile Search Toggle, Notifications & User Profile */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="md:hidden p-1.5 sm:p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-[#F0F7FF] transition-colors cursor-pointer shrink-0"
            aria-label="Cari tiket"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Notification Bell Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setShowNotifDropdown(!showNotifDropdown);
                setShowUserDropdown(false);
              }}
              className="relative p-1.5 sm:p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-[#F0F7FF] transition-colors cursor-pointer focus-ring shrink-0"
              aria-label="Notifikasi"
              aria-expanded={showNotifDropdown}
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] sm:min-w-[18px] h-4 sm:h-[18px] px-1 bg-[#2589E8] text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white font-mono-numbers shadow-xs animate-in zoom-in-75">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-20px)] sm:w-96 max-w-sm bg-white rounded-2xl shadow-xl border border-[#E2E8F0] z-50 overflow-hidden animate-in fade-in-50 duration-200">
                <div className="p-3.5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#0F172A]">Pemberitahuan</span>
                    {unreadCount > 0 && (
                      <span className="bg-[#EFF8FF] text-[#1765B3] border border-[#B8DEFF] text-[10px] font-bold px-2 py-0.5 rounded-full font-mono-numbers">
                        {unreadCount} baru
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] text-[#2589E8] hover:text-[#1765B3] font-semibold cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Tandai dibaca</span>
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      Tidak ada notifikasi saat ini
                    </div>
                  ) : (
                    notifications.slice(0, 6).map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-3.5 text-xs hover:bg-[#F0F7FF] cursor-pointer transition-colors ${
                          !notif.isRead ? 'bg-[#EFF8FF]/60' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className={`font-semibold ${!notif.isRead ? 'text-[#0A3D73]' : 'text-[#0F172A]'}`}>
                            {notif.title}
                          </span>
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-[#2589E8] shrink-0 mt-1 shadow-[0_0_4px_#2589E8]" />
                          )}
                        </div>
                        <p className="text-slate-600 text-[11px] line-clamp-2 mb-1 leading-relaxed">
                          {notif.message}
                        </p>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono-numbers">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {new Date(notif.createdAt).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-3 bg-[#F8FAFC] border-t border-[#E2E8F0] text-center">
                  <button
                    onClick={() => {
                      setShowNotifDropdown(false);
                      onNavigate('notifications');
                    }}
                    className="text-xs text-[#2589E8] hover:text-[#1765B3] font-bold cursor-pointer w-full py-1 rounded-lg hover:bg-[#EFF8FF] transition-colors"
                  >
                    Buka Semua Notifikasi ({notifications.length})
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => {
                setShowUserDropdown(!showUserDropdown);
                setShowNotifDropdown(false);
              }}
              className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-[#F0F7FF] transition-colors cursor-pointer focus-ring shrink-0"
              aria-label="Menu akun pengguna"
              aria-expanded={showUserDropdown}
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#0A3D73] to-[#2589E8] text-white font-bold text-[11px] sm:text-xs flex items-center justify-center shadow-xs shrink-0">
                {currentUser.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')}
              </div>
              <div className="hidden sm:block text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#0F172A] truncate max-w-[130px]">
                    {currentUser.name}
                  </span>
                  {rolePill(currentUser.role)}
                </div>
                <span className="text-[11px] text-slate-500 truncate max-w-[150px] block font-medium">
                  {currentUser.department}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-60 max-w-[calc(100vw-20px)] bg-white rounded-2xl shadow-xl border border-[#E2E8F0] z-50 overflow-hidden py-1.5 animate-in fade-in-50 duration-200">
                <div className="p-3.5 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <p className="text-xs font-bold text-[#0F172A]">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500 font-mono-numbers mt-0.5">{currentUser.employeeId}</p>
                  <p className="text-[11px] text-[#2589E8] font-semibold mt-0.5 truncate">{currentUser.email}</p>
                </div>

                <div className="p-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onNavigate('profile');
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:text-slate-900 hover:bg-[#F0F7FF] rounded-lg flex items-center gap-2.5 cursor-pointer transition-colors"
                  >
                    <User className="w-4 h-4 text-[#2589E8]" />
                    <span>Profil Saya</span>
                  </button>

                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onNavigate('settings');
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:text-slate-900 hover:bg-[#F0F7FF] rounded-lg flex items-center gap-2.5 cursor-pointer transition-colors"
                    >
                      <SettingsIcon className="w-4 h-4 text-[#2589E8]" />
                      <span>Pengaturan Akun</span>
                    </button>
                  )}
                </div>

                <div className="border-t border-[#E2E8F0] my-1" />

                <div className="p-1">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onLogout();
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2.5 font-bold cursor-pointer transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Keluar (Logout)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Mobile Search Bar */}
      {showMobileSearch && (
        <div className="md:hidden p-3 bg-[#F8FAFC] border-t border-[#E2E8F0] animate-in slide-in-from-top duration-200">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tiket, kendala, atau ruangan..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2589E8] text-[#0F172A] placeholder:text-[#94A3B8]"
            />
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5 pointer-events-none" />
            <button
              type="button"
              onClick={() => setShowMobileSearch(false)}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full"
            >
              ×
            </button>
          </form>
        </div>
      )}
    </header>
  );
};
