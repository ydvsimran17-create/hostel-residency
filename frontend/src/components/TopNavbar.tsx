/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Menu,
  Bell,
  Clock,
  Plus,
  Wrench,
  UserPlus,
  Home,
  RefreshCw,
} from 'lucide-react';
import { PageView } from '../types';
import { useAppState } from '../AppContext';

interface TopNavbarProps {
  currentView: PageView;
  onOpenSidebar: () => void;
  onQuickAction: (actionType: 'room' | 'student' | 'maintenance') => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  currentView,
  onOpenSidebar,
  onQuickAction,
}) => {
  const {
    notifications,
    refreshAllData,
    markNotificationAsRead,
    clearAllNotifications,
  } = useAppState();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const [time, setTime] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Set simulated system time relative to the container runtime environment metadata
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshAllData();
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatNotificationTime = (createdAt: string) => {
    const date = new Date(createdAt);
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPageTitle = (view: PageView) => {
    switch (view) {
      case 'dashboard':
        return 'Overview Dashboard';
      case 'rooms':
        return 'Hostel Rooms & Beds';
      case 'students':
        return 'Student Registrations';
      case 'inventory':
        return 'Asset Log & Logistics';
      case 'maintenance':
        return 'Maintenance Tickets';
      case 'mess':
        return 'Mess Stores & Pantry';
      case 'settings':
        return 'System Preferences';
      default:
        return 'Hostel Admin';
    }
  };

  return (
    <header
      id="top-navbar"
      className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-ivory bg-white/95 px-4 backdrop-blur-md md:px-8 shadow-xs"
    >
      <div className="flex items-center gap-3">
        <button
          id="open-sidebar-btn"
          onClick={onOpenSidebar}
          className="rounded-lg p-1.5 text-charcoal hover:bg-warm-white hover:text-black md:hidden"
          aria-label="Open Sidebar"
        >
          <Menu className="h-5.5 w-5.5" />
        </button>
        <div>
          <h2 className="font-serif text-lg font-bold leading-tight text-charcoal tracking-wide md:text-xl">
            {getPageTitle(currentView)}
          </h2>
          <div className="hidden items-center gap-1.5 md:flex">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-accent opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold-accent"></span>
            </span>
            <span className="font-mono text-[9px] text-blue-gray-medium font-bold uppercase tracking-wider">Database Connected &bull; Sync Live</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Real-time system clock */}
        <div className="hidden items-center gap-2 rounded-lg bg-warm-white border border-ivory px-2.5 py-1 font-mono text-xs text-blue-gray-medium sm:flex">
          <Clock className="h-3.5 w-3.5 text-gold-accent" />
          <span>{time || '11:19 AM'}</span>
        </div>

        {/* Sync Trigger button */}
        <button
          id="sync-database-btn"
          onClick={handleRefresh}
          className="rounded-lg border border-ivory bg-white p-2 text-blue-gray-medium cursor-pointer hover:bg-warm-white hover:text-charcoal transition"
          title="Force Database Sync"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-charcoal' : ''}`} />
        </button>

        {/* Quick actions popup panel */}
        <div className="relative group">
          <button
            id="quick-actions-btn"
            className="flex items-center gap-1 cursor-pointer rounded-lg bg-charcoal px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-black"
          >
            <Plus className="h-4 w-4 text-gold-accent" />
            <span className="hidden sm:inline">Add New</span>
          </button>
          
          <div id="quick-actions-dropdown" className="absolute right-0 top-full mt-1.5 hidden w-48 origin-top-right rounded-lg border border-ivory bg-white p-1.5 shadow-xs group-hover:block hover:block">
            <div className="px-2 py-1 text-[9px] font-bold text-blue-gray-medium uppercase tracking-wider">Quick Actions</div>
            <button
              id="quick-action-student-btn"
              onClick={() => onQuickAction('student')}
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs text-blue-gray-medium hover:bg-warm-white hover:text-charcoal font-semibold"
            >
              <UserPlus className="h-3.5 w-3.5 text-gold-accent" />
              <span>Allot New Student</span>
            </button>
            <button
              id="quick-action-room-btn"
              onClick={() => onQuickAction('room')}
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs text-blue-gray-medium hover:bg-warm-white hover:text-charcoal font-semibold"
            >
              <Home className="h-3.5 w-3.5 text-gold-accent" />
              <span>Register New Room</span>
            </button>
            <button
              id="quick-action-maintenance-btn"
              onClick={() => onQuickAction('maintenance')}
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs text-blue-gray-medium hover:bg-warm-white hover:text-charcoal font-semibold"
            >
              <Wrench className="h-3.5 w-3.5 text-gold-accent" />
              <span>File Maintenance Ticket</span>
            </button>
          </div>
        </div>

        {/* Alert Notifications Center */}
        <div className="relative">
          <button
            id="notification-center-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative cursor-pointer rounded-lg border border-ivory bg-white p-2 text-blue-gray-medium hover:bg-warm-white hover:text-charcoal"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-gold-accent"></span>
            )}
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-35"
                onClick={() => setShowNotifications(false)}
              />
              <div id="notifications-dropdown" className="absolute right-0 top-full mt-2 z-40 w-80 rounded-xl border border-ivory bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-ivory pb-2">
                  <h3 className="text-xs font-bold text-charcoal">Push Notifications</h3>
                  <button
                    onClick={() => {
                      clearAllNotifications();
                      setShowNotifications(false);
                    }}
                    className="text-[10px] text-blue-gray-medium hover:text-charcoal font-semibold"
                  >
                    Clear all
                  </button>
                </div>
                <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-blue-gray-medium px-1.5 py-2">No notifications yet.</p>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => markNotificationAsRead(notification.id)}
                        className="flex w-full gap-2 rounded-lg p-1.5 text-left text-xs hover:bg-warm-white/60"
                      >
                        <span
                          className={`h-2 w-2 mt-1.5 shrink-0 rounded-full ${
                            notification.isRead ? 'bg-blue-gray-medium/40' : 'bg-gold-accent'
                          }`}
                        ></span>
                        <div>
                          <p className="font-semibold text-charcoal">{notification.title}</p>
                          <p className="text-blue-gray-medium">{notification.message}</p>
                          <span className="font-mono text-[9px] text-blue-gray-medium/70">
                            {formatNotificationTime(notification.createdAt)}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
