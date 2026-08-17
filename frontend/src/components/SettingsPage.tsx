/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Settings,
  Building,
  User,
  Check,
  RotateCcw,
  AlertTriangle,
  Mail,
  Phone,
} from 'lucide-react';
import { useAppState } from '../AppContext';

export const SettingsPage: React.FC = () => {
  const {
    hostelName,
    setHostelName,
    contactEmail,
    setContactEmail,
    contactPhone,
    setContactPhone,
    addLog,
    selectedTheme,
    setSelectedTheme,
    showToast,
    currentUser,
    updateUserProfile,
  } = useAppState();

  // local formulation copy to avoid lagging on sidebar updates
  const [localName, setLocalName] = useState(hostelName);
  const [localEmail, setLocalEmail] = useState(contactEmail);
  const [localPhone, setLocalPhone] = useState(contactPhone);
  
  // profile states (preloaded/synced via updateUserProfile)
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');
  const [profilePic, setProfilePic] = useState(currentUser?.profilePic || 'bg-zinc-850');
  
  const [successMsg, setSuccessMsg] = useState('');

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');

    if (!localName.trim()) return;
    
    setHostelName(localName.trim());
    setContactEmail(localEmail.trim());
    setContactPhone(localPhone.trim());
    
    setSuccessMsg('System properties updated successfully!');
    addLog(`Hostel properties modified. Name set to "${localName.trim()}"`, 'success');
    
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      showToast('Name is required.', 'error');
      return;
    }
    updateUserProfile(profileName.trim(), profilePhone.trim(), undefined, profilePic);
    setSuccessMsg('Your profile has been saved successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleResetData = () => {
    if (window.confirm('WARNING: Are you sure you want to reset ALL database partitions? This will evict all custom registered students, room allocations, pantry edits, and reset logs to default values.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const themePresets = [
    { id: 'swiss', name: 'Swiss Minimalist', desc: 'Off-white canvases and elegant modern grid spacing.', colors: ['bg-zinc-100', 'bg-zinc-900'] },
    { id: 'slate', name: 'Cosmic Charcoal', desc: 'Sleek metal finishes with neon status markers.', colors: ['bg-slate-100', 'bg-sky-500'] },
    { id: 'warm', name: 'Warm Sepia/Notion', desc: 'Sand hues paired with pleasant warm wood board looks.', colors: ['bg-amber-50', 'bg-stone-800'] },
    { id: 'forest', name: 'Forest Spruce', desc: 'Organic green highlights for a natural campus atmosphere.', colors: ['bg-emerald-50', 'bg-emerald-800'] },
  ];

  const avatarsList = [
    { id: 'bg-zinc-850', label: 'Slate Gray' },
    { id: 'bg-indigo-600', label: 'Royal Blue' },
    { id: 'bg-emerald-600', label: 'Forest Green' },
    { id: 'bg-rose-500', label: 'Rose Red' },
    { id: 'bg-amber-500', label: 'Warm Orange' },
  ];

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'YA';
  };

  const isStaff = currentUser?.role === 'Staff';

  return (
    <div className="space-y-6">
      
      {successMsg && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-3.5 text-xs font-semibold text-green-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <Check className="h-4.5 w-4.5 text-green-500 grow-0 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* General Hostel Properties configuration form (Admin Head only) */}
        {!isStaff && (
          <div className="rounded-xl border border-zinc-200 bg-white p-5 lg:col-span-2 space-y-5">
            <div className="border-b border-zinc-150 pb-3 flex items-center gap-2">
              <Building className="h-4.5 w-4.5 text-zinc-400" />
              <h3 className="font-sans text-sm.5 font-extrabold text-zinc-900 font-bold">Hostel Identity Specifications</h3>
            </div>

            <form onSubmit={handleSaveGeneral} className="space-y-4">
              
              {/* Name */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-505 uppercase tracking-wide mb-1.5 font-bold">
                  Official Hostel Name
                </label>
                <input
                  id="settings-hostel-name"
                  type="text"
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-250 px-3 py-1.5 text-xs text-zinc-900 focus:border-zinc-800 focus:outline-hidden"
                />
              </div>

              {/* Layout Grid split phone and email */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-505 uppercase tracking-wide mb-1.5 font-bold">
                    Helpline Contact Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute top-2.5 left-2.5 h-3.5 w-3.5 text-zinc-400" />
                    <input
                      id="settings-hostel-email"
                      type="email"
                      value={localEmail}
                      onChange={(e) => setLocalEmail(e.target.value)}
                      className="w-full rounded-lg border border-zinc-250 py-1.5 pr-3 pl-8.5 text-xs text-zinc-905 focus:border-zinc-800 focus:outline-hidden"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-505 uppercase tracking-wide mb-1.5 font-bold">
                    Helpline Telephone
                  </label>
                  <div className="relative">
                    <Phone className="absolute top-2.5 left-2.5 h-3.5 w-3.5 text-zinc-400" />
                    <input
                      id="settings-hostel-phone"
                      type="text"
                      value={localPhone}
                      onChange={(e) => setLocalPhone(e.target.value)}
                      className="w-full rounded-lg border border-zinc-250 py-1.5 pr-3 pl-8.5 text-xs text-zinc-905 focus:border-zinc-800 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  id="save-general-settings-btn"
                  type="submit"
                  className="rounded-lg bg-zinc-950 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-805 cursor-pointer transition shadow-2xs"
                >
                  Save General Properties
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Profile Superintendent Info Card (Editable Form for both, full width if isStaff) */}
        <div className={`rounded-xl border border-zinc-200 bg-white p-5 space-y-5 ${isStaff ? 'lg:col-span-3' : ''}`}>
          <div className="border-b border-zinc-150 pb-3 flex items-center gap-2">
            <User className="h-4.5 w-4.5 text-zinc-400" />
            <h3 className="font-sans text-sm.5 font-bold text-zinc-900 font-bold">
              {isStaff ? 'Personal Staff Profile' : 'Superintendent Profile'}
            </h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="flex flex-col items-center text-center space-y-3 pt-2">
              <div className={`relative flex h-20 w-20 items-center justify-center rounded-full ${profilePic} text-white font-sans text-2xl font-bold shadow-md border-4 border-zinc-100`}>
                {getInitials(profileName || 'Staff')}
                <div className="absolute bottom-0 right-1 h-4.5 w-4.5 rounded-full border-2 border-white bg-green-500" />
              </div>
              
              <div className="w-full">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                  Choose Profile Theme / Picture Icon
                </label>
                <div className="flex justify-center gap-2.5 mt-1.5">
                  {avatarsList.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setProfilePic(av.id)}
                      className={`h-6 w-6 rounded-full ${av.id} border hover:scale-105 transition ${
                        profilePic === av.id ? 'border-zinc-950 ring-2 ring-zinc-200' : 'border-transparent'
                      }`}
                      title={av.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Profile fields */}
            <div className="space-y-3.5 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-zinc-505 uppercase tracking-wide mb-1 font-bold">
                  Display Full Name
                </label>
                <input
                  id="profile-edit-name"
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-250 px-3 py-1.5 text-xs text-zinc-900 focus:border-zinc-800 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-505 uppercase tracking-wide mb-1 font-bold">
                  Direct Contact Helpline
                </label>
                <input
                  id="profile-edit-phone"
                  type="text"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full rounded-lg border border-zinc-250 px-3 py-1.5 text-xs text-zinc-900 focus:border-zinc-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-505 uppercase tracking-wide mb-1 font-bold">
                  Password
                </label>
                <p className="text-[11px] text-zinc-500 leading-relaxed bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2">
                  To change your password, sign out and use <span className="font-semibold">"Forgot passcode?"</span> on the login screen — it's verified against your account securely.
                </p>
              </div>

              <div className="pt-2">
                <button
                  id="save-profile-edit-btn"
                  type="submit"
                  className="w-full rounded-lg bg-zinc-900 py-2 text-xs font-semibold text-white hover:bg-zinc-800 cursor-pointer transition shadow-2xs"
                >
                  Save Profile Settings
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Visual appearance Presets selecting blocks (Head only) */}
        {!isStaff && (
          <div className="rounded-xl border border-zinc-200 bg-white p-5 lg:col-span-2 space-y-4">
            <div className="border-b border-zinc-150 pb-3">
              <h3 className="font-sans text-sm.5 font-extrabold text-zinc-900 font-bold">Custom Visual Themes</h3>
              <p className="font-sans text-xs text-zinc-400 mt-1">
                Select an editor look to dress the administrative layout palette (Interactive Theme Selector)
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 pt-1">
              {themePresets.map((theme) => {
                const isSelected = selectedTheme === theme.id;
                return (
                  <div
                    id={`theme-card-${theme.id}`}
                    key={theme.id}
                    onClick={() => {
                      setSelectedTheme(theme.id);
                      addLog(`Theme changed to ${theme.name}`, 'success');
                      showToast(`Successfully applied ${theme.name} layout theme!`, 'success');
                    }}
                    className={`rounded-xl border p-3 cursor-pointer transition-all flex items-start gap-3.5 relative hover:border-zinc-400 ${
                      isSelected ? 'border-zinc-950 bg-zinc-50' : 'border-zinc-200'
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-zinc-200">
                      <div className={`w-1/2 ${theme.colors[0]}`} />
                      <div className={`w-1/2 ${theme.colors[1]}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-sans text-xs font-bold text-zinc-900 truncate font-bold">{theme.name}</h4>
                      <p className="font-sans text-[11px] leading-relaxed text-zinc-400 mt-0.5">{theme.desc}</p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-zinc-900 text-white">
                        <Check className="h-3 w-3 block" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Developer diagnostics module (Head only) */}
        {!isStaff && (
          <div className="rounded-xl border border-red-150 bg-red-50/15 p-5 space-y-4.5 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-red-750">
                <AlertTriangle className="h-4.5 w-4.5" />
                <h3 className="font-sans text-sm.5 font-extrabold font-bold">Dangerous Operations</h3>
              </div>
              <p className="font-sans text-xs leading-relaxed text-zinc-505">
                Resetting local data blocks clears the browser session completely and restores the hostel registry database back to default initial profiles. Any custom-made modifications will be permanently erased.
              </p>
            </div>

            <div className="pt-2">
              <button
                id="reset-database-trigger-btn"
                onClick={handleResetData}
                className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3.5 py-2.5 text-xs font-bold text-red-650 hover:bg-red-50 hover:text-red-800 transition"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Full Database Hard Reset</span>
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
