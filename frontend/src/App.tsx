import React, { useState, useEffect } from 'react';
import { AppProvider, useAppState } from './AppContext';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { Dashboard } from './components/Dashboard';
import { RoomsPage } from './components/RoomsPage';
import { StudentsPage } from './components/StudentsPage';
import { InventoryPage } from './components/InventoryPage';
import { MaintenancePage } from './components/MaintenancePage';
import { MessSuppliesPage } from './components/MessSuppliesPage';
import { SettingsPage } from './components/SettingsPage';
import { LoginPage } from './components/LoginPage';
import { StudentPortal } from './components/StudentPortal';
import { ToastContainer } from './components/ToastContainer';
import { PageView } from './types';

function AppContent() {
  const [currentView, setView] = useState<PageView>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { addLog, currentUser, authLoading, toasts, removeToast, selectedTheme } = useAppState();

  useEffect(() => {
    // Remove existing theme classes
    document.body.className.split(' ').forEach((c) => {
      if (c.startsWith('theme-')) {
        document.body.classList.remove(c);
      }
    });
    // Add active theme class
    document.body.classList.add(`theme-${selectedTheme}`);
  }, [selectedTheme]);

  const handleQuickAction = (actionType: 'room' | 'student' | 'maintenance') => {
    if (actionType === 'student') {
      setView('students');
      addLog('Navigated to register a new student allotment', 'info');
    } else if (actionType === 'room') {
      setView('rooms');
      addLog('Navigated to register a new room details block', 'info');
    } else if (actionType === 'maintenance') {
      setView('maintenance');
      addLog('Navigated to raise a maintenance work order', 'info');
    }
  };

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard setView={setView} />;
      case 'rooms':
        return <RoomsPage />;
      case 'students':
        return <StudentsPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'maintenance':
        return <MaintenancePage />;
      case 'mess':
        return <MessSuppliesPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard setView={setView} />;
    }
  };

  const renderLayout = () => {
    if (authLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-warm-white text-sm text-blue-gray-medium">
          Checking your session…
        </div>
      );
    }

    if (!currentUser) {
      return <LoginPage />;
    }

    if (currentUser.role === 'Student') {
      return <StudentPortal />;
    }

    return (
      <div id="app-root-layout" className="flex min-h-screen w-full bg-slate-50 text-slate-900 overflow-x-hidden antialiased">
        {/* Sidebar Navigation Drawer */}
        <Sidebar
          currentView={currentView}
          setView={setView}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Right Workspace Column */}
        <div className="flex flex-1 flex-col min-w-0">
          <TopNavbar
            currentView={currentView}
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onQuickAction={handleQuickAction}
          />

          {/* Workspace Content Stage */}
          <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
            {renderActiveView()}
          </main>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderLayout()}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}


export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
