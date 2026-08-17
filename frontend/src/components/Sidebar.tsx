/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  Home,
  Users,
  Box,
  Wrench,
  Utensils,
  Settings,
  X,
  Sparkles,
  ShieldAlert,
  LogOut,
} from 'lucide-react';
import { CampusTreeIcon } from './CampusTreeIcon';
import { PageView } from '../types';
import { useAppState } from '../AppContext';

interface SidebarProps {
  currentView: PageView;
  setView: (view: PageView) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isOpen, onClose }) => {
  const { hostelName, maintenance, students, currentUser, logoutUser } = useAppState();

  const pendingMaintenanceCount = maintenance.filter((m) => m.status !== 'Completed').length;
  const unallottedStudentsCount = students.filter((s) => s.roomNumber === null).length;

  const menuItems = [
    {
      id: 'dashboard' as PageView,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'rooms' as PageView,
      label: 'Rooms & Beds',
      icon: Home,
      badge: null,
    },
    {
      id: 'students' as PageView,
      label: 'Students Registry',
      icon: Users,
      badge: unallottedStudentsCount > 0 ? { text: `${unallottedStudentsCount} pending`, type: 'warning' } : null,
    },
    {
      id: 'inventory' as PageView,
      label: 'Inventory Asset Log',
      icon: Box,
      badge: null,
    },
    {
      id: 'maintenance' as PageView,
      label: 'Maintenance Board',
      icon: Wrench,
      badge: pendingMaintenanceCount > 0 ? { text: `${pendingMaintenanceCount}`, type: 'danger' } : null,
    },
    {
      id: 'mess' as PageView,
      label: 'Mess Inventory',
      icon: Utensils,
      badge: null,
    },
    {
      id: 'settings' as PageView,
      label: 'Staff Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div
          id="sidebar-overlay"
          className="fixed inset-0 z-40 bg-zinc-900/30 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        id="sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-68 flex-col border-r border-slate-200 bg-white transition-transform duration-200 md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Workspace Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-gold-light bg-warm-white text-[#567A5E] shadow-xs font-bold">
              <CampusTreeIcon className="h-5 w-5 text-[#567A5E]" />
            </div>
            <div className="overflow-hidden">
              <h1 className="truncate font-serif text-sm font-bold text-charcoal">
                {hostelName}
              </h1>
              <p className="font-mono text-[9px] tracking-wider text-blue-gray-medium uppercase">
                Admin Console
              </p>
            </div>
          </div>
          <button
            id="close-sidebar-btn"
            onClick={onClose}
            className="rounded-full p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 md:hidden"
            aria-label="Close Sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="px-2 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Workspace Pages
          </div>
          <nav className="space-y-0.5">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  id={`nav-item-${item.id}`}
                  key={item.id}
                  onClick={() => {
                    setView(item.id);
                    onClose();
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-gold-light/15 text-charcoal border-l-2 border-gold-accent rounded-l-none'
                      : 'text-blue-gray-medium hover:bg-warm-white hover:text-charcoal'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <IconComponent
                      className={`h-4 w-4 transition-colors ${
                        isActive ? 'text-charcoal' : 'text-blue-gray-medium/60 group-hover:text-charcoal'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold leading-tight ${
                        item.badge.type === 'danger'
                          ? 'bg-red-50 text-red-600 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {item.badge.text}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Notice Panel */}
          {pendingMaintenanceCount > 2 && (
            <div className="mt-8 rounded-lg border border-red-100 bg-red-50/50 p-3">
              <div className="flex gap-2">
                <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-red-600 animate-pulse" />
                <div>
                  <h4 className="text-xs font-semibold text-red-800">Action Required</h4>
                  <p className="mt-1 font-sans text-[11px] leading-relaxed text-red-600">
                    There are {pendingMaintenanceCount} outstanding maintenance tickets. Consider assigning technicians.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Footer Account Segment */}
        <div className="border-t border-slate-200 bg-slate-50 p-3.5">
          <div className="flex items-center justify-between gap-1.5 flex-wrap">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-100 font-bold font-mono text-xs">
                {currentUser?.name ? currentUser.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'AD'}
                <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-white bg-green-500" />
              </div>
              <div className="overflow-hidden">
                <h4 className="truncate text-xs font-bold text-slate-850 leading-tight">
                  {currentUser?.name || 'Administrator'}
                </h4>
                <p className="truncate font-mono text-[9px] text-slate-400">
                  {currentUser?.role === 'Head' ? 'Hostel Head' : 'Staff Caretaker'}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => logoutUser()}
              className="rounded-lg p-1.5 text-slate-450 hover:bg-slate-200/50 hover:text-slate-700 transition cursor-pointer"
              title="Sign Out Session"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
