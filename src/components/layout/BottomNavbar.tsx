import React from 'react';
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  Bell,
  User,
  ClipboardList,
  BarChart3,
  Users,
  Inbox,
} from 'lucide-react';
import { User as UserType } from '../../types';

interface BottomNavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  currentUser: UserType;
  counts: {
    allTickets: number;
    myTickets: number;
    assignedTickets: number;
    notifications: number;
  };
}

export const BottomNavbar: React.FC<BottomNavbarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  counts,
}) => {
  const isPelapor = currentUser.role === 'pelapor';
  const isPic = currentUser.role === 'pic';
  const isManajemen = currentUser.role === 'manajemen';

  // Do not render bottom nav for admin (admin has extensive desktop/drawer menu)
  if (currentUser.role === 'admin') {
    return null;
  }

  // Define role-specific items
  let navItems: Array<{
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: number;
    isCenterAction?: boolean;
  }> = [];

  if (isPelapor) {
    navItems = [
      { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
      { id: 'my-tickets', label: 'Tiket Saya', icon: Ticket, badge: counts.myTickets },
      { id: 'create-ticket', label: 'Buat Tiket', icon: PlusCircle, isCenterAction: true },
      { id: 'notifications', label: 'Notifikasi', icon: Bell, badge: counts.notifications },
      { id: 'profile', label: 'Profil', icon: User },
    ];
  } else if (isPic) {
    navItems = [
      { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
      { id: 'my-assignments', label: 'Tugas PIC', icon: ClipboardList, badge: counts.assignedTickets },
      { id: 'reports', label: 'Analitik', icon: BarChart3 },
      { id: 'notifications', label: 'Notifikasi', icon: Bell, badge: counts.notifications },
      { id: 'profile', label: 'Profil', icon: User },
    ];
  } else if (isManajemen) {
    navItems = [
      { id: 'dashboard', label: 'Ringkasan', icon: LayoutDashboard },
      { id: 'all-tickets', label: 'Semua Tiket', icon: Inbox, badge: counts.allTickets },
      { id: 'reports', label: 'Laporan & SLA', icon: BarChart3 },
      { id: 'pic-management', label: 'Beban PIC', icon: Users },
      { id: 'profile', label: 'Profil', icon: User },
    ];
  }

  return (
    <nav
      aria-label="Navigasi Bawah Mobile"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(15,23,42,0.06)] pb-[max(env(safe-area-inset-bottom),0.35rem)] pt-1 px-1.5 transition-all select-none"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto h-14">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;

          // Special Center Action Button (e.g. "Buat Tiket" for Pelapor)
          if (item.isCenterAction) {
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="flex flex-col items-center justify-center -mt-5 group focus:outline-none cursor-pointer"
                aria-label={item.label}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md border-2 border-white transition-all active:scale-95 ${
                    isActive
                      ? 'bg-gradient-to-br from-[#0A3D73] to-[#1765B3] ring-2 ring-[#2589E8]'
                      : 'bg-gradient-to-br from-[#0A3D73] via-[#1765B3] to-[#2589E8] group-hover:brightness-110'
                  }`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span
                  className={`text-[10px] mt-1 font-bold tracking-tight truncate max-w-[64px] ${
                    isActive ? 'text-[#0A3D73]' : 'text-slate-600'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer relative active:scale-95 focus:outline-none min-w-0 ${
                isActive
                  ? 'text-[#0A3D73]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {/* Active top indicator pill */}
              {isActive && (
                <span className="w-6 h-1 rounded-full bg-[#2589E8] absolute -top-1" />
              )}

              {/* Icon Container with Badge */}
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 text-[#0A3D73]' : 'text-slate-500'
                  }`}
                />

                {/* Badge Counter */}
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full min-w-[16px] text-center font-mono-numbers shadow-2xs border border-white">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] mt-1 tracking-tight truncate max-w-full font-medium ${
                  isActive ? 'font-bold text-[#0A3D73]' : 'text-slate-500'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
