/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { storageService } from './services/storageService';
import { authService } from './services/authService';
import { User, Ticket, Category } from './types';
import { TopNavbar } from './components/layout/TopNavbar';
import { Sidebar } from './components/layout/Sidebar';

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

  const handleNavigate = (view: string, ticketId?: string) => {
    setIsMobileMenuOpen(false);
    if (ticketId) {
      setSelectedTicketId(ticketId);
      setCurrentView('ticket-detail');
    } else {
      setCurrentView(view);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Role permissions check
  const isAdmin = currentUser.role === 'admin';
  const isManajemen = currentUser.role === 'manajemen';
  const isPic = currentUser.role === 'pic';
  const isPelapor = currentUser.role === 'pelapor';

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

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 lg:p-7 min-h-0 min-w-0 custom-scrollbar">
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

          {/* Ticket Detail - Protected by internal access checker */}
          {currentView === 'ticket-detail' && selectedTicketId && (
            <TicketDetailView
              ticketId={selectedTicketId}
              currentUser={currentUser}
              onNavigate={handleNavigate}
              onBack={() =>
                handleNavigate(isPelapor ? 'my-tickets' : isPic ? 'my-assignments' : 'all-tickets')
              }
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
            />
          )}

          {/* Settings - Admin only */}
          {currentView === 'settings' && isAdmin && <SettingsView />}
        </main>
      </div>
    </div>
  );
}
