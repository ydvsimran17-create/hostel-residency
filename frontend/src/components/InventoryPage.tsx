/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Edit,
  AlertTriangle,
  MapPin,
  CheckCircle,
  Wrench,
  XCircle,
  PackageCheck,
  PlusCircle,
  MinusCircle,
  Truck,
  FileText,
  Calendar,
  DollarSign,
  UploadCloud,
  Mail,
  Phone,
  Eye,
  Info,
  Sliders,
  Receipt,
  X
} from 'lucide-react';
import { useAppState } from '../AppContext';
import { InventoryItem, StockRecord } from '../types';

export const InventoryPage: React.FC = () => {
  const {
    inventory,
    stockRecords,
    addStockRecord,
    deleteStockRecord,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    adjustStock,
    currentUser
  } = useAppState();

  // Active Tab: 'register' | 'ledger'
  const [activeTab, setActiveTab] = useState<'register' | 'ledger'>('register');

  // Dialog State (Register)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Form Fields (Register)
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Furniture' | 'Electronics' | 'Bedding' | 'Utility' | 'Safety'>('Furniture');
  const [goodCount, setGoodCount] = useState(1);
  const [damagedCount, setDamagedCount] = useState(0);
  const [repairCount, setRepairCount] = useState(0);
  const [location, setLocation] = useState('');
  const [minRequired, setMinRequired] = useState(5);
  const [formError, setFormError] = useState('');

  // Local Search & Category State (Register)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Receive Incoming Stock States (Ledger)
  const [isIncomingModalOpen, setIsIncomingModalOpen] = useState(false);
  const [incomingItemId, setIncomingItemId] = useState('');
  const [incomingQuantity, setIncomingQuantity] = useState(10);
  const [incomingDate, setIncomingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [supplierName, setSupplierName] = useState('');
  const [supplierContact, setSupplierContact] = useState('');
  const [supplierEmail, setSupplierEmail] = useState('');
  const [purchaseCost, setPurchaseCost] = useState(150);
  const [notes, setNotes] = useState('');
  const [invoiceFileName, setInvoiceFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Interactive High-Fidelity Invoice Display State
  const [selectedRecordForInvoice, setSelectedRecordForInvoice] = useState<StockRecord | null>(null);

  // Custom Delete Confirmations
  const [deleteConfirmItemId, setDeleteConfirmItemId] = useState<string | null>(null);
  const [deleteConfirmRecordId, setDeleteConfirmRecordId] = useState<string | null>(null);

  // Ledger Filter States (Ledger)
  const [ledgerSearchQuery, setLedgerSearchQuery] = useState('');
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState<'All' | 'Incoming' | 'Outgoing' | 'Adjustment'>('All');

  // Handlers (Register)
  const handleOpenAdd = () => {
    setEditingItem(null);
    setName('');
    setCategory('Furniture');
    setGoodCount(10);
    setDamagedCount(0);
    setRepairCount(0);
    setLocation('Hostel Common Area');
    setMinRequired(5);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setGoodCount(item.goodCount);
    setDamagedCount(item.damagedCount);
    setRepairCount(item.repairCount);
    setLocation(item.location);
    setMinRequired(item.minRequired ?? 5);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Asset name is required.');
      return;
    }

    const good = Number(goodCount) || 0;
    const damaged = Number(damagedCount) || 0;
    const repair = Number(repairCount) || 0;
    const qty = good + damaged + repair;

    if (qty <= 0) {
      setFormError('Total quantity must be at least 1.');
      return;
    }

    if (editingItem) {
      updateInventoryItem({
        ...editingItem,
        name: name.trim(),
        category,
        quantity: qty,
        goodCount: good,
        damagedCount: damaged,
        repairCount: repair,
        location: location.trim() || 'Unspecified location',
        minRequired,
      });
    } else {
      addInventoryItem({
        name: name.trim(),
        category,
        quantity: qty,
        goodCount: good,
        damagedCount: damaged,
        repairCount: repair,
        location: location.trim() || 'Storage Depot',
        minRequired,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    const item = inventory.find((i) => i.id === id);
    if (!item) return;
    setDeleteConfirmItemId(id);
  };

  // Handlers (Ledger)
  const handleOpenReceiveIncoming = () => {
    // Select first item or blank
    setIncomingItemId(inventory[0]?.id || '');
    setIncomingQuantity(10);
    setIncomingDate(new Date().toISOString().split('T')[0]);
    setSupplierName('');
    setSupplierContact('');
    setSupplierEmail('');
    setPurchaseCost(150);
    setNotes('');
    setInvoiceFileName('');
    setFormError('');
    setIsIncomingModalOpen(true);
  };

  const handleIncomingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!incomingItemId) {
      setFormError('Please select a reference inventory asset item.');
      return;
    }
    if (incomingQuantity <= 0) {
      setFormError('Received incoming units must be greater than zero.');
      return;
    }

    const refItem = inventory.find((i) => i.id === incomingItemId);
    if (!refItem) {
      setFormError('Selected asset item is invalid or not found.');
      return;
    }

    addStockRecord({
      inventoryItemId: refItem.id,
      inventoryItemName: refItem.name,
      type: 'Incoming',
      quantity: incomingQuantity,
      date: incomingDate,
      supplierName: supplierName.trim() || 'Direct Spot Supplying Corp',
      supplierContact: supplierContact.trim() || '+1 (555) 019-9021',
      supplierEmail: supplierEmail.trim() || 'orders@supplyingcorp.com',
      purchaseCost: Number(purchaseCost) || 0,
      invoiceFileName: invoiceFileName.trim() || undefined,
      notes: notes.trim(),
    });

    setIsIncomingModalOpen(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setIsUploading(true);
      setTimeout(() => {
        setInvoiceFileName(file.name);
        setIsUploading(false);
      }, 700);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setTimeout(() => {
        setInvoiceFileName(file.name);
        setIsUploading(false);
      }, 700);
    }
  };

  // Filter asset items
  const filteredItems = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter ledger records
  const filteredRecords = (stockRecords || []).filter((rec) => {
    const matchesSearch =
      rec.inventoryItemName.toLowerCase().includes(ledgerSearchQuery.toLowerCase()) ||
      (rec.supplierName || '').toLowerCase().includes(ledgerSearchQuery.toLowerCase()) ||
      (rec.invoiceFileName || '').toLowerCase().includes(ledgerSearchQuery.toLowerCase()) ||
      (rec.notes || '').toLowerCase().includes(ledgerSearchQuery.toLowerCase());
    const matchesType = ledgerTypeFilter === 'All' || rec.type === ledgerTypeFilter;
    return matchesSearch && matchesType;
  });

  // KPI Calculations
  const totalAssetsSum = inventory.reduce((acc, i) => acc + i.quantity, 0);
  const goodAssetsSum = inventory.reduce((acc, i) => acc + i.goodCount, 0);
  const repairAssetsSum = inventory.reduce((acc, i) => acc + i.repairCount, 0);
  const damagedAssetsSum = inventory.reduce((acc, i) => acc + i.damagedCount, 0);

  // Filter out low stock items where active goodCount is less than or equal to its threshold
  const lowStockItems = inventory.filter((item) => item.goodCount <= (item.minRequired ?? 5));

  // Compute Total Procurement value of incoming stock recorded
  const totalProcurementValue = (stockRecords || [])
    .filter((r) => r.type === 'Incoming')
    .reduce((acc, r) => acc + (r.purchaseCost || 0), 0);

  return (
    <div className="space-y-6">
      {/* High-fidelity logistics ratios stats */}
      <div className="grid grid-cols-2 gap-4 rounded-xl border border-zinc-200 bg-white p-5 sm:grid-cols-4 shadow-sm">
        <div>
          <span className="block font-mono text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Total Pieces Logged</span>
          <span className="font-serif text-lg font-bold text-zinc-900">{totalAssetsSum} units</span>
        </div>
        <div>
          <span className="block font-mono text-[9px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Good/Functional</span>
          <span className="font-serif text-lg font-bold text-emerald-700">
            {goodAssetsSum} ({totalAssetsSum > 0 ? Math.round((goodAssetsSum / totalAssetsSum) * 100) : 0}%)
          </span>
        </div>
        <div>
          <span className="block font-mono text-[9px] font-bold text-blue-500 uppercase tracking-widest mb-1">Pending Servicing</span>
          <span className="font-serif text-lg font-bold text-blue-700">
            {repairAssetsSum} ({totalAssetsSum > 0 ? Math.round((repairAssetsSum / totalAssetsSum) * 100) : 0}%)
          </span>
        </div>
        <div>
          <span className="block font-mono text-[9px] font-bold text-red-400 uppercase tracking-widest mb-1">Procured Assets Cost</span>
          <span className="font-serif text-lg font-bold text-zinc-800">
            ${totalProcurementValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Subtabs Toggle Selector */}
      <div className="flex border-b border-zinc-250 bg-zinc-50/60 p-1 rounded-lg gap-1 border">
        <button
          onClick={() => setActiveTab('register')}
          className={`flex-1 py-2 text-center rounded font-sans text-xs font-bold uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-2 ${
            activeTab === 'register'
              ? 'bg-zinc-950 text-white shadow-xs'
              : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <Sliders className="h-3.5 w-3.5" />
          Asset Stock Register
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex-1 py-2 text-center rounded font-sans text-xs font-bold uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-2 ${
            activeTab === 'ledger'
              ? 'bg-zinc-950 text-white shadow-xs'
              : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <Receipt className="h-3.5 w-3.5" />
          Date-wise Stock Ledger & Deliveries
        </button>
      </div>

      {/* Low Stock Warnings Banner */}
      {lowStockItems.length > 0 && (
        <div id="inventory-low-stock-banner" className="rounded-xl border border-red-200 bg-red-50/60 p-4 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-red-500 p-1.5 text-white shadow-xs">
              <AlertTriangle className="h-4 w-4 shrink-0" />
            </div>
            <div className="flex-1">
              <h4 className="font-sans text-xs font-bold text-red-900 flex items-center gap-2">
                Inventory Stock Warnings ({lowStockItems.length} critical item{lowStockItems.length > 1 ? 's' : ''})
              </h4>
              <p className="mt-0.5 text-[11px] text-red-700 font-medium">
                The functional count for these crucial asset group listings has dipped below their safe operational thresholds.
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 rounded bg-white border border-red-150 px-2 py-0.5 text-[11px] shadow-3xs"
                  >
                    <span className="font-semibold text-zinc-900">{item.name}</span>
                    <span className="h-2.5 w-px bg-zinc-200" />
                    <span className="font-mono text-[10px] text-red-650 font-bold">
                      {item.goodCount} good / min {item.minRequired ?? 5}
                    </span>
                    <span className="inline-flex h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONDITIONAL SUBVIEW RENDERING */}
      {activeTab === 'register' ? (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Action Control Panel */}
          <div className="flex flex-col gap-3 border-b border-zinc-150 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-wrap gap-2.5 max-w-xl">
              {/* Search bar */}
              <div className="relative flex-1 min-w-56">
                <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-zinc-400" />
                <input
                  id="inventory-search-input"
                  type="text"
                  placeholder="Search assets (fans, bunks, mattresses)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-white py-1.5 pr-3 pl-8.5 text-xs text-zinc-800 placeholder-zinc-400 focus:border-zinc-800 focus:outline-hidden"
                />
              </div>

              {/* Category Filter selector */}
              <div>
                <select
                  id="inventory-category-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-700 focus:border-zinc-850 focus:outline-hidden"
                >
                  <option value="All">All Categories</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Electronics">Electrical / Tech</option>
                  <option value="Bedding">Bedding</option>
                  <option value="Utility">Utilities / Tools</option>
                  <option value="Safety">Safety & Compliance</option>
                </select>
              </div>
            </div>

            {currentUser?.role !== 'Staff' && (
              <button
                id="inventory-add-asset-btn"
                onClick={handleOpenAdd}
                type="button"
                className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-zinc-950 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-zinc-805"
              >
                <Plus className="h-4 w-4" />
                <span>Add Asset Group</span>
              </button>
            )}
          </div>

          {/* Logistics Asset Table with stock controls */}
          <div className="rounded-xl border border-zinc-200 bg-white shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table id="inventory-table" className="w-full text-left border-collapse table-fixed lg:table-auto">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 font-mono text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                    <th className="px-4 py-3 w-[25%] min-w-[150px]">Asset Description</th>
                    <th className="px-3 py-3 w-[15%] min-w-[100px]">Ratio Status</th>
                    <th className="px-3 py-3 w-[15%] min-w-[100px]">Location</th>
                    <th className="px-3 py-3 w-[30%] min-w-[260px]">Stock Adjustment (Good/Repair/Broken)</th>
                    <th className="px-4 py-3 text-right w-[15%] min-w-[110px]">Settings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-150 text-xs text-zinc-700">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-zinc-400 font-sans text-xs">
                        No items match the active logistic criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => {
                      const goodPercent = item.quantity > 0 ? (item.goodCount / item.quantity) * 100 : 0;
                      const repairPercent = item.quantity > 0 ? (item.repairCount / item.quantity) * 100 : 0;
                      const damagedPercent = item.quantity > 0 ? (item.damagedCount / item.quantity) * 100 : 0;

                      return (
                        <tr key={item.id} className="group hover:bg-zinc-50/50 transition">
                          {/* Name & Category info */}
                          <td className="px-4 py-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <h4 className="font-semibold text-zinc-900 text-sm">{item.name}</h4>
                                  {item.goodCount <= (item.minRequired ?? 5) && (
                                    <span className="inline-flex items-center gap-0.5 rounded bg-red-50 border border-red-200 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-650 animate-pulse">
                                      <AlertTriangle className="h-2.5 w-2.5 shrink-0" />
                                      Low Stock
                                    </span>
                                  )}
                                </div>
                                <span className="mt-1 font-sans text-[10px] text-zinc-400 uppercase tracking-wider font-bold block">
                                  {item.category} • Alert below {item.minRequired ?? 5} units
                                </span>
                              </div>
                              <button
                                id={`inline-delete-btn-${item.id}`}
                                type="button"
                                onClick={() => handleDelete(item.id)}
                                className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-lg bg-red-50 border border-red-100 text-red-650 hover:bg-red-100 hover:text-red-750 transition cursor-pointer shrink-0"
                                title="Delete this asset item"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>

                          {/* Visual segmented ratio bar */}
                          <td className="px-3 py-3">
                            <div className="space-y-1.5">
                              {/* Segmented bar */}
                              <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 border border-zinc-100">
                                <div
                                  className="bg-emerald-500"
                                  style={{ width: `${goodPercent}%` }}
                                  title={`Good: ${item.goodCount}`}
                                />
                                <div
                                  className="bg-blue-500"
                                  style={{ width: `${repairPercent}%` }}
                                  title={`Under Repair: ${item.repairCount}`}
                                />
                                <div
                                  className="bg-red-500"
                                  style={{ width: `${damagedPercent}%` }}
                                  title={`Damaged: ${item.damagedCount}`}
                                />
                              </div>

                              {/* Stat labels */}
                              <div className="flex items-center justify-between text-[9px] font-bold font-mono text-zinc-400">
                                <span className="text-emerald-600">{item.goodCount}G</span>
                                <span className="text-blue-650">{item.repairCount}R</span>
                                <span className="text-red-500">{item.damagedCount}B</span>
                              </div>
                            </div>
                          </td>

                          {/* Location within hostel */}
                          <td className="px-3 py-3 text-zinc-500 font-medium">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                              <span>{item.location}</span>
                            </div>
                          </td>

                           {/* Interactive adjust stock quantity controls */}
                          <td className="px-3 py-3">
                            {currentUser?.role !== 'Staff' ? (
                              <div className="flex items-center gap-1.5 whitespace-nowrap">
                                {/* Good Controls */}
                                <div className="flex items-center gap-1 bg-emerald-50/60 px-1.5 py-0.5 rounded-md border border-emerald-100 shadow-3xs" title="Good Stock">
                                  <span className="text-[9px] font-bold text-emerald-700 uppercase">G:</span>
                                  <button
                                    id={`dec-good-${item.id}`}
                                    onClick={() => adjustStock(item.id, -1, 0, 0)}
                                    className="text-emerald-500 hover:text-emerald-700 cursor-pointer transition p-0.5"
                                  >
                                    <MinusCircle className="h-3 w-3" />
                                  </button>
                                  <span className="font-mono font-bold text-emerald-800 text-[11px] w-3.5 text-center leading-none">{item.goodCount}</span>
                                  <button
                                    id={`inc-good-${item.id}`}
                                    onClick={() => adjustStock(item.id, 1, 0, 0)}
                                    className="text-emerald-500 hover:text-emerald-700 cursor-pointer transition p-0.5"
                                  >
                                    <PlusCircle className="h-3 w-3" />
                                  </button>
                                </div>

                                {/* Repair Controls */}
                                <div className="flex items-center gap-1 bg-blue-50/60 px-1.5 py-0.5 rounded-md border border-blue-100 shadow-3xs" title="Under Repair">
                                  <span className="text-[9px] font-bold text-blue-700 uppercase">R:</span>
                                  <button
                                    id={`dec-repair-${item.id}`}
                                    onClick={() => adjustStock(item.id, 0, 0, -1)}
                                    className="text-blue-500 hover:text-blue-700 cursor-pointer transition p-0.5"
                                  >
                                    <MinusCircle className="h-3 w-3" />
                                  </button>
                                  <span className="font-mono font-bold text-blue-800 text-[11px] w-3.5 text-center leading-none">{item.repairCount}</span>
                                  <button
                                    id={`inc-repair-${item.id}`}
                                    onClick={() => adjustStock(item.id, 0, 0, 1)}
                                    className="text-blue-500 hover:text-blue-700 cursor-pointer transition p-0.5"
                                  >
                                    <PlusCircle className="h-3 w-3" />
                                  </button>
                                </div>

                                {/* Damaged Controls */}
                                <div className="flex items-center gap-1 bg-red-50/60 px-1.5 py-0.5 rounded-md border border-red-100 shadow-3xs" title="Broken/Damaged">
                                  <span className="text-[9px] font-bold text-red-700 uppercase">B:</span>
                                  <button
                                    id={`dec-broken-${item.id}`}
                                    onClick={() => adjustStock(item.id, 0, -1, 0)}
                                    className="text-red-450 hover:text-red-750 cursor-pointer transition p-0.5"
                                  >
                                    <MinusCircle className="h-3 w-3" />
                                  </button>
                                  <span className="font-mono font-bold text-red-800 text-[11px] w-3.5 text-center leading-none">{item.damagedCount}</span>
                                  <button
                                    id={`inc-broken-${item.id}`}
                                    onClick={() => adjustStock(item.id, 0, 1, 0)}
                                    className="text-red-450 hover:text-red-750 cursor-pointer transition p-0.5"
                                  >
                                    <PlusCircle className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3.5 whitespace-nowrap text-zinc-500 font-medium">
                                <span className="flex items-center gap-1.5" title="Good Stock"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Good: <strong className="font-semibold text-zinc-805">{item.goodCount}</strong></span>
                                <span className="flex items-center gap-1.5" title="Under Repair"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" />Repair: <strong className="font-semibold text-zinc-805">{item.repairCount}</strong></span>
                                <span className="flex items-center gap-1.5" title="Broken/Damaged"><span className="h-1.5 w-1.5 rounded-full bg-red-500" />Broken: <strong className="font-semibold text-zinc-850">{item.damagedCount}</strong></span>
                              </div>
                            )}
                          </td>

                          {/* Manual edit/delete settings */}
                          <td className="px-4 py-3 text-right">
                            {currentUser?.role !== 'Staff' ? (
                              <div className="flex justify-end gap-1 shrink-0">
                                <button
                                  id={`edit-asset-btn-${item.id}`}
                                  onClick={() => handleOpenEdit(item)}
                                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-zinc-50 border border-zinc-200 text-zinc-650 hover:text-zinc-905 transition cursor-pointer text-[10px] font-bold"
                                  title="Edit Asset Title"
                                >
                                  <Edit className="h-2.5 w-2.5" />
                                  <span className="hidden sm:inline">Edit</span>
                                </button>
                                <button
                                  id={`delete-asset-btn-${item.id}`}
                                  onClick={() => handleDelete(item.id)}
                                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 hover:text-red-750 transition cursor-pointer text-[10px] font-bold"
                                  title="Remove Asset Group"
                                >
                                  <Trash2 className="h-2.5 w-2.5" />
                                  <span className="hidden sm:inline">Remove</span>
                                </button>
                              </div>
                            ) : (
                              <span className="font-mono text-[10px] text-zinc-450 italic">View Only</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* DATE-WISE LOGS & DELIVERIES SUBVIEW */
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Action Ledger Controls */}
          <div className="flex flex-col gap-3 border-b border-zinc-150 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-wrap gap-2.5 max-w-2xl">
              {/* Search bar */}
              <div className="relative flex-1 min-w-56">
                <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-zinc-400" />
                <input
                  id="ledger-search-input"
                  type="text"
                  placeholder="Search ledger (Item name, supplier, invoice, notes)..."
                  value={ledgerSearchQuery}
                  onChange={(e) => setLedgerSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-white py-1.5 pr-3 pl-8.5 text-xs text-zinc-800 placeholder-zinc-400 focus:border-zinc-800 focus:outline-hidden"
                />
              </div>

              {/* Ledger Type selector */}
              <div>
                <select
                  id="ledger-type-filter"
                  value={ledgerTypeFilter}
                  onChange={(e) => setLedgerTypeFilter(e.target.value as any)}
                  className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-700 focus:border-zinc-850 focus:outline-hidden"
                >
                  <option value="All">All Transactions</option>
                  <option value="Incoming">Incoming Shipments</option>
                  <option value="Outgoing">Outgoing Reductions</option>
                  <option value="Adjustment">Audits / Adjustments</option>
                </select>
              </div>
            </div>

            {currentUser?.role !== 'Staff' && (
              <button
                id="log-incoming-stock-btn"
                onClick={handleOpenReceiveIncoming}
                type="button"
                className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
              >
                <Truck className="h-4 w-4" />
                <span>Record Incoming Stock</span>
              </button>
            )}
          </div>

          {/* Ledger table view */}
          <div className="rounded-xl border border-zinc-200 bg-white shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table id="ledger-table" className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    <th className="px-5 py-3.5">Delivery Date</th>
                    <th className="px-4 py-3.5">Asset Ref & Type</th>
                    <th className="px-4 py-3.5">Quantity Action</th>
                    <th className="px-4 py-3.5">Supplier Profile</th>
                    <th className="px-4 py-3.5">Purchase Cost</th>
                    <th className="px-4 py-3.5">Supporting Invoice</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-150 text-xs text-zinc-700 bg-white">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-zinc-400 font-sans text-xs">
                        No custom stock transactions registered matching these values.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-zinc-50/40 transition">
                        {/* Transaction Date */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-mono font-semibold text-zinc-650">
                            <Calendar className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                            <span>{record.date}</span>
                          </div>
                        </td>

                        {/* Name and Type */}
                        <td className="px-4 py-4">
                          <div>
                            <span className="font-bold text-zinc-900 text-xs block">{record.inventoryItemName}</span>
                            <span className={`inline-block mt-1 font-mono text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${
                              record.type === 'Incoming'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/55'
                                : record.type === 'Outgoing'
                                ? 'bg-red-50 text-red-650 border border-red-200/55'
                                : 'bg-amber-50 text-amber-700 border border-amber-200/55'
                            }`}>
                              {record.type}
                            </span>
                          </div>
                        </td>

                        {/* Quantity delivered */}
                        <td className="px-4 py-4 font-mono font-bold">
                          <div className="flex items-center gap-1">
                            <span className={record.type === 'Incoming' ? 'text-emerald-600 text-sm' : 'text-zinc-600'}>
                              {record.type === 'Incoming' ? '+' : record.type === 'Outgoing' ? '-' : ''}
                              {record.quantity}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-medium font-sans">units</span>
                          </div>
                        </td>

                        {/* Supplier Info */}
                        <td className="px-4 py-4">
                          {record.supplierName ? (
                            <div className="space-y-0.5 max-w-xs">
                              <span className="font-semibold text-zinc-800 block text-xs">{record.supplierName}</span>
                              <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-zinc-400 font-sans">
                                {record.supplierContact && (
                                  <span className="flex items-center gap-0.5">
                                    <Phone className="h-2.5 w-2.5" /> {record.supplierContact}
                                  </span>
                                )}
                                {record.supplierEmail && (
                                  <span className="flex items-center gap-0.5">
                                    <Mail className="h-2.5 w-2.5" /> {record.supplierEmail}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-zinc-400 italic">No supplier recorded</span>
                          )}
                        </td>

                        {/* Cost per Shipment */}
                        <td className="px-4 py-4 whitespace-nowrap font-semibold">
                          {record.purchaseCost !== undefined ? (
                            <div className="text-zinc-900">
                              <span className="font-mono text-zinc-500 text-[10px] mr-1">$</span>
                              <span className="font-mono text-xs">{record.purchaseCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              <span className="block text-[9px] text-zinc-400 font-sans font-medium mt-0.5">
                                (~${Math.round((record.purchaseCost / (record.quantity || 1)) * 100) / 100}/unit)
                              </span>
                            </div>
                          ) : (
                            <span className="text-zinc-400">—</span>
                          )}
                        </td>

                        {/* Invoice reference attachment */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          {record.invoiceFileName ? (
                            <button
                              type="button"
                              onClick={() => setSelectedRecordForInvoice(record)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 px-2 py-1 text-zinc-700 transition cursor-pointer text-[11px]"
                            >
                              <FileText className="h-3 w-3 text-emerald-600" />
                              <span className="max-w-36 overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-zinc-600">
                                {record.invoiceFileName}
                              </span>
                              <Eye className="h-3.5 w-3.5 text-zinc-400" />
                            </button>
                          ) : (
                            <span className="text-zinc-400 italic">No file attached</span>
                          )}
                        </td>

                        {/* Actions (Delete record) */}
                        <td className="px-5 py-4 text-right">
                          {currentUser?.role !== 'Staff' ? (
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteConfirmRecordId(record.id);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-750 transition cursor-pointer text-[10px] font-bold"
                              title="Delete Stock Record"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Delete Log</span>
                            </button>
                          ) : (
                            <span className="font-mono text-[10px] text-zinc-400 italic">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Ledger Guide alert */}
          <div className="rounded-xl border border-blue-150 bg-blue-50/30 p-3 flex gap-2.5 items-start">
            <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-[11px] text-blue-750 font-sans leading-relaxed">
              <span className="font-bold">Real-time Quantity Synchronization:</span> Logging an <strong>Incoming Shipment</strong> automatically incorporates the specified delivery quantity into the respective asset's active good-count inventory values and total logged ledger amounts seamlessly.
            </div>
          </div>
        </div>
      )}

      {/* REGISTER ASSET MODAL DIALOG */}
      {isModalOpen && (
        <div id="inventory-modal-container" className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="w-full max-w-sm rounded-xl border border-zinc-250 bg-white p-5 shadow-2xl">
            <h3 className="font-sans text-sm font-bold text-zinc-900">
              {editingItem ? `Edit Asset Log: "${name}"` : 'Log New Asset Group'}
            </h3>
            <p className="mt-1 font-sans text-xs text-zinc-400">
              Set specifications, categories, categories condition states of active inventory stock.
            </p>

            {formError && (
              <div className="mt-3 rounded-lg bg-red-50 border border-red-155 p-2 text-xs font-semibold text-red-650 flex gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              {/* Asset Name text */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-505 uppercase tracking-wide mb-1">
                  Asset Title/Description
                </label>
                <input
                  id="modal-inv-name"
                  type="text"
                  placeholder="e.g. Ergonomic Study Desk A-Type"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-250 px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-800 focus:outline-hidden"
                />
              </div>

              {/* Asset Category drop select */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-505 uppercase tracking-wide mb-1">
                  Category Group
                </label>
                <select
                  id="modal-inv-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full rounded-lg border border-zinc-250 px-2.5 py-1.5 text-xs text-zinc-900 focus:border-zinc-805 focus:outline-hidden"
                >
                  <option value="Furniture">Furniture & Woodwork</option>
                  <option value="Electronics">Electrical Appliances & Routers</option>
                  <option value="Bedding">Bedding, Pillow & Covers</option>
                  <option value="Utility">Utility, Tools & Cleaning</option>
                  <option value="Safety">Safety & Fire Preventions</option>
                </select>
              </div>

              {/* Counts layout split */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">
                    Good Stock
                  </label>
                  <input
                    id="modal-inv-good"
                    type="number"
                    min="0"
                    value={goodCount}
                    onChange={(e) => setGoodCount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full rounded-lg border border-zinc-250 py-1 px-1.5 text-center text-xs text-zinc-900 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">
                    In Repair
                  </label>
                  <input
                    id="modal-inv-repair"
                    type="number"
                    min="0"
                    value={repairCount}
                    onChange={(e) => setRepairCount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full rounded-lg border border-zinc-250 py-1 px-1.5 text-center text-xs text-zinc-900 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">
                    Damaged
                  </label>
                  <input
                    id="modal-inv-damaged"
                    type="number"
                    min="0"
                    value={damagedCount}
                    onChange={(e) => setDamagedCount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full rounded-lg border border-zinc-250 py-1 px-1.5 text-center text-xs text-zinc-900 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Physical Storage Location */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-505 uppercase tracking-wide mb-1">
                  Designated Area / Storage Room
                </label>
                <input
                  id="modal-inv-location"
                  type="text"
                  placeholder="e.g. Storage Depot B, Rooms A101-A120"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-lg border border-zinc-250 px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-800 focus:outline-hidden"
                />
              </div>

              {/* Alert Threshold Field */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-505 uppercase tracking-wide mb-1">
                  Low Stock Alert Threshold
                </label>
                <div className="relative">
                  <input
                    id="modal-inv-minrequired"
                    type="number"
                    min="0"
                    placeholder="Min safe good count"
                    value={minRequired}
                    onChange={(e) => setMinRequired(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full rounded-lg border border-zinc-250 px-3 py-1.5 pr-14 text-xs text-zinc-900 focus:border-zinc-800 focus:outline-hidden"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase">units</span>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-zinc-150 pt-3 mt-4">
                <button
                  id="inv-modal-cancel"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-650 hover:bg-zinc-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="inv-modal-save"
                  type="submit"
                  className="rounded-lg bg-zinc-950 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-zinc-805 cursor-pointer"
                >
                  {editingItem ? 'Save Record' : 'Register Items'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD INCOMING STOCK MODAL DIALOG */}
      {isIncomingModalOpen && (
        <div id="incoming-stock-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 p-4 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="w-full max-w-lg rounded-xl border border-zinc-250 bg-white p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-zinc-150 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-emerald-100 p-1.5 text-emerald-700">
                  <Truck className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="font-sans text-sm font-bold text-zinc-900">Record Incoming Shipment</h3>
                  <p className="text-[11px] text-zinc-450 font-medium">Log newly acquired stock items with supplier invoices.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsIncomingModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-650 p-1 rounded-lg hover:bg-zinc-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <div className="rounded-lg bg-red-50 border border-red-155 p-2 px-3 text-xs font-semibold text-red-650 mb-4 flex gap-2 items-center">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleIncomingSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Select Asset Item */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-505 uppercase tracking-wide mb-1">
                    Reference Asset Line *
                  </label>
                  <select
                    id="incoming-item-id-select"
                    value={incomingItemId}
                    onChange={(e) => setIncomingItemId(e.target.value)}
                    className="w-full rounded-lg border border-zinc-250 px-2.5 py-1.5 text-xs text-zinc-900 focus:border-zinc-800 focus:outline-hidden bg-white font-medium"
                    required
                  >
                    <option value="" disabled>-- Select Logged Asset --</option>
                    {inventory.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Delivery Date */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-505 uppercase tracking-wide mb-1">
                    Delivery / Invoice Date *
                  </label>
                  <input
                    id="incoming-date-input"
                    type="date"
                    value={incomingDate}
                    onChange={(e) => setIncomingDate(e.target.value)}
                    className="w-full rounded-lg border border-zinc-250 px-3 py-1.5 text-xs text-zinc-900 focus:border-zinc-800 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Quantity and unit cost */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-505 uppercase tracking-wide mb-1">
                    Quantity Received *
                  </label>
                  <div className="relative">
                    <input
                      id="incoming-quantity-input"
                      type="number"
                      min="1"
                      value={incomingQuantity}
                      onChange={(e) => setIncomingQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full rounded-lg border border-zinc-250 px-3 py-1.5 text-xs text-zinc-900 focus:border-zinc-800 focus:outline-hidden"
                      required
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">units</span>
                    </div>
                  </div>
                </div>

                {/* Purchase Cost */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-505 uppercase tracking-wide mb-1">
                    Total Shipment Purchase Cost ($) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <span className="text-xs text-zinc-400 font-mono font-bold">$</span>
                    </div>
                    <input
                      id="incoming-purchase-cost"
                      type="number"
                      min="0"
                      step="any"
                      placeholder="e.g. 750.00"
                      value={purchaseCost}
                      onChange={(e) => setPurchaseCost(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full rounded-lg border border-zinc-250 pl-7 pr-3 py-1.5 text-xs text-zinc-900 font-mono focus:border-zinc-800 focus:outline-hidden"
                      required
                    />
                  </div>
                  {incomingQuantity > 0 && (
                    <span className="block mt-1 text-[10px] text-zinc-400 font-sans">
                      Calculates to <strong className="font-mono text-zinc-600">${Math.round((purchaseCost / incomingQuantity) * 100) / 100}</strong> average per unit.
                    </span>
                  )}
                </div>
              </div>

              {/* SUPPLIER DETAILS FIELDSET */}
              <div className="rounded-xl border border-zinc-200 p-4 bg-zinc-50/50 space-y-3">
                <span className="block text-[10px] font-bold text-zinc-450 uppercase tracking-wider">
                  Partner Supplier Details
                </span>

                <div>
                  <label className="block text-[10px] font-semibold text-zinc-600 mb-1">Supplier / Factory Name</label>
                  <input
                    id="supplier-name-input"
                    type="text"
                    placeholder="e.g. Apex Net Solutions, Royal Oak Corp"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full rounded-lg border border-zinc-250 bg-white px-3 py-1.2 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-800 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-600 mb-1">Contact Phone</label>
                    <input
                      id="supplier-contact-input"
                      type="text"
                      placeholder="e.g. +1 (555) 902-1144"
                      value={supplierContact}
                      onChange={(e) => setSupplierContact(e.target.value)}
                      className="w-full rounded-lg border border-zinc-250 bg-white px-3 py-1.2 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-800 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-600 mb-1">Professional Email</label>
                    <input
                      id="supplier-email-input"
                      type="email"
                      placeholder="e.g. sales@supplyingcorp.com"
                      value={supplierEmail}
                      onChange={(e) => setSupplierEmail(e.target.value)}
                      className="w-full rounded-lg border border-zinc-250 bg-white px-3 py-1.2 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-800 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* INVOICE UPLOAD CONTAINER */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-505 uppercase tracking-wide mb-1">
                  Upload PDF Procurement Invoice
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`rounded-xl border-2 border-dashed p-4 text-center transition-all ${
                    isDragging
                      ? 'border-emerald-505 bg-emerald-50/20'
                      : invoiceFileName
                      ? 'border-emerald-200 bg-emerald-50/10'
                      : 'border-zinc-250 bg-white hover:bg-zinc-50/50'
                  }`}
                >
                  {isUploading ? (
                    <div className="space-y-1.5 py-2">
                      <span className="inline-flex h-2 w-2 rounded-full bg-emerald-600 animate-ping" />
                      <span className="block text-xs font-semibold text-zinc-700">Uploading invoice attachment...</span>
                    </div>
                  ) : invoiceFileName ? (
                    <div className="flex items-center justify-between bg-zinc-50 border border-zinc-200 rounded-lg p-2 max-w-sm mx-auto">
                      <div className="flex items-center gap-2 text-left">
                        <FileText className="h-5 w-5 text-emerald-600 shrink-0" />
                        <div className="overflow-hidden">
                          <span className="block text-xs font-bold text-zinc-850 truncate max-w-52">
                            {invoiceFileName}
                          </span>
                          <span className="block text-[9px] text-zinc-400 font-mono uppercase">Verified PDF attachment</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setInvoiceFileName('')}
                        className="text-xs text-red-500 hover:text-red-700 font-semibold p-1 hover:bg-red-50 rounded"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block py-2.5">
                      <input
                        type="file"
                        accept="application/pdf,image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <UploadCloud className="mx-auto h-7 w-7 text-zinc-400 mb-1" />
                      <span className="block text-xs font-bold text-zinc-700">
                        Drag your invoice here, or <span className="text-emerald-600 underline">browse</span>
                      </span>
                      <span className="block text-[9px] text-zinc-400 mt-1 font-medium">
                        Supports PDF invoices, PNG, JPEG receipts up to 10MB
                      </span>
                    </label>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-505 uppercase tracking-wide mb-1">
                  Staff Notes & Comments
                </label>
                <textarea
                  id="incoming-notes"
                  placeholder="Reference budget codes, shipping details, or hostel installation locations..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full text-xs rounded-lg border border-zinc-250 p-2.5 focus:border-zinc-800 focus:outline-hidden text-zinc-900"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-zinc-150 pt-3 mt-4">
                <button
                  id="incoming-cancel-btn"
                  type="button"
                  onClick={() => setIsIncomingModalOpen(false)}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-650 hover:bg-zinc-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="incoming-save-btn"
                  type="submit"
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-semibold text-white cursor-pointer transition"
                >
                  Post Stock Shipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HIGH-FIDELITY INTERACTIVE INVOICE VIEWER MODAL */}
      {selectedRecordForInvoice && (
        <div id="invoice-viewer-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 p-4 backdrop-blur-xs animate-in font-sans">
          <div className="w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl overflow-hidden relative">
            
            {/* Header toolbar */}
            <div className="flex items-center justify-between border-b border-zinc-150 pb-3 mb-4">
              <div className="flex items-center gap-1.5 font-sans font-bold text-zinc-900 text-xs">
                <Receipt className="h-4 w-4 text-emerald-600" />
                <span>Invoice PDF Previewer</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecordForInvoice(null)}
                className="text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 p-1 cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Fully styled physical mock invoice resembling absolute reality */}
            <div className="border border-zinc-250 bg-zinc-50 p-6 rounded-lg font-mono text-[11px] text-zinc-800 space-y-4 shadow-inner max-h-[460px] overflow-y-auto">
              
              {/* Document Title Header */}
              <div className="flex justify-between items-start border-b-2 border-dashed border-zinc-350 pb-3">
                <div>
                  <h2 className="font-serif text-sm font-bold tracking-tight text-zinc-900">
                    {selectedRecordForInvoice.supplierName || 'SPOT SUPPLIER CORP'}
                  </h2>
                  <span className="block mt-1 font-sans text-[9px] text-zinc-400 uppercase tracking-widest font-semibold">
                    ORIGINAL SERVICE INVOICE
                  </span>
                </div>
                <div className="text-right">
                  <span className="block font-bold text-zinc-900 uppercase">INV-2026-{Math.floor(10224 + Math.random() * 89212)}</span>
                  <span className="block text-[10px] text-zinc-400 mt-1">Date: {selectedRecordForInvoice.date}</span>
                </div>
              </div>

              {/* Shipping/Billing */}
              <div className="grid grid-cols-2 gap-4 text-[10px] py-1 border-b border-zinc-200 leading-relaxed font-sans">
                <div>
                  <span className="block font-bold text-zinc-500 uppercase tracking-wider mb-1">Billed To:</span>
                  <span className="block font-bold text-zinc-800">Aspire Residency Hostel</span>
                  <span className="block text-zinc-500">Student Housing Logistics Office</span>
                  <span className="block text-zinc-500">Suite 404, Campus Central</span>
                </div>
                <div>
                  <span className="block font-bold text-zinc-500 uppercase tracking-wider mb-1">Supplier Contacts:</span>
                  <span className="block font-bold text-zinc-800">{selectedRecordForInvoice.supplierName || 'Direct Logistics'}</span>
                  {selectedRecordForInvoice.supplierEmail && (
                    <span className="block text-zinc-500 truncate">{selectedRecordForInvoice.supplierEmail}</span>
                  )}
                  {selectedRecordForInvoice.supplierContact && (
                    <span className="block text-zinc-500 font-mono">{selectedRecordForInvoice.supplierContact}</span>
                  )}
                </div>
              </div>

              {/* Invoice lines */}
              <div className="space-y-2 py-2">
                <div className="grid grid-cols-12 font-bold border-b border-zinc-300 pb-1 text-zinc-500 font-sans tracking-wide">
                  <span className="col-span-6 uppercase">Description</span>
                  <span className="col-span-2 text-center uppercase">Qty</span>
                  <span className="col-span-2 text-right uppercase">Rate</span>
                  <span className="col-span-2 text-right uppercase">Total</span>
                </div>

                <div className="grid grid-cols-12 py-1 items-center">
                  <span className="col-span-6 text-zinc-900 font-bold font-sans">
                    {selectedRecordForInvoice.inventoryItemName}
                  </span>
                  <span className="col-span-2 text-center font-mono font-semibold">
                    {selectedRecordForInvoice.quantity} pcs
                  </span>
                  <span className="col-span-2 text-right font-mono font-semibold">
                    ${(selectedRecordForInvoice.purchaseCost / (selectedRecordForInvoice.quantity || 1)).toFixed(2)}
                  </span>
                  <span className="col-span-2 text-right font-mono font-bold text-zinc-900">
                    ${selectedRecordForInvoice.purchaseCost?.toFixed(2)}
                  </span>
                </div>

                {selectedRecordForInvoice.notes && (
                  <div className="border-t border-zinc-200 pt-2 text-[10px] font-sans text-zinc-450 leading-relaxed">
                    <strong>Payment Notes:</strong> {selectedRecordForInvoice.notes}
                  </div>
                )}
              </div>

              {/* Total calculations */}
              <div className="border-t-2 border-zinc-300 pt-2 space-y-1 text-right">
                <div className="flex justify-between font-sans text-[10px] text-zinc-505">
                  <span>Subtotal Amount:</span>
                  <span className="font-mono font-bold">${selectedRecordForInvoice.purchaseCost?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-sans text-[10px] text-zinc-550">
                  <span>Standard VAT/Tax (0% Code):</span>
                  <span className="font-mono">$0.00</span>
                </div>
                <div className="flex justify-between border-t border-zinc-200 pt-1 text-xs font-bold">
                  <span className="font-sans text-zinc-900 uppercase">Grand Total (USD):</span>
                  <span className="font-mono text-emerald-700">${selectedRecordForInvoice.purchaseCost?.toFixed(2)}</span>
                </div>
              </div>

              {/* Visual Stamp Certificate of Purchase */}
              <div className="pt-2 flex justify-between items-end">
                <div className="border-2 border-emerald-500/60 rounded px-2.5 py-1 text-center rotate-[-3deg] inline-block">
                  <span className="block font-bold text-emerald-600 text-[10px] tracking-widest uppercase">PAID & VERIFIED</span>
                  <span className="block text-[8px] text-emerald-505/80 font-sans">ACH FUND CLEARANCE</span>
                </div>

                <div className="text-right text-[8px] text-zinc-450 font-sans leading-relaxed">
                  <span className="block italic">Authorized Procurement Representative</span>
                  <div className="h-6 w-32 ml-auto mt-1 border-b border-zinc-300 opacity-60" />
                  <span className="block mt-1 font-mono">ASPIRE HOUSING SERVICES</span>
                </div>
              </div>
            </div>

            {/* Action Bottom */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-150">
              <span className="text-[10px] text-zinc-450 font-sans flex items-center gap-1">
                <FileText className="h-3 w-3 text-emerald-600" />
                Source File Reference: {selectedRecordForInvoice.invoiceFileName || 'LOG_RECEIPT_VERIFY.pdf'}
              </span>
              <button
                type="button"
                onClick={() => {
                  alert(`Starting attachment download for "${selectedRecordForInvoice.invoiceFileName || 'Invoice'}"... (Simulated download complete)`);
                }}
                className="rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white font-sans text-xs font-semibold px-3 py-1.5 transition cursor-pointer"
              >
                Download Invoice File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern State-Based Confirm Delete modal for Asset items */}
      {deleteConfirmItemId && (
        <div id="delete-asset-confirm-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl border border-zinc-250 bg-white p-5 shadow-2xl animate-in flip-in-x duration-150 font-sans">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-650">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-sans text-sm font-bold text-zinc-900">
                  Remove Inventory Asset?
                </h3>
                <p className="mt-1.5 font-sans text-xs text-zinc-500 font-medium leading-relaxed">
                  Are you sure you want to remove <strong className="text-zinc-800">"{inventory.find(i => i.id === deleteConfirmItemId)?.name}"</strong> from logistics? This will wipe out all corresponding quantities and records from the live asset stock register completely.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-zinc-150 pt-3 mt-4">
              <button
                id="delete-asset-confirm-cancel-btn"
                type="button"
                onClick={() => setDeleteConfirmItemId(null)}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-650 hover:bg-zinc-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="delete-asset-confirm-confirm-btn"
                type="button"
                onClick={() => {
                  deleteInventoryItem(deleteConfirmItemId);
                  setDeleteConfirmItemId(null);
                }}
                className="rounded-lg bg-red-650 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern State-Based Confirm Delete modal for Stock Records (Ledger Log) */}
      {deleteConfirmRecordId && (
        <div id="delete-record-confirm-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl border border-zinc-250 bg-white p-5 shadow-2xl animate-in flip-in-x duration-150 font-sans">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-650">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-sans text-sm font-bold text-zinc-900">
                  Delete Stock Transaction Record?
                </h3>
                <p className="mt-1.5 font-sans text-xs text-zinc-500 font-medium leading-relaxed">
                  Are you sure you want to delete this stock transaction record of <strong className="text-zinc-800">"{stockRecords?.find(r => r.id === deleteConfirmRecordId)?.inventoryItemName}"</strong> from history logs? This will <strong className="text-red-700 font-semibold">NOT</strong> retroactively reverse physical stocks.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-zinc-150 pt-3 mt-4">
              <button
                id="delete-record-confirm-cancel-btn"
                type="button"
                onClick={() => setDeleteConfirmRecordId(null)}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-650 hover:bg-zinc-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="delete-record-confirm-confirm-btn"
                type="button"
                onClick={() => {
                  deleteStockRecord(deleteConfirmRecordId);
                  setDeleteConfirmRecordId(null);
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
