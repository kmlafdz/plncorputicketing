import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  Inbox,
  ClipboardList,
  Bell,
  Users,
  UserCog,
  Layers,
  Clock,
  BarChart3,
  ShieldCheck,
  Settings,
  User,
  LogOut,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { User as UserType } from '../../types';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  currentUser: UserType;
  counts: {
    allTickets: number;
    myTickets: number;
    assignedTickets: number;
    notifications: number;
  };
  onLogout: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  counts,
  onLogout,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const isPic = currentUser.role === 'pic';
  const isPelapor = currentUser.role === 'pelapor';
  const isManajemen = currentUser.role === 'manajemen';

  // Lock body scroll when mobile drawer is open to prevent background jitter (admin only)
  useEffect(() => {
    if (isAdmin && isMobileOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isAdmin, isMobileOpen]);

  // Handle ESC key to fluently dismiss drawer
  useEffect(() => {
    if (!isMobileOpen || !onCloseMobile) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseMobile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, onCloseMobile]);

  const handleItemClick = (id: string) => {
    onNavigate(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const navItem = (
    id: string,
    label: string,
    Icon: React.ElementType,
    badgeCount?: number
  ) => {
    const isActive = currentView === id;
    return (
      <button
        key={id}
        onClick={() => handleItemClick(id)}
        aria-current={isActive ? 'page' : undefined}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group cursor-pointer relative ${
          isActive
            ? 'bg-[#EFF8FF] text-[#0A3D73] font-bold shadow-2xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-[#F8FAFC]'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={`w-1.5 h-4 rounded-full transition-all shrink-0 ${
              isActive ? 'bg-[#2589E8]' : 'bg-transparent group-hover:bg-slate-300'
            }`}
          />
          <Icon
            className={`w-4 h-4 shrink-0 transition-colors ${
              isActive ? 'text-[#2589E8]' : 'text-slate-400 group-hover:text-slate-600'
            }`}
          />
          <span className="truncate">{label}</span>
        </div>
        {typeof badgeCount === 'number' && badgeCount > 0 && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono-numbers shrink-0 transition-colors ${
              isActive
                ? 'bg-[#2589E8] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            {badgeCount}
          </span>
        )}
      </button>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full max-h-full bg-white select-none overflow-hidden">
      {/* Mobile Drawer Header with Close Button */}
      <div className="lg:hidden h-14 px-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC] shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0A3D73] to-[#2589E8] flex items-center justify-center text-amber-300 shrink-0 shadow-xs">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M13 2L3 14h8l-2 8 10-12h-8l2-8z" />
            </svg>
          </div>
          <div className="min-w-0">
            <span className="font-extrabold text-xs text-[#0F172A] block leading-none truncate">PLN CORPU</span>
            <span className="text-[10px] text-[#2589E8] font-bold uppercase block mt-0.5 truncate">Menu Navigasi</span>
          </div>
        </div>
        <button
          onClick={onCloseMobile}
          className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/80 active:scale-90 transition-all cursor-pointer shrink-0"
          aria-label="Tutup Menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable menu content */}
      <div className="p-3 space-y-4 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar min-h-0">
        {/* Main Menu */}
        <div>
          <div className="px-3 pb-1.5 text-[10px] font-bold tracking-wider uppercase text-slate-400">
            Menu Utama
          </div>
          <div className="space-y-0.5">
            {navItem('dashboard', isManajemen ? 'Executive Dashboard' : 'Dashboard', LayoutDashboard)}

            {/* Pelapor items */}
            {isPelapor && (
              <>
                {navItem('create-ticket', 'Buat Tiket Baru', PlusCircle)}
                {navItem('my-tickets', 'Tiket Saya', Ticket, counts.myTickets)}
              </>
            )}

            {/* PIC items */}
            {isPic && (
              <>
                {navItem(
                  'my-assignments',
                  'Penugasan Saya',
                  ClipboardList,
                  counts.assignedTickets
                )}
              </>
            )}

            {/* Admin & Manajemen items */}
            {(isAdmin || isManajemen) && (
              <>
                {navItem('all-tickets', 'Semua Tiket', Inbox, counts.allTickets)}
                {isAdmin && navItem('create-ticket', 'Buat Tiket Baru', PlusCircle)}
              </>
            )}

            {/* Notifications */}
            {navItem('notifications', 'Notifikasi', Bell, counts.notifications)}
          </div>
        </div>

        {/* Management & Helpdesk Menu (Admin only) */}
        {isAdmin && (
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-bold tracking-wider uppercase text-slate-400">
              Pengelolaan & Helpdesk
            </div>
            <div className="space-y-0.5">
              {navItem('pic-management', 'Manajemen PIC', Users)}
              {navItem('auto-assignment', 'Pengaturan Penugasan', SlidersHorizontal)}
              {navItem('user-management', 'Manajemen User', UserCog)}
              {navItem('category-management', 'Kategori Tiket', Layers)}
              {navItem('sla-management', 'SLA dan Prioritas', Clock)}
            </div>
          </div>
        )}

        {/* Reports & Audit (Admin & Manajemen) */}
        {(isAdmin || isManajemen) && (
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-bold tracking-wider uppercase text-slate-400">
              {isManajemen ? 'Pengawasan & Kepatuhan' : 'Laporan & Kepatuhan'}
            </div>
            <div className="space-y-0.5">
              {navItem('reports', 'Laporan & Analitik', BarChart3)}
              {navItem('audit-log', 'Audit Trail', ShieldCheck)}
              {isManajemen && navItem('pic-management', 'Monitoring Beban PIC', Users)}
            </div>
          </div>
        )}

        {/* System Settings */}
        <div>
          <div className="px-3 pb-1.5 text-[10px] font-bold tracking-wider uppercase text-slate-400">
            Sistem & Akun
          </div>
          <div className="space-y-0.5">
            {navItem('profile', 'Profil Pengguna', User)}
            {isAdmin && navItem('settings', 'Pengaturan Aplikasi', Settings)}
            <button
              onClick={() => {
                if (onCloseMobile) onCloseMobile();
                onLogout();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-4 rounded-full bg-transparent" />
                <LogOut className="w-4 h-4 text-rose-400 group-hover:text-rose-600" />
                <span>Keluar (Logout)</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* User Info Footer Card */}
      <div className="p-3 border-t border-[#E2E8F0] bg-[#F8FAFC] shrink-0">
        <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-[#0F172A] truncate">
              {currentUser.name}
            </span>
            <span
              className={`text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded shadow-2xs ${
                isAdmin
                  ? 'text-[#0A3D73] bg-[#EFF8FF] border border-[#B8DEFF]'
                  : isManajemen
                  ? 'text-purple-900 bg-purple-50 border border-purple-200'
                  : isPic
                  ? 'text-[#0A3D73] bg-[#EFF8FF] border border-[#B8DEFF]'
                  : 'text-slate-800 bg-slate-100 border border-slate-200'
              }`}
            >
              {isPic
                ? currentUser.uid === 'user-pic-1'
                  ? 'PIC 1'
                  : currentUser.uid === 'user-pic-2'
                  ? 'PIC 2'
                  : currentUser.uid === 'user-pic-3'
                  ? 'PIC 3'
                  : 'PIC'
                : currentUser.role}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 truncate mb-1.5 font-medium">
            {currentUser.department}
          </p>
          <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[10px] text-slate-400">
            <span className="font-mono-numbers">{currentUser.employeeId.split('-')[0]}</span>
            <span className="text-[#1765B3] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2589E8]" />
              Terautentikasi
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-[#E2E8F0] flex-col shrink-0 h-full max-h-full overflow-hidden bg-white select-none sticky top-0 self-stretch">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer with Pure Spring Physics & Fluid Motion (Admin Only) */}
      {isAdmin && (
        <AnimatePresence>
          {isMobileOpen && (
            <div
              className="fixed inset-0 z-50 lg:hidden overflow-hidden pointer-events-auto"
              aria-modal="true"
              role="dialog"
            >
              {/* Smooth Backdrop Fade */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                onClick={onCloseMobile}
                className="fixed inset-0 bg-slate-950/45 will-change-[opacity]"
              />

              {/* Fluent Spring Physics Drawer Panel */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '0%' }}
                exit={{ x: '-100%' }}
                transition={{
                  type: 'spring',
                  damping: 32,
                  stiffness: 320,
                  mass: 0.8,
                }}
                drag="x"
                dragConstraints={{ left: -320, right: 0 }}
                dragElastic={{ left: 0.08, right: 0.01 }}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -60 || info.velocity.x < -250) {
                    onCloseMobile?.();
                  }
                }}
                className="relative w-72 max-w-[82vw] h-full bg-white shadow-2xl z-10 will-change-transform flex flex-col border-r border-slate-200 select-none overflow-hidden touch-pan-y"
              >
                {sidebarContent}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      )}
    </>
  );
};
