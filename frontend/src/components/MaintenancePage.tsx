/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  Play,
  AlertTriangle,
  User,
  Activity,
  UserPlus,
  HelpCircle,
  Building,
  Search,
} from 'lucide-react';
import { useAppState } from '../AppContext';
import { MaintenanceRequest } from '../types';

export const MaintenancePage: React.FC = () => {
  const {
    maintenance,
    addMaintenanceRequest,
    updateMaintenanceStatus,
    assignMaintenanceWorker,
    deleteMaintenanceRequest,
    currentUser,
  } = useAppState();

  // Create Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Create Modal form fields
  const [title, setTitle] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [category, setCategory] = useState<'Electrical' | 'Plumbing' | 'Furniture' | 'Appliance' | 'Other'>('Electrical');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [raisedBy, setRaisedBy] = useState('');
  const [formError, setFormError] = useState('');

  // Filtering + Searching States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Inline worker assignment panel selector
  const [assigningRequestId, setAssigningRequestId] = useState<string | null>(null);

  // Confirmation state for deleting a ticket
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const techniciansList = [
    'John Mechanic (Plumber)',
    'Sarah (IT Admin / Wifi)',
    'Robert Carpenter (Woodwork)',
    'Electric Pro (Electrician)',
    'Alfred (General Janitor)',
  ];

  const handleOpenAdd = () => {
    setTitle('');
    setRoomNumber('');
    setCategory('Electrical');
    setDescription('');
    setPriority('Medium');
    setRaisedBy('Student Residing');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('Ticket title is required.');
      return;
    }
    if (!roomNumber.trim()) {
      setFormError('Room or location is required.');
      return;
    }
    if (!description.trim()) {
      setFormError('Issue description is required.');
      return;
    }

    addMaintenanceRequest({
      title: title.trim(),
      roomNumber: roomNumber.toUpperCase().trim(),
      category,
      description: description.trim(),
      priority,
      raisedBy: raisedBy.trim() || 'Staff Reporter',
    });

    setIsModalOpen(false);
  };

  const handleDeleteRequest = (id: string) => {
    setDeleteConfirmId(id);
  };

  // Filter application
  const filteredRequests = maintenance.filter((req) => {
    const matchesSearch =
      req.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority = filterPriority === 'All' || req.priority === filterPriority;
    const matchesStatus = filterStatus === 'All' || req.status === filterStatus;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  // KPI calculations
  const totalTickets = maintenance.length;
  const pendingCount = maintenance.filter((m) => m.status === 'Pending').length;
  const progressCount = maintenance.filter((m) => m.status === 'In Progress').length;
  const resolvedCount = maintenance.filter((m) => m.status === 'Completed').length;

  const getPriorityBadgeClass = (lvl: string) => {
    switch (lvl) {
      case 'Critical':
        return 'bg-red-50 text-red-700 border-red-200 animate-pulse';
      case 'High':
        return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'Medium':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      default:
        return 'bg-zinc-100 text-zinc-500 border-zinc-200';
    }
  };

  const getStatusBadgeClass = (st: string) => {
    switch (st) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-yellow-50 text-yellow-750 border-yellow-250';
    }
  };

  return (
    <div className="space-y-6">
      {/* Dynamic visual dashboard summary */}
      <div className="grid grid-cols-2 gap-4 rounded-xl border border-zinc-200 bg-white p-4 sm:grid-cols-4">
        <div>
          <span className="block font-mono text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Total Tickets Raised</span>
          <span className="font-sans text-xl font-bold text-zinc-900 mt-1 block">{totalTickets} Cases</span>
        </div>
        <div>
          <span className="block font-mono text-[9px] font-bold text-yellow-600 uppercase tracking-widest">Unassigned/Pending</span>
          <span className="font-sans text-xl font-bold text-yellow-600 mt-1 block">{pendingCount} Tickets</span>
        </div>
        <div>
          <span className="block font-mono text-[9px] font-bold text-blue-600 uppercase tracking-widest">Active In Progress</span>
          <span className="font-sans text-xl font-bold text-blue-600 mt-1 block">{progressCount} Tickets</span>
        </div>
        <div>
          <span className="block font-mono text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Resolved/Completed</span>
          <span className="font-sans text-xl font-bold text-emerald-600 mt-1 block">{resolvedCount} Tickets</span>
        </div>
      </div>

      {/* Primary Actions bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-150 pb-5">
        <div className="flex flex-wrap gap-2.5 flex-1 max-w-2xl">
          {/* Keyword and Room Search box */}
          <div className="relative flex-1 min-w-52">
            <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-zinc-400" />
            <input
              id="ticket-search-input"
              type="text"
              placeholder="Search tickets by room or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-zinc-250 bg-white py-1.5 pr-3 pl-8.5 text-xs text-zinc-800 placeholder-zinc-400 focus:border-zinc-800 focus:outline-hidden"
            />
          </div>

          {/* Priority dropdown selector */}
          <select
            id="filter-ticket-priority"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="rounded-lg border border-zinc-250 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-700"
          >
            <option value="All">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>

          {/* Status dropdown filter */}
          <select
            id="filter-ticket-status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-zinc-250 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-700"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Raise ticket primary trigger button */}
        <button
          id="raise-ticket-trigger-btn"
          onClick={handleOpenAdd}
          className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-zinc-950 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-zinc-805"
        >
          <Plus className="h-4 w-4" />
          <span>File Work Order</span>
        </button>
      </div>

      {/* Main tickets backlog block */}
      {filteredRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-white p-12 text-center">
          <Wrench className="h-10 w-10 text-zinc-300" />
          <h3 className="mt-3 text-sm font-semibold text-zinc-800">Clear Maintenance Backlog</h3>
          <p className="mt-1 text-xs text-zinc-400">All filed complaints have been successfully resolved, or matches nothing.</p>
        </div>
      ) : (
        <div id="tickets-backlog-container" className="space-y-4">
          {filteredRequests.map((req) => (
            <div
              id={`ticket-card-${req.id}`}
              key={req.id}
              className={`rounded-xl border border-zinc-200 bg-white p-4.5 hover:shadow-xs transition flex flex-col md:flex-row justify-between gap-4`}
            >
              {/* Ticket Information Section */}
              <div className="flex-1 space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="rounded-lg bg-zinc-900 text-zinc-50 font-mono text-[10.5px] font-bold px-2.5 py-0.5">
                    {req.roomNumber}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-secondary uppercase border ${getPriorityBadgeClass(req.priority)}`}>
                    {req.priority} Priority
                  </span>
                  <span className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-secondary uppercase border ${getStatusBadgeClass(req.status)}`}>
                    {req.status}
                  </span>
                  <span className="font-sans text-[10.5px] text-zinc-400 font-medium">#{req.id} &bull; {req.category}</span>
                </div>

                <h3 className="font-sans text-sm.5 font-extrabold text-zinc-900 leading-snug">
                  {req.title}
                </h3>
                <p className="font-sans text-xs text-zinc-500 leading-relaxed">
                  {req.description}
                </p>

                {/* Sub-meta details block */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 font-sans text-[11px] text-zinc-400 pt-1.5">
                  <div className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    <span>Reporter: <strong>{req.raisedBy}</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Raised date: {req.date}</span>
                  </div>
                  <div className="flex items-center gap-1 font-semibold text-zinc-505">
                    <Building className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Specialist Assigned:{' '}
                      {req.assignedTo ? (
                        <span className="text-zinc-650 bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200">{req.assignedTo}</span>
                      ) : (
                        <span className="text-amber-600 italic">None yet (Pending dispatch)</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Maintenance Staff Allocation & Workflow Controls */}
              <div className="flex flex-col justify-between items-end border-t border-zinc-100 pt-3 md:pt-0 md:border-0 md:pl-4 md:border-l border-zinc-200 shrink-0 select-none">
                <div className="space-y-2 w-full max-w-xs">
                  <span className="block font-sans text-[10px] text-zinc-400 uppercase tracking-widest text-right font-bold">Ticketing Controls</span>
                  
                  {/* Status switches actions buttons */}
                  <div className="flex items-center gap-1.5 justify-end">
                    {req.status === 'Pending' && (
                      <button
                        id={`action-start-work-${req.id}`}
                        onClick={() => updateMaintenanceStatus(req.id, 'In Progress')}
                        className="flex cursor-pointer items-center justify-center gap-1 rounded-md bg-blue-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-blue-700 transition"
                      >
                        <Play className="h-3 w-3" />
                        <span>Dispatch Work</span>
                      </button>
                    )}
                    {req.status === 'In Progress' && (
                      <button
                        id={`action-resolve-${req.id}`}
                        onClick={() => updateMaintenanceStatus(req.id, 'Completed')}
                        className="flex cursor-pointer items-center justify-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700 transition"
                      >
                        <CheckCircle className="h-3 w-3" />
                        <span>Resolve Complaint</span>
                      </button>
                    )}
                    {req.status === 'Completed' && (
                      <div className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-250 flex items-center gap-1 font-bold">
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Case Resolved</span>
                      </div>
                    )}
                    
                    {/* Inline selector to assign specialist worker */}
                    {req.status !== 'Completed' && currentUser?.role !== 'Staff' && (
                      <div className="relative">
                        {assigningRequestId === req.id ? (
                          <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded-lg p-1">
                            <select
                              id={`tech-select-${req.id}`}
                              className="text-[10px] font-bold text-zinc-800 focus:outline-hidden"
                              defaultValue=""
                              onChange={(e) => {
                                assignMaintenanceWorker(req.id, e.target.value);
                                setAssigningRequestId(null);
                              }}
                            >
                              <option value="" disabled>Choose Technician</option>
                              {techniciansList.map((tech) => (
                                <option key={tech} value={tech}>
                                  {tech}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => setAssigningRequestId(null)}
                              className="rounded-md border border-zinc-200 px-1 py-0.5 text-[9px] font-bold text-zinc-400"
                            >
                              Exit
                            </button>
                          </div>
                        ) : (
                          <button
                            id={`assign-worker-trigger-${req.id}`}
                            onClick={() => setAssigningRequestId(req.id)}
                            className="flex cursor-pointer items-center gap-1 rounded-md border border-zinc-250 bg-white px-2.5 py-1.5 text-[11px] font-bold text-zinc-650 hover:bg-zinc-50"
                          >
                            <UserPlus className="h-3 w-3" />
                            <span>{req.assignedTo ? 'Re-assign' : 'Assign Specialist'}</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Delete action button */}
                    {currentUser?.role !== 'Staff' && (
                      <button
                        id={`delete-ticket-btn-${req.id}`}
                        onClick={() => handleDeleteRequest(req.id)}
                        className="p-1.5 rounded-md border border-zinc-200 text-zinc-400 hover:text-red-650 hover:bg-red-50 cursor-pointer"
                        title="Delete Ticket Log"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* New Maintenance ticket file modal */}
      {isModalOpen && (
        <div id="maintenance-modal-container" className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="w-full max-w-sm rounded-xl border border-zinc-250 bg-white p-5 shadow-2xl">
            <h3 className="font-sans text-sm font-bold text-zinc-900">
              Raise Maintenance Work Order
            </h3>
            <p className="mt-1 font-sans text-xs text-zinc-400">
              Complete the information panel to flag physical repair tasks.
            </p>

            {formError && (
              <div className="mt-3 rounded-lg bg-red-50 border border-red-155 p-2 text-xs font-semibold text-red-650 flex gap-1.5">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitRequest} className="mt-4 space-y-3.5">
              {/* Ticket Heading Title */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-505 uppercase tracking-wide mb-1">
                  Task Title Summary
                </label>
                <input
                  id="modal-ticket-title"
                  type="text"
                  placeholder="e.g. Toilet drain backflow plumbing issue"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-zinc-250 px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-800 focus:outline-hidden"
                />
              </div>

              {/* Room or location specifying */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-505 uppercase tracking-wide mb-1">
                    Room / Area Location
                  </label>
                  <input
                    id="modal-ticket-room"
                    type="text"
                    placeholder="e.g. A-102, Mess Entry"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full rounded-lg border border-zinc-250 px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-800 focus:outline-hidden uppercase font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-505 uppercase tracking-wide mb-1">
                    Utility Category
                  </label>
                  <select
                    id="modal-ticket-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full rounded-lg border border-zinc-250 px-2.5 py-1.5 text-xs text-zinc-900 focus:border-zinc-800 focus:outline-hidden"
                  >
                    <option value="Electrical">Electrical/Wiring</option>
                    <option value="Plumbing">Plumbing/Water</option>
                    <option value="Furniture">Furniture/Carpentry</option>
                    <option value="Appliance">Appliances/HVAC</option>
                    <option value="Other">Other General</option>
                  </select>
                </div>
              </div>

              {/* Ticket Priority and reporter name */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-505 uppercase tracking-wide mb-1">
                    Urgency Priority
                  </label>
                  <select
                    id="modal-ticket-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full rounded-lg border border-zinc-250 px-2.5 py-1.5 text-xs text-zinc-900 focus:border-zinc-800 focus:outline-hidden font-semibold text-red-600"
                  >
                    <option value="Low">Low (No rush)</option>
                    <option value="Medium">Medium (Regular)</option>
                    <option value="High">High (Disruptive)</option>
                    <option value="Critical">Critical (Immediate danger)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-505 uppercase tracking-wide mb-1">
                    Submitted/Reported By
                  </label>
                  <input
                    id="modal-ticket-reporter"
                    type="text"
                    placeholder="e.g. Chef David"
                    value={raisedBy}
                    onChange={(e) => setRaisedBy(e.target.value)}
                    className="w-full rounded-lg border border-zinc-250 px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-800 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* In depth description details info text area */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-505 uppercase tracking-wide mb-1">
                  In-depth Problem Description
                </label>
                <textarea
                  id="modal-ticket-desc"
                  rows={3}
                  placeholder="Specify the issue in detail, including physical symptoms, risk, or past interventions."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-zinc-250 px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-800 focus:outline-hidden resize-none"
                />
              </div>

              {/* Action modal controls */}
              <div className="flex items-center justify-end gap-2 border-t border-zinc-150 pt-3 mt-4">
                <button
                  id="ticket-modal-cancel"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-650 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  id="ticket-modal-save"
                  type="submit"
                  className="rounded-lg bg-zinc-950 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-zinc-805"
                >
                  Raise Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div id="delete-confirm-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl border border-zinc-250 bg-white p-5 shadow-2xl animate-in flip-in-x duration-150">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-650">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-sans text-sm font-bold text-zinc-900">
                  Delete Complaint/Ticket?
                </h3>
                <p className="mt-1.5 font-sans text-xs text-zinc-550 font-medium leading-relaxed">
                  Are you sure you want to permanently remove ticket <strong className="text-zinc-800">#{deleteConfirmId}</strong>? This action is irreversible.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-zinc-150 pt-3 mt-4">
              <button
                id="delete-confirm-cancel-btn"
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-650 hover:bg-zinc-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="delete-confirm-confirm-btn"
                type="button"
                onClick={() => {
                  deleteMaintenanceRequest(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="rounded-lg bg-red-650 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
