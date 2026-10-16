/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { storageService } from './services/storageService';
import { authService } from './services/authService';
import { User, Ticket, Category } from './types';
import { TopNavbar } from './components/layout/TopNavbar';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNavbar } from './components/layout/BottomNavbar';

// Views
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { TicketListView } from './views/TicketListView';
import { CreateTicketView } from './views/CreateTicketView';
import { TicketDetailView } from './views/TicketDetailView';
import { PicManagementView } from './views/PicManagementView';
import { UserManagementView } from './views/UserManagementView';
import { CategoryManagementView } from './views/CategoryManagementView';
import { SlaManagementView } from './views/SlaManagementView';
import { AutoAssignmentSettingsView } from './views/AutoAssignmentSettingsView';
import { ReportsAnalyticsView } from './views/ReportsAnalyticsView';
import { AuditLogView } from './views/AuditLogView';
import { NotificationView } from './views/NotificationView';
import { ProfileView } from './views/ProfileView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => authService.getCurrentSession());
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>(() => storageService.getTickets());
  const [categories, setCategories] = useState<Category[]>(() => storageService.getCategories());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const mainScrollRef = useRef<HTMLElement>(null);
  const modalScrollRef = useRef<HTMLDivElement>(null);

  // Sync data whenever storageService or authService updates
  const refreshAppData = () => {
    setTickets(storageService.getTickets());
    setCategories(storageService.getCategories());
    const session = authService.getCurrentSession();
    setCurrentUser(session);
  };

  useEffect(() => {
    refreshAppData();
    const unsubStorage = storageService.subscribe(refreshAppData);
    const unsubAuth = authService.subscribe(refreshAppData);
    return () => {
      unsubStorage();
      unsubAuth();
    };
  }, []);

  // Role permissions check
  const isAdmin = currentUser?.role === 'admin';
  const isManajemen = currentUser?.role === 'manajemen';
  const isPic = currentUser?.role === 'pic';
  const isPelapor = currentUser?.role === 'pelapor';

  // Instant scroll reset whenever currentView changes
  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentView]);

  // Reset scroll inside pop-up modal when viewing another ticket
  useEffect(() => {
    if (selectedTicketId && modalScrollRef.current) {
      modalScrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [selectedTicketId]);

  // ESC key listener to close detail pop-up modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedTicketId) {
        setSelectedTicketId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTicketId]);

  // Ensure currentView is never orphaned on 'ticket-detail'
  useEffect(() => {
    if (currentView === 'ticket-detail') {
      setCurrentView(isAdmin || isManajemen ? 'all-tickets' : isPic ? 'my-assignments' : 'my-tickets');
    }
  }, [currentView, isAdmin, isManajemen, isPic]);

  const handleNavigate = (view: string, ticketId?: string) => {
    setIsMobileMenuOpen(false);
    if (ticketId) {
      // Display detail strictly inside pop-up modal, keeping underlying view & scroll position intact
      setSelectedTicketId(ticketId);
      if (currentView === 'ticket-detail') {
        setCurrentView(isAdmin || isManajemen ? 'all-tickets' : isPic ? 'my-assignments' : 'my-tickets');
      }
    } else if (view !== 'ticket-detail') {
      setSelectedTicketId(null);
      setCurrentView(view);
    }
  };

  const handleGlobalSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.uid === 'user-admin-user' || user.email === 'admin.user@pln-corpu.co.id') {
      setCurrentView('user-management');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setCurrentView('dashboard');
    setSelectedTicketId(null);
    setIsMobileMenuOpen(false);
  };

  // If NOT authenticated, strictly present the Login Screen
  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  // Active ticket for the pop-up modal preview
  const modalTicket = selectedTicketId ? tickets.find((t) => t.id === selectedTicketId) : null;

  // Badge counters scoped strictly to user
  const myTicketsCount = tickets.filter((t) => t.reporterId === currentUser.uid).length;
  const assignedTicketsCount = tickets.filter((t) => t.currentPicId === currentUser.uid).length;
  const notificationsCount = storageService
    .getNotifications(currentUser.uid)
    .filter((n) => !n.isRead).length;

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F8FAFC] flex flex-col text-[#0F172A]">
      {/* Top Header */}
      <TopNavbar
        currentUser={currentUser}
        onNavigate={handleNavigate}
        onSearch={handleGlobalSearch}
        onLogout={handleLogout}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
      />

      <div className="flex-1 flex overflow-hidden min-h-0 min-w-0">
        {/* Left Sidebar Navigation */}
        <Sidebar
          currentView={currentView}
          onNavigate={handleNavigate}
          currentUser={currentUser}
          counts={{
            allTickets: isAdmin || isManajemen ? tickets.length : isPic ? assignedTicketsCount : myTicketsCount,
            myTickets: myTicketsCount,
            assignedTickets: assignedTicketsCount,
            notifications: notificationsCount,
          }}
          onLogout={handleLogout}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Viewport with Safe Bottom Padding for Mobile Nav */}
        <main
          ref={mainScrollRef}
          className={`flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 lg:p-7 min-h-0 min-w-0 custom-scrollbar ${
            !isAdmin ? 'pb-24 lg:pb-7' : 'pb-6 lg:pb-7'
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              {currentView === 'dashboard' && (
                <DashboardView
                  tickets={tickets}
                  currentUser={currentUser}
                  onNavigate={handleNavigate}
                />
              )}

              {/* All Tickets - Admin and Manajemen */}
              {currentView === 'all-tickets' && (isAdmin || isManajemen) && (
                <TicketListView
                  mode="all"
                  tickets={tickets}
                  currentUser={currentUser}
                  onNavigate={handleNavigate}
                  initialSearch={searchQuery}
                />
              )}

              {/* My Tickets - Pelapor or Admin */}
              {currentView === 'my-tickets' && (
                <TicketListView
                  mode="my-tickets"
                  tickets={tickets}
                  currentUser={currentUser}
                  onNavigate={handleNavigate}
                  initialSearch={searchQuery}
                />
              )}

              {/* My Assignments - PIC or Admin */}
              {currentView === 'my-assignments' && (isPic || isAdmin) && (
                <TicketListView
                  mode="my-assignments"
                  tickets={tickets}
                  currentUser={currentUser}
                  onNavigate={handleNavigate}
                  initialSearch={searchQuery}
                />
              )}

              {/* Create Ticket - Pelapor or Admin */}
              {currentView === 'create-ticket' && (isPelapor || isAdmin) && (
                <CreateTicketView
                  currentUser={currentUser}
                  categories={categories}
                  onNavigate={handleNavigate}
                />
              )}

              {/* Admin & Manajemen Management Views */}
              {currentView === 'pic-management' && (isAdmin || isManajemen) && (
                <PicManagementView
                  tickets={tickets}
                  currentUser={currentUser}
                  onNavigate={handleNavigate}
                />
              )}

              {currentView === 'user-management' && isAdmin && (
                <UserManagementView currentUser={currentUser} />
              )}

              {currentView === 'category-management' && isAdmin && <CategoryManagementView />}

              {currentView === 'sla-management' && isAdmin && <SlaManagementView />}

              {currentView === 'auto-assignment' && isAdmin && (
                <AutoAssignmentSettingsView currentUser={currentUser} />
              )}

              {/* Reports - Admin, Manajemen, or PIC */}
              {currentView === 'reports' && (isAdmin || isPic || isManajemen) && (
                <ReportsAnalyticsView tickets={tickets} categories={categories} />
              )}

              {/* Audit Log - Admin & Manajemen */}
              {currentView === 'audit-log' && (isAdmin || isManajemen) && (
                <AuditLogView onNavigate={handleNavigate} />
              )}

              {/* Notifications - All Authenticated Users */}
              {currentView === 'notifications' && (
                <NotificationView currentUser={currentUser} onNavigate={handleNavigate} />
              )}

              {/* Profile - All Authenticated Users */}
              {currentView === 'profile' && (
                <ProfileView
                  currentUser={currentUser}
                  tickets={tickets}
                  onNavigate={handleNavigate}
                  onLogout={handleLogout}
                />
              )}

              {/* Settings - Admin only */}
              {currentView === 'settings' && isAdmin && <SettingsView />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Modern Bottom Navigation Bar for Non-Admin Roles on Mobile */}
      {!isAdmin && (
        <BottomNavbar
          currentView={currentView}
          onNavigate={handleNavigate}
          currentUser={currentUser}
          counts={{
            allTickets: isAdmin || isManajemen ? tickets.length : isPic ? assignedTicketsCount : myTicketsCount,
            myTickets: myTicketsCount,
            assignedTickets: assignedTicketsCount,
            notifications: notificationsCount,
          }}
        />
      )}

      {/* Ticket Detail Pop-up Modal with Smooth Spring Animation */}
      <AnimatePresence>
        {selectedTicketId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6">
            {/* Backdrop with Blur and Fade */}
            <motion.div
              key="modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedTicketId(null)}
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs cursor-pointer"
              aria-hidden="true"
            />

            {/* Modal Window Container */}
            <motion.div
              key="modal-panel"
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320, mass: 0.8 }}
              className="relative w-full max-w-6xl h-[95vh] sm:h-[90vh] bg-[#F8FAFC] rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden z-10"
              role="dialog"
              aria-modal="true"
            >
              {/* Modal Top Header Bar */}
              <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 bg-white border-b border-slate-200/80 shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="px-2 py-0.5 text-xs font-mono font-bold bg-[#0A3D73]/10 text-[#0A3D73] rounded-md shrink-0">
                    Pop-up Detail
                  </span>
                  {modalTicket && (
                    <span className="font-mono-numbers font-black text-sm text-[#0A3D73] shrink-0">
                      #{modalTicket.ticketNumber}
                    </span>
                  )}
                  <span className="text-slate-300 hidden sm:inline">•</span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800 truncate hidden sm:inline max-w-md lg:max-w-xl">
                    {modalTicket?.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-mono text-slate-500 bg-slate-100 rounded border border-slate-200">
                    Esc untuk tutup
                  </span>
                  <button
                    onClick={() => setSelectedTicketId(null)}
                    aria-label="Tutup Pop-up Detail"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Modal Content */}
              <div
                ref={modalScrollRef}
                className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 lg:p-6 custom-scrollbar"
              >
                <TicketDetailView
                  ticketId={selectedTicketId}
                  currentUser={currentUser}
                  onNavigate={handleNavigate}
                  onBack={() => setSelectedTicketId(null)}
                  isModal={true}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
