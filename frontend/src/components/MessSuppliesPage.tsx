/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Search,
  Plus,
  Trash2,
  AlertTriangle,
  ChevronRight,
  TrendingDown,
  ShoppingBag,
  Sparkles,
  RefreshCcw,
  Check,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useAppState } from '../AppContext';
import { MessSupply } from '../types';

export const MessSuppliesPage: React.FC = () => {
  const { messSupplies, addMessSupply, updateMessQuantity, deleteMessSupply, currentUser } = useAppState();

  // Create Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Deletion confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Grains & Pulses' | 'Dairy' | 'Vegetables' | 'Spices & Pantry'>('Grains & Pulses');
  const [quantity, setQuantity] = useState(10);
  const [unit, setUnit] = useState('kg');
  const [minRequired, setMinRequired] = useState(25);
  const [formError, setFormError] = useState('');

  // Filtering + Searching States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Currently inspected supply for weekly consumption trends chart
  const [inspectedSupplyId, setInspectedSupplyId] = useState<string>(() => {
    return messSupplies[0]?.id || '';
  });

  const handleOpenAdd = () => {
    setName('');
    setCategory('Grains & Pulses');
    setQuantity(50);
    setUnit('kg');
    setMinRequired(20);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Supply item name is required.');
      return;
    }
    if (!unit.trim()) {
      setFormError('Unit (e.g. kg, Bags) is required.');
      return;
    }

    const qty = Number(quantity) || 0;
    const minReq = Number(minRequired) || 0;

    // Generate arbitrary last 5 weeks consumption trends centering around minReq/1.5
    const baseUsage = Math.round(minReq * 1.8);
    const mockConsumption = Array.from({ length: 5 }).map(
      () => Math.max(5, baseUsage + Math.round(Math.random() * 20 - 10))
    );

    addMessSupply({
      name: name.trim(),
      category,
      quantity: qty,
      unit: unit.trim(),
      minRequired: minReq,
      weeklyConsumption: mockConsumption,
    });

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  // Filter food list
  const filteredSupplies = messSupplies.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const activeInspectedSupply = messSupplies.find((s) => s.id === inspectedSupplyId) || messSupplies[0];

  // Map weekly consumption to recharts compatibility
  const chartData = activeInspectedSupply
    ? activeInspectedSupply.weeklyConsumption.map((val, idx) => ({
        week: `Wk ${idx + 1}`,
        consumption: val,
      }))
    : [];

  // Summary Metrics
  const lowStockCount = messSupplies.filter((m) => m.status === 'Low Stock').length;
  const outOfStockCount = messSupplies.filter((m) => m.status === 'Out of Stock').length;

  return (
    <div className="space-y-6">
      {/* Visual alerts banner if low or out of stock */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-250">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-800">Critical Pantry Deficit</h4>
              <p className="text-xs text-amber-700 leading-relaxed max-w-xl">
                There are currently <strong>{outOfStockCount} items completely depleted</strong> and{' '}
                <strong>{lowStockCount} items hovering below acceptable margins</strong>. Procure replenishment quickly to prevent kitchen disruption.
              </p>
            </div>
          </div>
          {currentUser?.role !== 'Staff' && (
            <button
              onClick={handleOpenAdd}
              className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700 transition shrink-0"
            >
              Replenish Now
            </button>
          )}
        </div>
      )}

      {/* Primary Layout Grid split: Left List, Right Consumption Chart */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* LEFT COLUMN: Food ledger list */}
        <div className="rounded-xl border border-zinc-200 bg-white p-4.5 lg:col-span-2 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-150 pb-4">
            <div>
              <h3 className="text-sm.5 font-bold text-zinc-900">Food Stock Ledger</h3>
              <p className="font-sans text-xs text-zinc-400">Total list of grocery goods and seasoning stock</p>
            </div>
            
            {currentUser?.role !== 'Staff' && (
              <button
                id="add-pantry-trigger"
                onClick={handleOpenAdd}
                className="flex cursor-pointer items-center justify-center gap-1 rounded-lg bg-zinc-950 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-zinc-805"
              >
                <Plus className="h-4 w-4" />
                <span>Log Grocery Item</span>
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-col gap-3 min-w-full sm:flex-row sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-zinc-400" />
              <input
                id="pantry-search-input"
                type="text"
                placeholder="Search pantry commodities (e.g. wheat, eggs)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-zinc-250 bg-white py-1.5 pr-3 pl-8.5 text-xs text-zinc-800 placeholder-zinc-400 focus:border-zinc-800 focus:outline-hidden"
              />
            </div>

            <select
              id="filter-pantry-category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-zinc-250 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-700"
            >
              <option value="All">All Food Groups</option>
              <option value="Grains & Pulses">Grains & Pulses</option>
              <option value="Dairy">Dairy & Eggs</option>
              <option value="Vegetables">Vegetables & Greens</option>
              <option value="Spices & Pantry">Spices & Pantry</option>
            </select>
          </div>

          {/* List display */}
          <div id="pantry-items-list" className="space-y-2 max-h-125 overflow-y-auto pr-1">
            {filteredSupplies.length === 0 ? (
              <div className="text-center py-8 font-sans text-xs text-zinc-400">
                No food supplies match current search filter values.
              </div>
            ) : (
              filteredSupplies.map((item) => {
                const isSelected = activeInspectedSupply?.id === item.id;
                return (
                  <div
                    id={`pantry-card-${item.id}`}
                    key={item.id}
                    className={`rounded-xl border p-3 flex items-center justify-between gap-4 transition cursor-pointer hover:border-zinc-400 ${
                      isSelected
                        ? 'border-zinc-950 bg-zinc-50'
                        : item.status === 'Out of Stock'
                        ? 'border-red-150 bg-red-50/5'
                        : item.status === 'Low Stock'
                        ? 'border-amber-150 bg-amber-50/5'
                        : 'border-zinc-200'
                    }`}
                    onClick={() => setInspectedSupplyId(item.id)}
                  >
                    {/* Visual metadata block */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-sans text-sm font-bold text-zinc-900 truncate">
                          {item.name}
                        </h4>
                        <span
                          className={`rounded-full px-1.5 py-0.25 font-mono text-[8.5px] uppercase border font-bold ${
                            item.status === 'In Stock'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-150'
                              : item.status === 'Low Stock'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-red-50 text-red-650 border-red-150'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-1 font-sans text-[10.5px] text-zinc-400 uppercase tracking-wider font-bold">
                        {item.category} &bull; Safety min: {item.minRequired}{item.unit}
                      </p>
                      <span className="font-mono text-[9px] text-zinc-400">Last stocked: {item.lastStockDate}</span>
                    </div>

                    {/* Stock level modifier +/- controls */}
                    <div className="flex items-center gap-2.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {currentUser?.role !== 'Staff' ? (
                        <>
                          {/* Decrementor triggers */}
                          <button
                            id={`dec-pantry-heavy-${item.id}`}
                            onClick={() => updateMessQuantity(item.id, item.quantity - 10)}
                            className="rounded-md border border-zinc-205 py-0.5 px-1.5 font-mono text-[10px] font-semibold hover:bg-zinc-100 text-zinc-550"
                            title="-10 units"
                          >
                            -10
                          </button>
                          <button
                            id={`dec-pantry-light-${item.id}`}
                            onClick={() => updateMessQuantity(item.id, item.quantity - 1)}
                            className="rounded-md border border-zinc-205 py-0.5 px-1.5 font-mono text-[10px] font-semibold hover:bg-zinc-100 text-zinc-550"
                            title="-1 unit"
                          >
                            -1
                          </button>

                          {/* Display quantity */}
                          <div className="text-center min-w-16">
                            <span className="block font-sans text-sm font-extrabold text-zinc-900">
                              {item.quantity}
                            </span>
                            <span className="font-mono text-[10px] text-zinc-400 uppercase font-bold">{item.unit}</span>
                          </div>

                          {/* Incrementor triggers */}
                          <button
                            id={`inc-pantry-light-${item.id}`}
                            onClick={() => updateMessQuantity(item.id, item.quantity + 1)}
                            className="rounded-md border border-zinc-205 py-0.5 px-1.5 font-mono text-[10px] font-semibold hover:bg-zinc-100 text-zinc-550"
                            title="+1 unit"
                          >
                            +1
                          </button>
                          <button
                            id={`inc-pantry-heavy-${item.id}`}
                            onClick={() => updateMessQuantity(item.id, item.quantity + 10)}
                            className="rounded-md border border-zinc-205 py-0.5 px-1.5 font-mono text-[10px] font-semibold hover:bg-zinc-100 text-zinc-550"
                            title="+10 units"
                          >
                            +10
                          </button>

                          {/* Settings trash bin */}
                          <button
                            id={`delete-pantry-${item.id}`}
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded-lg border border-zinc-200 text-zinc-400 hover:text-red-650 hover:bg-red-50 cursor-pointer text-right ml-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 py-1.5 px-3 rounded-lg font-mono">
                          <span className="text-xs font-bold text-zinc-800">{item.quantity}</span>
                          <span className="text-[10px] text-zinc-400 uppercase font-bold">{item.unit}</span>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive weekly consumption overview */}
        <div id="pantry-trends-panel" className="rounded-xl border border-zinc-200 bg-white p-4.5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-zinc-150 pb-3">
              <span className="font-mono text-[9px] uppercase tracking-wider font-extrabold text-zinc-400">Logistical Metrics</span>
              <h3 className="font-sans text-sm.5 font-extrabold text-zinc-900 mt-0.5 leading-tight">
                Weekly Food Consumption Overview
              </h3>
              <p className="font-sans text-xs text-zinc-400 mt-1">
                Visualizing physical stock depletion logs across the past 5 weeks
              </p>
            </div>

            {activeInspectedSupply ? (
              <div className="space-y-4">
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3">
                  <span className="block font-mono text-[9px] uppercase font-bold text-zinc-400">Inspecting Supply</span>
                  <span className="font-sans text-[13px] font-bold text-zinc-850 block mt-1">
                    {activeInspectedSupply.name}
                  </span>
                  <div className="mt-2.5 flex items-center justify-between text-xs pt-2 border-t border-zinc-155">
                    <div>
                      <span className="text-zinc-400 block font-sans text-[10px]">Stock Level</span>
                      <strong className="text-sm font-semibold">{activeInspectedSupply.quantity} {activeInspectedSupply.unit}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-400 block font-sans text-[10px]">Weekly Average</span>
                      <strong className="text-sm font-semibold">
                        {Math.round(
                          activeInspectedSupply.weeklyConsumption.reduce((a, b) => a + b, 0) / 5
                        )}{' '}
                        {activeInspectedSupply.unit}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Line Chart */}
                <div className="h-52 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                      <XAxis dataKey="week" stroke="#a1a1aa" fontSize={11} tickLine={false} />
                      <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '11px' }} />
                      <Line
                        type="monotone"
                        dataKey="consumption"
                        stroke="#18181b"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-xs text-zinc-400">
                Select an item on the left to see weekly analytics trends
              </div>
            )}
          </div>

          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 mt-8 space-y-2">
            <span className="block font-mono text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Mess Hall Quick Tip</span>
            <p className="font-sans text-[11px] leading-relaxed text-zinc-505">
              Stock margins are recalculated automatically. Placing stock below safety minima fires real-time system warnings in the administrator dashboard layout.
            </p>
          </div>
        </div>

      </div>

      {/* Grocery addition modal */}
      {isModalOpen && (
        <div id="mess-modal-container" className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl border border-zinc-250 bg-white p-5 shadow-2xl">
            <h3 className="font-sans text-sm font-bold text-zinc-900">
              Log New Pantry Supply
            </h3>
            <p className="mt-1 font-sans text-xs text-zinc-400">
              Register stock levels, unit parameters, and safety limits.
            </p>

            {formError && (
              <div className="mt-3 rounded-lg bg-red-50 border border-red-155 p-2 text-xs font-semibold text-red-650 flex gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              {/* Name */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-505 uppercase tracking-wide mb-1">
                  Grocery Commodity Title
                </label>
                <input
                  id="modal-mess-name"
                  type="text"
                  placeholder="e.g. Basmati Premium Rice, Cow Milk"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-250 px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-800 focus:outline-hidden"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-505 uppercase tracking-wide mb-1">
                  Food Group Category
                </label>
                <select
                  id="modal-mess-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full rounded-lg border border-zinc-250 px-2.5 py-1.5 text-xs text-zinc-900 focus:border-zinc-800 focus:outline-hidden"
                >
                  <option value="Grains & Pulses">Grains, Flour & Pulses</option>
                  <option value="Dairy">Dairy Products & Eggs</option>
                  <option value="Vegetables">Vegetables & Fruits</option>
                  <option value="Spices & Pantry">Spices, Oils & Baking Goods</option>
                </select>
              </div>

              {/* Counts variables split */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">
                    Initial Stock
                  </label>
                  <input
                    id="modal-mess-qty"
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full rounded-lg border border-zinc-250 py-1.5 px-2 text-center text-xs text-zinc-900 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">
                    Measurement Unit
                  </label>
                  <input
                    id="modal-mess-unit"
                    type="text"
                    placeholder="kg, Pcs, Litres"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full rounded-lg border border-zinc-250 py-1.5 px-2 text-center text-xs text-zinc-900 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">
                    Min Margin (Req)
                  </label>
                  <input
                    id="modal-mess-min"
                    type="number"
                    min="0"
                    value={minRequired}
                    onChange={(e) => setMinRequired(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full rounded-lg border border-zinc-250 py-1.5 px-1 text-center text-xs text-zinc-900 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Submit triggers */}
              <div className="flex items-center justify-end gap-2 border-t border-zinc-150 pt-3 mt-4">
                <button
                  id="mess-modal-cancel"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-650 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  id="mess-modal-save"
                  type="submit"
                  className="rounded-lg bg-zinc-950 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-zinc-805"
                >
                  Log Grocery item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Registry Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div id="delete-pantry-confirm-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl border border-zinc-250 bg-white p-5 shadow-2xl animate-in flip-in-x duration-150">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-650">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-sans text-sm font-bold text-zinc-900">
                  Delete Pantry Item?
                </h3>
                <p className="mt-1.5 font-sans text-xs text-zinc-550 font-medium leading-relaxed">
                  Are you sure you want to permanently delete <strong className="text-zinc-800">"{messSupplies.find(ms => ms.id === deleteConfirmId)?.name}"</strong> from the pantry inventory database?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-zinc-150 pt-3 mt-4">
              <button
                id="delete-pantry-confirm-cancel-btn"
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-650 hover:bg-zinc-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="delete-pantry-confirm-btn"
                type="button"
                onClick={() => {
                  if (deleteConfirmId) {
                    deleteMessSupply(deleteConfirmId);
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
