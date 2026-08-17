/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Plus,
  Trash2,
  Edit2,
  Bed,
  Home,
  AlertTriangle,
  DoorOpen,
  Users,
  Boxes,
  Package,
  PlusCircle,
  MinusCircle,
} from 'lucide-react';
import { useAppState } from '../AppContext';
import { Room } from '../types';

export const RoomsPage: React.FC = () => {
  const {
    rooms,
    addRoom,
    updateRoom,
    deleteRoom,
    students,
    inventory,
    allocateRoomItem,
    removeRoomItem,
    currentUser,
  } = useAppState();

  // Dialog formulation states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // State for confirming room deletion
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Room Inventory allocation states
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedInventoryItemId, setSelectedInventoryItemId] = useState('');
  const [allocateQuantity, setAllocateQuantity] = useState(1);
  const [allocateError, setAllocateError] = useState('');

  // Form Fields
  const [roomNumber, setRoomNumber] = useState('');
  const [block, setBlock] = useState('A Block');
  const [type, setType] = useState<'Single' | 'Double' | 'Triple' | 'Quad'>('Double');
  const [capacity, setCapacity] = useState(2);
  const [status, setStatus] = useState<'Available' | 'Full' | 'Maintenance'>('Available');
  const [formError, setFormError] = useState('');

  // Page filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Trigger add modal
  const handleOpenAdd = () => {
    setEditingRoom(null);
    setRoomNumber('');
    setBlock('A Block');
    setType('Double');
    setCapacity(2);
    setStatus('Available');
    setFormError('');
    setIsModalOpen(true);
  };

  // Trigger edit modal
  const handleOpenEdit = (room: Room) => {
    setEditingRoom(room);
    setRoomNumber(room.roomNumber);
    setBlock(room.block);
    setType(room.type);
    setCapacity(room.capacity);
    setStatus(room.status);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleTypeChange = (selectedTypeStr: string) => {
    let cap = 2;
    if (selectedTypeStr === 'Single') cap = 1;
    if (selectedTypeStr === 'Triple') cap = 3;
    if (selectedTypeStr === 'Quad') cap = 4;
    
    setType(selectedTypeStr as any);
    setCapacity(cap);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!roomNumber.trim()) {
      setFormError('Room number is required.');
      return;
    }

    const trimmedNum = roomNumber.toUpperCase().trim();

    // Check duplicate room number
    const duplicate = rooms.find(
      (r) => r.roomNumber === trimmedNum && (!editingRoom || r.id !== editingRoom.id)
    );
    if (duplicate) {
      setFormError(`Room ${trimmedNum} already exists in the database.`);
      return;
    }

    if (editingRoom) {
      // Editing
      updateRoom({
        ...editingRoom,
        roomNumber: trimmedNum,
        block,
        type,
        capacity,
        status: status === 'Maintenance' ? 'Maintenance' : (editingRoom.occupied >= capacity ? 'Full' : 'Available'),
      });
    } else {
      // Adding
      addRoom({
        roomNumber: trimmedNum,
        block,
        type,
        capacity,
      });
    }

    setIsModalOpen(false);
  };

  const handleAllocateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAllocateError('');

    if (!selectedRoomId) return;
    if (!selectedInventoryItemId) {
      setAllocateError('Please select an item from the inventory.');
      return;
    }

    if (allocateQuantity <= 0) {
      setAllocateError('Quantity must be 1 or higher.');
      return;
    }

    const item = inventory.find(i => i.id === selectedInventoryItemId);
    if (!item) {
      setAllocateError('Selected inventory item not found.');
      return;
    }

    allocateRoomItem(selectedRoomId, selectedInventoryItemId, allocateQuantity);
    setIsAllocateModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  // Filters logic
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBlock = selectedBlock === 'All' || room.block === selectedBlock;
    const matchesType = selectedType === 'All' || room.type === selectedType;
    const matchesStatus =
      selectedStatus === 'All' ||
      (selectedStatus === 'Available' && room.status === 'Available') ||
      (selectedStatus === 'Full' && room.status === 'Full') ||
      (selectedStatus === 'Maintenance' && room.status === 'Maintenance');

    return matchesSearch && matchesBlock && matchesType && matchesStatus;
  });

  // Calculate active statistics
  const totalBeds = rooms.reduce((acc, r) => acc + r.capacity, 0);
  const totalOccupiedBeds = rooms.reduce((acc, r) => acc + r.occupied, 0);
  const freeBeds = totalBeds - totalOccupiedBeds;
  const underMaintenanceCount = rooms.filter((r) => r.status === 'Maintenance').length;

  return (
    <div className="space-y-6">
      {/* High Quality Secondary KPI bar */}
      <div className="grid grid-cols-2 gap-4 rounded-xl border border-ivory bg-white p-5 sm:grid-cols-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-charcoal text-white leading-none shadow-xs">
            <DoorOpen className="h-5 w-5 text-gold-accent" />
          </div>
          <div>
            <span className="block text-[11px] font-semibold text-blue-gray-medium uppercase tracking-wider">Total Rooms</span>
            <span className="font-serif text-base font-bold text-charcoal">{rooms.length} registered</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-light/20 text-charcoal leading-none shadow-xs border border-gold-light/45">
            <Bed className="h-5 w-5 text-gold-accent" />
          </div>
          <div>
            <span className="block text-[11px] font-semibold text-blue-gray-medium uppercase tracking-wider">Empty Beds Left</span>
            <span className="font-serif text-base font-bold text-charcoal">{freeBeds} / {totalBeds} free</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warm-white text-charcoal border border-ivory leading-none shadow-xs">
            <Users className="h-5 w-5 text-gold-accent" />
          </div>
          <div>
            <span className="block text-[11px] font-semibold text-blue-gray-medium uppercase tracking-wider">Beds Occupied</span>
            <span className="font-serif text-base font-bold text-charcoal">
              {totalOccupiedBeds} occupied ({totalBeds > 0 ? Math.round((totalOccupiedBeds / totalBeds) * 100) : 0}%)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warm-white border border-ivory/80 text-charcoal leading-none shadow-xs">
            <AlertTriangle className="h-5 w-5 text-gold-accent" />
          </div>
          <div>
            <span className="block text-[11px] font-semibold text-[#6E7D91] uppercase tracking-wider">Maintenance</span>
            <span className="font-serif text-base font-bold text-charcoal">{underMaintenanceCount} rooms</span>
          </div>
        </div>
      </div>

      {/* Control panel & filters */}
      <div className="flex flex-col gap-4 border-b border-zinc-200 pb-5 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-wrap gap-2 md:max-w-2xl">
          {/* Search bar */}
          <div className="relative min-w-56 flex-1">
            <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-zinc-400" />
            <input
              id="room-search-input"
              type="text"
              placeholder="Search rooms (e.g. A-101)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-zinc-250 bg-white py-1.5 pr-3 pl-8.5 text-xs text-zinc-800 placeholder-zinc-400 focus:border-zinc-800 focus:outline-hidden"
            />
          </div>

          {/* Block filter */}
          <select
            id="filter-block-sel"
            value={selectedBlock}
            onChange={(e) => setSelectedBlock(e.target.value)}
            className="rounded-lg border border-zinc-250 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 focus:border-zinc-800 focus:outline-hidden"
          >
            <option value="All">All Blocks</option>
            <option value="A Block">Block A</option>
            <option value="B Block">Block B</option>
            <option value="C Block">Block C</option>
          </select>

          {/* Type filter */}
          <select
            id="filter-type-sel"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-lg border border-zinc-250 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 focus:border-zinc-800 focus:outline-hidden"
          >
            <option value="All">All Sizes</option>
            <option value="Single">Single (1 Bed)</option>
            <option value="Double">Double (2 Beds)</option>
            <option value="Triple">Triple (3 Beds)</option>
            <option value="Quad">Quad (4 Beds)</option>
          </select>

          {/* Status filter */}
          <select
            id="filter-status-sel"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-zinc-250 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 focus:border-zinc-800 focus:outline-hidden"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Full">Full</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>

        {/* Add room action button */}
        {currentUser?.role !== 'Staff' && (
          <button
            id="add-room-trigger-btn"
            onClick={handleOpenAdd}
            className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-zinc-950 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-zinc-800"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Room</span>
          </button>
        )}
      </div>

      {/* Bento Grid layout representing our rooms */}
      {filteredRooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-250 p-12 text-center bg-white">
          <Home className="h-10 w-10 text-zinc-300" />
          <h3 className="mt-3 text-sm font-semibold text-zinc-800">No rooms match filter</h3>
          <p className="mt-1 text-xs text-zinc-400">Try loosening your search keywords or filter values</p>
        </div>
      ) : (
        <div id="rooms-grid" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredRooms.map((room) => {
            const occupantList = students.filter((s) => s.roomNumber === room.roomNumber);
            const isFull = room.occupied >= room.capacity;
            const isMaintenance = room.status === 'Maintenance';

            return (
              <div
                id={`room-card-${room.id}`}
                key={room.id}
                className={`relative flex flex-col justify-between rounded-xl border p-4.5 bg-white transition hover:shadow-xs hover:border-zinc-400 ${
                  isMaintenance
                    ? 'border-red-150 bg-red-50/10'
                    : isFull
                    ? 'border-zinc-300'
                    : 'border-zinc-200'
                }`}
              >
                {/* Card Title Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                      {room.block} &bull; {room.type}
                    </span>
                    <h3 className="font-sans text-base font-bold text-zinc-900 mt-0.5">
                      Room {room.roomNumber}
                    </h3>
                  </div>

                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-semibold uppercase border ${
                      isMaintenance
                        ? 'bg-red-50 text-red-600 border-red-200'
                        : isFull
                        ? 'bg-zinc-50 text-zinc-700 border-zinc-200'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-250'
                    }`}
                  >
                    {isMaintenance ? 'Repair' : isFull ? 'Full' : `${room.capacity - room.occupied} Space`}
                  </span>
                </div>

                {/* Notion-style Bed Map Visualization */}
                <div className="my-4 rounded-lg bg-zinc-50/55 p-3 border border-zinc-150">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] tracking-wide text-zinc-400 font-bold uppercase">Bed Occupancy Map</span>
                    <span className="text-[10px] font-medium text-zinc-500">
                      {room.occupied}/{room.capacity} slots
                    </span>
                  </div>
                  
                  {/* Visual list of beds slots */}
                  <div className="flex gap-2.5">
                    {Array.from({ length: room.capacity }).map((_, index) => {
                      const isOccupiedSlot = index < room.occupied;
                      const studentName = isOccupiedSlot ? occupantList[index]?.name : 'Free';
                      return (
                        <div
                          key={index}
                          className={`flex h-11 w-11 flex-col items-center justify-center rounded-lg border text-center transition-all ${
                            isMaintenance
                              ? 'bg-red-50/50 border-red-150 text-red-500'
                              : isOccupiedSlot
                              ? 'bg-zinc-900 border-zinc-900 text-amber-200'
                              : 'bg-white border-zinc-200 text-zinc-300'
                          }`}
                          title={`Bed Slot #${index + 1}: ${studentName}`}
                        >
                          <Bed className="h-4.5 w-4.5" />
                          <span className={`font-mono text-[8px] mt-0.5 font-bold ${isOccupiedSlot ? 'text-zinc-305' : 'text-zinc-450'}`}>
                            B{index + 1}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Registered occupants names tooltip */}
                  {room.occupied > 0 && (
                    <div className="mt-3 border-t border-zinc-150 pt-2 space-y-1">
                      <span className="block font-mono text-[9px] uppercase font-bold text-zinc-400 tracking-wider">Guests</span>
                      <ul className="text-[11px] text-zinc-750 font-medium pb-1.5">
                        {occupantList.map((st) => (
                          <li key={st.id} className="truncate flex items-center gap-1.5">
                            <span className="h-1 w-1 rounded-full bg-zinc-400"></span>
                            {st.name} <span className="font-mono text-[9px] text-zinc-400">({st.studentId})</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Room Inventory Section */}
                  <div className="mt-2.5 border-t border-zinc-150 pt-2.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="block font-mono text-[9px] uppercase font-bold text-zinc-400 tracking-wider">Allocated Inventory</span>
                      {currentUser?.role !== 'Staff' && (
                        <button
                          id={`allocate-item-trigger-${room.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRoomId(room.id);
                            setAllocateQuantity(1);
                            setAllocateError('');
                            if (inventory.length > 0) {
                              setSelectedInventoryItemId(inventory[0].id);
                            } else {
                              setSelectedInventoryItemId('');
                            }
                            setIsAllocateModalOpen(true);
                          }}
                          className="text-[10px] font-semibold text-zinc-700 hover:text-zinc-950 flex items-center gap-0.5 cursor-pointer hover:underline"
                          title="Allocate Inventory Asset"
                        >
                          <PlusCircle className="h-3 w-3 text-gold-accent" />
                          <span>Allot Asset</span>
                        </button>
                      )}
                    </div>

                    {room.allocatedItems && room.allocatedItems.length > 0 ? (
                      <div className="flex flex-col gap-1 max-h-28 overflow-y-auto pr-1">
                        {room.allocatedItems.map((item) => (
                          <div 
                            key={item.inventoryItemId} 
                            className="flex items-center justify-between text-[11px] py-1 px-1.5 rounded-md bg-zinc-50 border border-zinc-150 font-medium text-zinc-750 hover:bg-zinc-100 transition-colors"
                          >
                            <span className="truncate flex items-center gap-1">
                              <Package className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                              <span className="truncate" title={item.inventoryItemName}>
                                {item.inventoryItemName}
                              </span>
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="font-mono text-[9px] font-bold text-zinc-600 bg-zinc-200/80 px-1 py-0.5 rounded-sm">
                                x{item.quantity}
                              </span>
                              {currentUser?.role !== 'Staff' && (
                                <button
                                  onClick={() => removeRoomItem(room.id, item.inventoryItemId)}
                                  className="text-zinc-400 hover:text-red-500 rounded-full hover:bg-red-50 p-0.5"
                                  title="Remove item"
                                >
                                  <MinusCircle className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] font-medium text-zinc-400 italic">No inventory given to this room yet.</p>
                    )}
                  </div>
                </div>

                {/* Card Settings Action Bar */}
                {currentUser?.role !== 'Staff' && (
                  <div className="flex items-center justify-end gap-2 border-t border-zinc-100 pt-3">
                    <button
                      id={`edit-room-btn-${room.id}`}
                      onClick={() => handleOpenEdit(room)}
                      className="p-1.5 rounded-lg border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 cursor-pointer"
                      title="Edit Room details"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      id={`delete-room-btn-${room.id}`}
                      onClick={() => handleDelete(room.id)}
                      className="p-1.5 rounded-lg border border-zinc-200 text-zinc-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition"
                      title="Delete Room & Evict Students"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal Dial */}
      {isModalOpen && (
        <div id="room-modal-container" className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl border border-zinc-250 bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-sans text-sm font-bold text-zinc-900">
              {editingRoom ? `Edit Room ${roomNumber}` : 'Register New Room'}
            </h3>
            <p className="mt-1 font-sans text-xs text-zinc-400">
              Input the physical location and layout specifications below
            </p>

            {formError && (
              <div className="mt-3 rounded-lg bg-red-50 border border-red-155 p-2 text-xs font-medium text-red-650 flex gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              {/* Room Identifier */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wide mb-1">
                  Room Identifier Number
                </label>
                <input
                  id="modal-room-number"
                  type="text"
                  placeholder="e.g. A-301, B-105"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full rounded-lg border border-zinc-250 px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-800 focus:outline-hidden"
                  disabled={editingRoom !== null}
                />
              </div>

              {/* Block Division */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wide mb-1">
                  Hostel Building Block
                </label>
                <select
                  id="modal-room-block"
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  className="w-full rounded-lg border border-zinc-250 px-2.5 py-1.5 text-xs text-zinc-900 focus:border-zinc-800 focus:outline-hidden"
                >
                  <option value="A Block">A Block (Executive Residency)</option>
                  <option value="B Block">B Block (Graduate Housing)</option>
                  <option value="C Block">C Block (Classic Dorms)</option>
                </select>
              </div>

              {/* Room Size Type selector */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wide mb-1">
                  Size Type Capacity
                </label>
                <select
                  id="modal-room-type"
                  value={type}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full rounded-lg border border-zinc-250 px-2.5 py-1.5 text-xs text-zinc-900 focus:border-zinc-800 focus:outline-hidden"
                >
                  <option value="Single">Single Dorm (1 occupant space)</option>
                  <option value="Double">Double Suite (2 occupant spaces)</option>
                  <option value="Triple">Triple Shared (3 occupant spaces)</option>
                  <option value="Quad">Quad Bunks (4 occupant spaces)</option>
                </select>
              </div>

              {/* Edit Status option */}
              {editingRoom && (
                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wide mb-1">
                    Room Availability Overrides
                  </label>
                  <select
                    id="modal-room-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full rounded-lg border border-zinc-250 px-2.5 py-1.5 text-xs text-zinc-900 focus:border-zinc-800 focus:outline-hidden"
                  >
                    <option value="Available">Online & Active</option>
                    <option value="Maintenance">Offline & Under Maintenance</option>
                  </select>
                  <span className="mt-1 block font-sans text-[10px] leading-snug text-zinc-400">
                    Setting room to Maintenance will prevent administrators from allotting new students into this room.
                  </span>
                </div>
              )}

              {/* Modal footer submit control buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-zinc-150 pt-3 mt-4">
                <button
                  id="room-modal-cancel-btn"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-650 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  id="room-modal-save-btn"
                  type="submit"
                  className="rounded-lg bg-zinc-950 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-zinc-805"
                >
                  {editingRoom ? 'Save Changes' : 'Register Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Allocate Inventory Modal Dialog */}
      {isAllocateModalOpen && selectedRoomId && (
        <div id="allocate-modal-container" className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl border border-zinc-250 bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-sans text-sm font-bold text-zinc-900">
              Allocate Inventory to Room {rooms.find(r => r.id === selectedRoomId)?.roomNumber}
            </h3>
            <p className="mt-1 font-sans text-xs text-zinc-400 font-medium">
              Select an item from the global inventory to assign physically to this room
            </p>

            {allocateError && (
              <div className="mt-3 rounded-lg bg-red-50 border border-red-155 p-2 text-xs font-medium text-red-650 flex gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                <span>{allocateError}</span>
              </div>
            )}

            <form onSubmit={handleAllocateSubmit} className="mt-4 space-y-3.5">
              {/* Select Item */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wide mb-1">
                  Inventory Item
                </label>
                {inventory.length === 0 ? (
                  <p className="text-xs text-red-550 font-semibold">No items registered in the inventory yet.</p>
                ) : (
                  <select
                    id="modal-allocate-item-select"
                    value={selectedInventoryItemId}
                    onChange={(e) => setSelectedInventoryItemId(e.target.value)}
                    className="w-full rounded-lg border border-zinc-250 px-2.5 py-1.5 text-xs text-zinc-900 focus:border-zinc-800 focus:outline-hidden bg-white"
                  >
                    {inventory.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.goodCount} units in stock)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wide mb-1">
                  Allocation Quantity
                </label>
                <input
                  id="modal-allocate-qty"
                  type="number"
                  min="1"
                  value={allocateQuantity}
                  onChange={(e) => setAllocateQuantity(parseInt(e.target.value) || 1)}
                  className="w-full rounded-lg border border-zinc-250 px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-800 focus:outline-hidden"
                />
              </div>

              {/* Modal footer submit controls */}
              <div className="flex items-center justify-end gap-2 border-t border-zinc-150 pt-3 mt-4">
                <button
                  id="allocate-modal-cancel-btn"
                  type="button"
                  onClick={() => setIsAllocateModalOpen(false)}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-650 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  id="allocate-modal-save-btn"
                  type="submit"
                  disabled={inventory.length === 0}
                  className="rounded-lg bg-zinc-950 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-zinc-805 disabled:opacity-50 cursor-pointer"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Room Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div id="delete-room-confirm-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl border border-zinc-250 bg-white p-5 shadow-2xl animate-in flip-in-x duration-150">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-650">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-sans text-sm font-bold text-zinc-900">
                  Delete Room?
                </h3>
                <p className="mt-1.5 font-sans text-xs text-zinc-550 font-medium leading-relaxed">
                  Are you sure you want to permanently delete <strong className="text-zinc-800">Room {rooms.find(r => r.id === deleteConfirmId)?.roomNumber}</strong>? This will automatically de-allocate all students inside and remove this room from the database.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-zinc-150 pt-3 mt-4">
              <button
                id="delete-room-confirm-cancel-btn"
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-650 hover:bg-zinc-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="delete-room-confirm-btn"
                type="button"
                onClick={() => {
                  if (deleteConfirmId) {
                    deleteRoom(deleteConfirmId);
                  }
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
