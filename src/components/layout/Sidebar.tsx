import React from 'react';
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
  Sparkles,
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
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  counts,
  onLogout,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const isPic = currentUser.role === 'pic';
  const isPelapor = currentUser.role === 'pelapor';
  const isManajemen = currentUser.role === 'manajemen';

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
        onClick={() => onNavigate(id)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-r-lg text-xs transition-all group cursor-pointer relative ${
          isActive
            ? 'bg-[#E5F2FF] text-[#1765B3] font-bold border-l-4 border-[#2589E8]'
            : 'text-[#64748B] hover:text-[#172B4D] hover:bg-[#F0F7FF] border-l-4 border-transparent'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Icon
            className={`w-4 h-4 shrink-0 transition-colors ${
              isActive ? 'text-[#2589E8]' : 'text-[#94A3B8] group-hover:text-[#2589E8]'
            }`}
          />
          <span className="truncate">{label}</span>
        </div>
        {typeof badgeCount === 'number' && badgeCount > 0 && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono-numbers shrink-0 transition-colors ${
              isActive
                ? 'bg-[#2589E8] text-white shadow-2xs'
                : 'bg-[#EFF8FF] text-[#1765B3] border border-[#DCEAF7]'
            }`}
          >
            {badgeCount}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside className="w-64 bg-white border-r border-[#DCEAF7] flex flex-col shrink-0 min-h-[calc(100vh-65px)] select-none">
      {/* Scrollable menu content */}
      <div className="p-3 space-y-5 flex-1 overflow-y-auto">
        {/* Main Menu */}
        <div>
          <div className="px-3 pb-1.5 text-[10px] font-bold tracking-wider uppercase text-[#94A3B8]">
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

            {/* Notifications for all authenticated users */}
            {navItem('notifications', 'Notifikasi', Bell, counts.notifications)}
          </div>
        </div>

        {/* Management & Helpdesk Menu (Admin only) */}
        {isAdmin && (
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-bold tracking-wider uppercase text-[#94A3B8]">
              Pengelolaan & Helpdesk
            </div>
            <div className="space-y-0.5">
              {navItem('pic-management', 'Manajemen PIC', Users)}
              {navItem('auto-assignment', 'Pengaturan Penugasan', Sparkles)}
              {navItem('user-management', 'Manajemen User', UserCog)}
              {navItem('category-management', 'Kategori Tiket', Layers)}
              {navItem('sla-management', 'SLA dan Prioritas', Clock)}
            </div>
          </div>
        )}

        {/* Reports & Audit (Admin & Manajemen) */}
        {(isAdmin || isManajemen) && (
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-bold tracking-wider uppercase text-[#94A3B8]">
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
          <div className="px-3 pb-1.5 text-[10px] font-bold tracking-wider uppercase text-[#94A3B8]">
            Sistem & Akun
          </div>
          <div className="space-y-0.5">
            {navItem('profile', 'Profil Pengguna', User)}
            {isAdmin && navItem('settings', 'Pengaturan Aplikasi', Settings)}
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-between px-3 py-2 rounded-r-lg text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50/70 transition-colors group cursor-pointer border-l-4 border-transparent"
            >
              <div className="flex items-center gap-2.5">
                <LogOut className="w-4 h-4 text-rose-400 group-hover:text-rose-600" />
                <span>Keluar (Logout)</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* User Info Footer card */}
      <div className="p-3 border-t border-[#DCEAF7] bg-[#F5FAFF]">
        <div className="p-2.5 bg-white rounded-lg border border-[#DCEAF7] shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-[#172B4D] truncate">
              {currentUser.name}
            </span>
            <span
              className={`text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded ${
                isAdmin
                  ? 'text-[#1765B3] bg-[#D9EEFF] border border-[#B8DEFF]'
                  : isManajemen
                  ? 'text-purple-900 bg-purple-100 border border-purple-200'
                  : isPic
                  ? 'text-[#1765B3] bg-[#D9EEFF] border border-[#B8DEFF]'
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
          <p className="text-[10px] text-[#64748B] truncate mb-1">
            {currentUser.department}
          </p>
          <div className="flex items-center justify-between pt-1 border-t border-[#DCEAF7] text-[10px] text-[#64748B]">
            <span className="font-mono-numbers">{currentUser.employeeId.split('-')[0]}</span>
            <span className="text-[#1765B3] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2589E8]" />
              Terautentikasi
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
