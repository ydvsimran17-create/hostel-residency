/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  UserCheck,
  UserX,
  AlertTriangle,
  Mail,
  Phone,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAppState } from '../AppContext';
import { Student } from '../types';

export const StudentsPage: React.FC = () => {
  const {
    students,
    rooms,
    addStudent,
    updateStudent,
    deleteStudent,
    allotStudentRoom,
    unallotStudent,
    currentUser,
  } = useAppState();

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [roomNumber, setRoomNumber] = useState<string>('');
  const [formError, setFormError] = useState('');

  // Filtering + Searching States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // All, Allotted, Unallotted
  const [genderFilter, setGenderFilter] = useState('All');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Active Allotment action state
  const [allottingStudentId, setAllottingStudentId] = useState<string | null>(null);

  // Grab list of rooms that are available and have empty beds
  const availableRoomsList = rooms.filter(
    (room) => room.status === 'Available' && room.occupied < room.capacity
  );

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setName('');
    setStudentId(`STU2026${String(students.length + 1).padStart(2, '0')}`);
    setEmail('');
    setContact('');
    setGender('Male');
    setRoomNumber('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setName(student.name);
    setStudentId(student.studentId);
    setEmail(student.email);
    setContact(student.contact);
    setGender(student.gender);
    setRoomNumber(student.roomNumber || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Student name is required.');
      return;
    }
    if (!studentId.trim()) {
      setFormError('Student identification number is required.');
      return;
    }

    const dupId = students.find(
      (s) =>
(s.studentId || '').toUpperCase().trim() === studentId.toUpperCase().trim() &&
        (!editingStudent || s.id !== editingStudent.id)
    );
    if (dupId) {
      setFormError(`A student with ID "${studentId}" is already registered.`);
      return;
    }

    // Set structure
    const blockSelected = roomNumber ? rooms.find((r) => r.roomNumber === roomNumber)?.block || null : null;

    if (editingStudent) {
      // Edit
      updateStudent({
        ...editingStudent,
        name: name.trim(),
        studentId: studentId.toUpperCase().trim(),
        email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@university.edu`,
        contact: contact.trim() || '+1 (555) 000-0000',
        gender,
        roomNumber: roomNumber || null,
        block: blockSelected,
      });
    } else {
      // Add
      addStudent({
        name: name.trim(),
        studentId: studentId.toUpperCase().trim(),
        email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@university.edu`,
        contact: contact.trim() || '+1 (555) 000-0000',
        gender,
        roomNumber: roomNumber || null,
        block: blockSelected,
        joinDate: new Date().toISOString().split('T')[0],
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    const s = students.find((st) => st.id === id);
    if (!s) return;
    setDeleteConfirmId(id);
  };

  const handleAllotSubmit = (studentIdToAllot: string, roomNumToAllot: string) => {
    if (!roomNumToAllot) return;
    const success = allotStudentRoom(studentIdToAllot, roomNumToAllot);
    if (success) {
      setAllottingStudentId(null);
    }
  };

  // Filter students
  const filteredStudents = students.filter((st) => {
    const matchesSearch =
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Allotted' && st.roomNumber !== null) ||
      (statusFilter === 'Unallotted' && st.roomNumber === null);

    const matchesGender = genderFilter === 'All' || st.gender === genderFilter;

    return matchesSearch && matchesStatus && matchesGender;
  });

  // Pagination bounds
  const totalItems = filteredStudents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const setPageSafe = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Counting metrics
  const totalReg = students.length;
  const allottedCount = students.filter((s) => s.roomNumber !== null).length;
  const unallottedCount = students.filter((s) => s.roomNumber === null).length;

  return (
    <div className="space-y-6">
      {/* KPI counters */}
      <div className="grid grid-cols-3 gap-4 border-b border-zinc-200 pb-5">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <span className="block font-mono text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Total Registered</span>
          <span className="font-sans text-xl font-extrabold text-zinc-900 mt-0.5 block">{totalReg} Students</span>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <span className="block font-mono text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Allotted Bed</span>
          <span className="font-sans text-xl font-extrabold text-zinc-900 mt-0.5 block">{allottedCount} Students</span>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 relative overflow-hidden flex flex-col justify-between min-h-[76px]">
          <div className="flex items-start justify-between gap-1.5">
            <span className="block font-mono text-[10.5px] font-bold text-emerald-600 uppercase tracking-wide truncate">Unallotted Pending</span>
            {unallottedCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full font-mono text-[8px] uppercase tracking-wider font-extrabold bg-emerald-600 text-emerald-50 whitespace-nowrap shadow-xs shrink-0">
                Action Required
              </span>
            )}
          </div>
          <span className="font-sans text-xl font-extrabold text-emerald-800 mt-1 block truncate">
            {unallottedCount} Students
          </span>
        </div>
      </div>

      {/* Filter and control panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap gap-2.5 max-w-full">
          {/* Search */}
          <div className="relative flex-1 min-w-56 max-w-md">
            <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-zinc-400" />
            <input
              id="student-search-input"
              type="text"
              placeholder="Search students by name, ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // reset page
              }}
              className="w-full rounded-lg border border-zinc-250 bg-white py-1.5 pr-3 pl-8.5 text-xs text-zinc-850 focus:border-zinc-800 focus:outline-hidden"
            />
          </div>

          {/* Allocation status select */}
          <select
            id="filter-allocation-sel"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-zinc-250 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-700"
          >
            <option value="All">All Allotments</option>
            <option value="Allotted">Bed Allotted</option>
            <option value="Unallotted">Unallotted</option>
          </select>

          {/* Gender Filter */}
          <select
            id="filter-gender-sel"
            value={genderFilter}
            onChange={(e) => {
              setGenderFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-zinc-250 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-700"
          >
            <option value="All">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Register student button */}
        {currentUser?.role !== 'Staff' && (
          <button
            id="student-register-trigger-btn"
            onClick={handleOpenAdd}
            className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-zinc-950 px-3.5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Register Student</span>
          </button>
        )}
      </div>

      {/* Main Student list Table */}
      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table id="students-table" className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                <th className="px-5 py-3">Student Info</th>
                <th className="px-4 py-3">Student ID</th>
                <th className="px-4 py-3">Allotted Bed Space</th>
                <th className="px-4 py-3">Contact Information</th>
                <th className="px-4 py-3">Join Date</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-150">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 font-sans text-xs text-zinc-400">
                    No students currently match this criteria.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-zinc-50/50 transition duration-100 text-xs">
                    {/* Student Info */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8.5 w-8.5 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 font-bold border border-zinc-200 font-mono">
                          {st.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-zinc-900">{st.name}</h4>
                          <span className="font-sans text-[10px] text-zinc-400 block mt-0.5">
                            {st.gender}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Student ID Code */}
                    <td className="px-4 py-3.5 font-mono font-medium text-zinc-500">
                      {st.studentId}
                    </td>

                    {/* Allotted Space / Room */}
                    <td className="px-4 py-3.5">
                      {st.roomNumber ? (
                        <div className="flex items-center gap-2">
                          <span className="rounded-lg bg-zinc-900 px-2.5 py-1 text-zinc-50 font-mono text-[10.5px] font-bold">
                            Room {st.roomNumber}
                          </span>
                          <span className="font-sans text-[10px] text-zinc-400">
                            ({st.block})
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {currentUser?.role !== 'Staff' ? (
                            allottingStudentId === st.id ? (
                              <div className="flex items-center gap-1.5">
                                <select
                                  id={`quick-allot-room-select-${st.id}`}
                                  className="rounded-lg border border-zinc-250 p-1 text-[11px] font-bold text-zinc-800 focus:outline-hidden"
                                  defaultValue=""
                                  onChange={(e) => handleAllotSubmit(st.id, e.target.value)}
                                >
                                  <option value="" disabled>Select Room</option>
                                  {availableRoomsList.map((rm) => (
                                    <option key={rm.id} value={rm.roomNumber}>
                                      Rm {rm.roomNumber} ({rm.capacity - rm.occupied} open)
                                    </option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => setAllottingStudentId(null)}
                                  className="rounded-md border border-zinc-250 bg-white p-1 text-[10px] text-zinc-400 hover:text-zinc-805"
                                >
                                  Esc
                                </button>
                              </div>
                            ) : (
                              <button
                                id={`allot-btn-trigger-${st.id}`}
                                onClick={() => {
                                  if (availableRoomsList.length === 0) {
                                    alert('Sorry, there are no available rooms with empty bed slots!');
                                    return;
                                  }
                                  setAllottingStudentId(st.id);
                                }}
                                className="flex items-center gap-1 cursor-pointer rounded-lg border border-dashed border-emerald-305 bg-emerald-50/50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition"
                              >
                                <UserCheck className="h-3 w-3" />
                                <span>Assign Bed Space</span>
                              </button>
                            )
                          ) : (
                            <span className="font-sans text-[11px] text-zinc-400 italic">No bed allotted</span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Contact info details */}
                    <td className="px-4 py-3.5 space-y-0.5 text-zinc-505 font-medium">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Mail className="h-3 w-3 text-zinc-400" />
                        <span>{st.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Phone className="h-3 w-3 text-zinc-400" />
                        <span>{st.contact}</span>
                      </div>
                    </td>

                    {/* Join Entry Date */}
                    <td className="px-4 py-3.5 font-mono text-zinc-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                        <span>{st.joinDate}</span>
                      </div>
                    </td>

                    {/* Action buttons columns */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex justify-end items-center gap-1.5">
                        {st.roomNumber && currentUser?.role !== 'Staff' && (
                          <button
                            id={`unallot-btn-${st.id}`}
                            onClick={() => unallotStudent(st.id)}
                            className="flex cursor-pointer items-center gap-1 rounded-lg border border-red-150 bg-red-50/60 px-2.5 py-1 text-[11px] font-bold text-red-600 hover:bg-red-100 transition"
                            title="Unallot Room / Evict"
                          >
                            <UserX className="h-3 w-3" />
                            <span>Unallot</span>
                          </button>
                        )}
                        {currentUser?.role !== 'Staff' ? (
                          <>
                            <button
                              id={`edit-student-btn-${st.id}`}
                              onClick={() => handleOpenEdit(st)}
                              className="p-1 rounded-lg border border-zinc-200 text-zinc-400 hover:text-zinc-650 hover:bg-zinc-50 cursor-pointer"
                              title="Edit Personal Information"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              id={`delete-student-btn-${st.id}`}
                              onClick={() => handleDelete(st.id)}
                              className="p-1 rounded-lg border border-zinc-200 text-zinc-400 hover:text-red-650 hover:bg-red-50 cursor-pointer"
                              title="Delete Registration"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        ) : (
                          <span className="font-mono text-[10px] text-zinc-450 italic">View Only</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination navigation controls */}
        <div id="table-pagination-ui" className="flex h-14 items-center justify-between border-t border-zinc-200 bg-white px-5 text-xs select-none">
          <p className="font-sans text-zinc-500">
            Showing <span className="font-semibold text-zinc-900">{totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to{' '}
            <span className="font-semibold text-zinc-900">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
            <span className="font-semibold text-zinc-900">{totalItems}</span> matching student profiles
          </p>
          <div className="flex items-center gap-1.5">
            <button
              id="pagination-prev-btn"
              onClick={() => setPageSafe(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 font-semibold text-zinc-650 hover:bg-zinc-50 disabled:opacity-40"
            >
              Previous
            </button>
            <div className="font-mono text-zinc-500 min-w-16 text-center">
              Page <span className="font-bold text-zinc-900">{currentPage}</span> of{' '}
              <span className="font-bold text-zinc-900">{totalPages}</span>
            </div>
            <button
              id="pagination-next-btn"
              onClick={() => setPageSafe(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 font-semibold text-zinc-650 hover:bg-zinc-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add student Modal dialog */}
      {isModalOpen && (
        <div id="student-modal-container" className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="w-full max-w-sm rounded-xl border border-zinc-250 bg-white p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="font-sans text-sm font-bold text-zinc-900">
              {editingStudent ? `Edit Student info of: ${name}` : 'Register New Student'}
            </h3>
            <p className="mt-1 font-sans text-xs text-zinc-400">
              Provide identifying information and demographic details.
            </p>

            {formError && (
              <div className="mt-3 rounded-lg bg-red-50 border border-red-155 p-2 text-xs font-semibold text-red-650 flex gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-505 uppercase tracking-wide mb-1">
                  Full Name
                </label>
                <input
                  id="modal-student-name"
                  type="text"
                  placeholder="e.g. Liam Davies"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-250 px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-800 focus:outline-hidden"
                />
              </div>

              {/* Student identification code ID */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-505 uppercase tracking-wide mb-1">
                  Student Registration ID Code
                </label>
                <input
                  id="modal-student-id"
                  type="text"
                  placeholder="e.g. STU202615"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full rounded-lg border border-zinc-250 px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-800 focus:outline-hidden font-mono"
                />
              </div>

              {/* Email & Contact parameters */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-505 uppercase tracking-wide mb-1">
                    Primary Email
                  </label>
                  <input
                    id="modal-student-email"
                    type="email"
                    placeholder="name@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-zinc-250 px-2 px-2.5 py-1.5 text-xs text-zinc-900 focus:border-zinc-800 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-505 uppercase tracking-wide mb-1">
                    Contact Phone
                  </label>
                  <input
                    id="modal-student-contact"
                    type="text"
                    placeholder="+1 (555) 012-3456"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full rounded-lg border border-zinc-250 px-2 px-2.5 py-1.5 text-xs text-zinc-900 focus:border-zinc-800 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Gender and default Initial Allotment option */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-505 uppercase tracking-wide mb-1">
                    Gender Identity
                  </label>
                  <select
                    id="modal-student-gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full rounded-lg border border-zinc-250 px-2.5 py-1.5 text-xs text-zinc-900 focus:border-zinc-800 focus:outline-hidden"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-505 uppercase tracking-wide mb-1">
                    Room Space Allotment
                  </label>
                  <select
                    id="modal-student-room"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full rounded-lg border border-zinc-250 px-2.5 py-1.5 text-xs text-zinc-900 focus:border-zinc-800 focus:outline-hidden font-bold"
                  >
                    <option value="">Keep Unallotted</option>
                    {availableRoomsList.map((rm) => (
                      <option key={rm.id} value={rm.roomNumber}>
                        Room {rm.roomNumber} ({rm.capacity - rm.occupied} Free)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Modal buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-zinc-150 pt-3 mt-4">
                <button
                  id="student-modal-cancel"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-650 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  id="student-modal-save"
                  type="submit"
                  className="rounded-lg bg-zinc-950 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-zinc-805"
                >
                  {editingStudent ? 'Save Details' : 'Register & Assign'}
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
              <div>
                <h3 className="font-sans text-sm font-bold text-zinc-900">
                  Delete Registration?
                </h3>
                <p className="mt-1.5 font-sans text-xs text-zinc-500 font-medium leading-relaxed">
                  Are you sure you want to remove registration for <strong className="text-zinc-800">{students.find(s => s.id === deleteConfirmId)?.name}</strong>? This action will evict them from any allotted bed of this hostel.
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
                  deleteStudent(deleteConfirmId);
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
