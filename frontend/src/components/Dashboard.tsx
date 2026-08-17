/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Users,
  Home,
  Bed,
  Box,
  Wrench,
  TrendingUp,
  AlertTriangle,
  Play,
  ArrowUpRight,
  ClipboardList,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAppState } from '../AppContext';
import { MONTHLY_STU_INTAKE, REPLAY_TRENDS } from '../mockData';
import AIChatbot from "./AIChatbot";

export const Dashboard: React.FC<{ setView: (view: any) => void }> = ({ setView }) => {
  const { rooms, students, inventory, maintenance, systemLogs, currentUser, dashboardStats } =
    useAppState();

  const lowStockCount = inventory.filter((item) => item.goodCount <= (item.minRequired ?? 5)).length;

  // 1. KPI Computations (prefer backend dashboard stats when available)
  const totalStudents = dashboardStats?.totalStudents ?? students.length;
  const totalRooms = dashboardStats?.totalRooms ?? rooms.length;
  const occupiedBeds = rooms.reduce((acc, r) => acc + r.occupied, 0);
  const totalCapacity = rooms.reduce((acc, r) => acc + r.capacity, 0);
  const occupancyPercent = totalCapacity > 0 ? Math.round((occupiedBeds / totalCapacity) * 100) : 0;

  const availableInventoryItems = inventory.reduce((acc, i) => acc + i.goodCount, 0);
  const pendingRequests =
    dashboardStats?.pendingMaintenance ?? maintenance.filter((m) => m.status === 'Pending').length;
  const inProgressRequests =
    dashboardStats?.inProgressMaintenance ??
    maintenance.filter((m) => m.status === 'In Progress').length;
  const completedRequests =
    dashboardStats?.completedMaintenance ??
    maintenance.filter((m) => m.status === 'Completed').length;
  const pendingHostelRequests = dashboardStats?.pendingRequests ?? 0;

  // 2. Room Availability Chart calculations (by Status)
  const roomStatusData = [
    { name: 'Available Rooms', value: rooms.filter((r) => r.status === 'Available').length },
    { name: 'Full Rooms', value: rooms.filter((r) => r.status === 'Full').length },
    { name: 'Maintenance', value: rooms.filter((r) => r.status === 'Maintenance').length },
  ];

  // 3. Maintenance Requests Pie Chart
  const maintenancePieData = [
    { name: 'Pending', value: pendingRequests, color: '#A19173' },
    { name: 'In Progress', value: inProgressRequests, color: '#8EA1A0' },
    { name: 'Completed', value: completedRequests, color: '#415C47' },
  ];

  // 4. Occupancy Rate Historical Trend data (Simulated past 6 months)
  const occupancyTrends = [
    { month: 'Jan', rate: 72 },
    { month: 'Feb', rate: 75 },
    { month: 'Mar', rate: 79 },
    { month: 'Apr', rate: 84 },
    { month: 'May', rate: 89 },
    { month: 'Jun', rate: occupancyPercent },
  ];

  // 5. Inventory Asset Categories Breakdown
  const inventoryCategoryData = inventory.map(item => ({
    name: item.name.length > 15 ? `${item.name.substring(0, 15)}...` : item.name,
    Good: item.goodCount,
    Damaged: item.damagedCount,
    InRepair: item.repairCount,
  }));

  const COLORS = ['#567A5E', '#C8B89A', '#D9E2E1', '#E2DFD9'];

  const kpis = [
    {
      id: 'kpi-students',
      title: 'Total Students',
      value: totalStudents,
      sub: `${students.filter((s) => s.roomNumber === null).length} unallotted · ${pendingHostelRequests} room requests pending`,
      icon: Users,
      color: 'bg-[#567A5E]/15 text-[#567A5E]',
      viewLink: 'students',
    },
    {
      id: 'kpi-rooms',
      title: 'Total Rooms',
      value: totalRooms,
      sub: `${rooms.filter((r) => r.status === 'Available').length} with free beds`,
      icon: Home,
      color: 'bg-[#D9E2E1]/30 text-[#141010]',
      viewLink: 'rooms',
    },
    {
      id: 'kpi-occupancy',
      title: 'Occupancy Rate',
      value: `${occupancyPercent}%`,
      sub: `${occupiedBeds} / ${totalCapacity} beds filled`,
      icon: Bed,
      color: 'bg-[#C8B89A]/30 text-[#141010]',
      viewLink: 'rooms',
    },
    {
      id: 'kpi-inventory',
      title: 'Usable Assets',
      value: availableInventoryItems,
      sub: lowStockCount > 0 ? `⚠️ ${lowStockCount} items running low!` : `${inventory.reduce((acc, i) => acc + i.damagedCount, 0)} damaged items`,
      icon: Box,
      color: 'bg-[#567A5E]/15 text-[#567A5E]',
      viewLink: 'inventory',
    },
    {
      id: 'kpi-requests',
      title: 'Pending Tickets',
      value: pendingRequests,
      sub: `${inProgressRequests} currently active`,
      icon: Wrench,
      color: 'bg-[#C8B89A]/15 text-[#141010]',
      viewLink: 'maintenance',
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              id={kpi.id}
              key={kpi.id}
              onClick={() => setView(kpi.viewLink as any)}
              className="group cursor-pointer rounded-xl border border-ivory bg-white p-5 shadow-xs transition-all hover:border-gold-accent hover:shadow-xs hover:translate-y-[-1px] duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="font-sans text-[10px] font-bold text-blue-gray-medium uppercase tracking-wider">
                  {kpi.title}
                </span>
                <div className={`rounded-lg p-2 ${kpi.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="font-serif text-2xl font-bold tracking-tight text-charcoal">
                  {kpi.value}
                </span>
                <p className="mt-1 font-mono text-[9px] text-[#6E7D91] truncate uppercase">
                  {kpi.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts Layout Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Occupancy Line Chart */}
        <div id="chart-occupancy" className="rounded-xl border border-ivory bg-white p-5 lg:col-span-2 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-ivory">
            <div>
              <h3 className="font-serif text-base font-bold text-charcoal tracking-wide">Hostel Occupancy Rate (%)</h3>
              <p className="font-sans text-xs text-blue-gray-medium">Historical trend showing percentage of beds allotted monthly</p>
            </div>
            <span className="flex items-center gap-1 font-mono text-[10px] font-bold text-charcoal bg-warm-white px-3 py-1 rounded-full border border-ivory uppercase tracking-wide">
              <TrendingUp className="h-3.5 w-3.5 text-gold-accent" />
              +{Math.abs(occupancyPercent - 72)}% Since Jan
            </span>
          </div>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={occupancyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2DFD9" />
                <XAxis dataKey="month" stroke="#6E7D91" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#6E7D91" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#F7F5F2', borderRadius: '8px', border: '1px solid #E2DFD9', fontSize: '11px' }}
                  formatter={(value) => [`${value}%`, 'Occupancy Rate']}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#567A5E"
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 1.5, fill: '#F7F5F2', stroke: '#567A5E' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Maintenance Request Status Pie Chart */}
        <div id="chart-maintenance" className="rounded-xl border border-ivory bg-white p-5 shadow-xs">
          <div className="pb-3 border-b border-ivory">
            <h3 className="font-serif text-base font-bold text-charcoal tracking-wide">Request Status Ratio</h3>
            <p className="font-sans text-xs text-blue-gray-medium">Active vs finished maintenance requests</p>
          </div>
          <div className="mt-4 flex flex-col items-center justify-center h-48">
            {pendingRequests + inProgressRequests + completedRequests === 0 ? (
              <p className="font-sans text-xs text-blue-gray-medium">No tickets found</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={maintenancePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {maintenancePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Tickets']} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* Pie Chart Legend */}
          <div className="mt-2 grid grid-cols-3 gap-2 border-t border-ivory pt-3">
            {maintenancePieData.map((item) => (
              <div key={item.name} className="text-center">
                <span className="block font-mono text-xs font-bold" style={{ color: item.color }}>
                  {item.value}
                </span>
                <span className="font-sans text-[10px] text-blue-gray-medium font-semibold">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Room Availability Status Bar Chart */}
        <div id="chart-room-availability" className="rounded-xl border border-ivory bg-white p-5 shadow-xs">
          <div className="pb-3 border-b border-ivory">
            <h3 className="font-serif text-base font-bold text-charcoal tracking-wide">Room Status Allocations</h3>
            <p className="font-sans text-xs text-blue-gray-medium">Total rooms by physical status levels</p>
          </div>
          <div className="mt-4 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roomStatusData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2DFD9" />
                <XAxis dataKey="name" stroke="#6E7D91" fontSize={10} tickLine={false} />
                <YAxis stroke="#6E7D91" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#F7F5F2', borderRadius: '8px', border: '1px solid #E2DFD9', fontSize: '11px' }} />
                <Bar dataKey="value" fill="#567A5E" radius={[4, 4, 0, 0]}>
                  {roomStatusData.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={idx === 0 ? '#567A5E' : idx === 1 ? '#8EA1A0' : '#A19173'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Student Intake */}
        <div id="chart-student-intake" className="rounded-xl border border-ivory bg-white p-5 shadow-xs">
          <div className="pb-3 border-b border-ivory">
            <h3 className="font-serif text-base font-bold text-charcoal tracking-wide">Monthly Enrollment Index</h3>
            <p className="font-sans text-xs text-blue-gray-medium">New student registrations across months</p>
          </div>
          <div className="mt-4 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MONTHLY_STU_INTAKE} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2DFD9" />
                <XAxis dataKey="name" stroke="#6E7D91" fontSize={11} tickLine={false} />
                <YAxis stroke="#6E7D91" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#F7F5F2', borderRadius: '8px', border: '1px solid #E2DFD9', fontSize: '11px' }} />
                <Line
                  type="monotone"
                  dataKey="intake"
                  stroke="#567A5E"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#C8B89A' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Item Tracking Bar/Line */}
        <div id="chart-inventory-trends" className="rounded-xl border border-ivory bg-white p-5 shadow-xs">
          <div className="pb-3 border-b border-ivory">
            <h3 className="font-serif text-base font-bold text-charcoal tracking-wide">Inventory Status Levels</h3>
            <p className="font-sans text-xs text-blue-gray-medium">Top log items with physical condition logs</p>
          </div>
          <div className="mt-4 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryCategoryData.slice(0, 4)} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2DFD9" />
                <XAxis dataKey="name" stroke="#6E7D91" fontSize={9} tickLine={false} />
                <YAxis stroke="#6E7D91" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#F7F5F2', borderRadius: '8px', border: '1px solid #E2DFD9', fontSize: '11px' }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="Good" stackId="a" fill="#415C47" />
                <Bar dataKey="InRepair" stackId="a" fill="#8EA1A0" />
                <Bar dataKey="Damaged" stackId="a" fill="#A19173" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Two-Column Footer Feed and Quick Board Panel */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Recent logs activity feed */}
        <div id="activity-feed" className="rounded-xl border border-ivory bg-white p-5 md:col-span-2 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-ivory">
            <h3 className="font-serif text-base font-bold text-charcoal">Audit Trail Logs</h3>
            <span className="font-mono text-[9px] text-[#2C2C2C]/50 font-bold uppercase tracking-wider">Live feed auto-recording</span>
          </div>
          <div className="mt-3.5 space-y-3 max-h-64 overflow-y-auto pr-1">
            {systemLogs.length === 0 ? (
              <div className="text-center py-8 text-xs text-blue-gray-medium/70 italic border border-dashed border-ivory rounded-xl bg-warm-white/10">
                No recent hostel activities logged yet.
              </div>
            ) : (
              systemLogs.map((log) => (
                <div key={log.id} className="flex items-start justify-between gap-4 rounded-lg border border-ivory bg-warm-white/45 p-3 hover:bg-warm-white transition">
                  <div className="flex gap-2.5">
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                        log.type === 'success'
                          ? 'bg-gold-accent'
                          : log.type === 'warning'
                          ? 'bg-blue-gray-medium'
                          : 'bg-charcoal'
                      }`}
                    />
                    <div>
                      <p className="font-sans text-xs font-semibold text-charcoal">{log.action}</p>
                      <span className="font-mono text-[9px] text-blue-gray-medium/70">{log.time}</span>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider font-bold border ${
                      log.type === 'success'
                        ? 'bg-warm-white text-gold-accent border-gold-light'
                        : log.type === 'warning'
                        ? 'bg-white text-blue-gray-medium border-ivory'
                        : 'bg-white text-charcoal border-ivory'
                    }`}
                  >
                    {log.type}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Operations panel */}
        <div id="quick-board" className="rounded-xl border border-ivory bg-white p-5 shadow-xs">
          <div className="pb-3 border-b border-ivory">
            <h3 className="font-serif text-base font-bold text-charcoal">Quick Operations</h3>
            <p className="font-sans text-xs text-blue-gray-medium">One-click navigation links</p>
          </div>
          <div className="mt-4 space-y-2.5">
            <button
              id="dash-quick-students"
              onClick={() => setView('students')}
              className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-ivory bg-white px-3.5 py-3 text-left text-xs font-bold text-blue-gray-medium transition-all hover:border-gold-accent hover:bg-warm-white hover:text-charcoal"
            >
              <div className="flex items-center gap-2.5">
                <Users className="h-4 w-4 text-gold-accent" />
                <span>{currentUser?.role === 'Staff' ? 'View Student Registry' : 'Allot New Student Bed'}</span>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-blue-gray-medium" />
            </button>
            <button
              id="dash-quick-rooms"
              onClick={() => setView('rooms')}
              className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-ivory bg-white px-3.5 py-3 text-left text-xs font-bold text-blue-gray-medium transition-all hover:border-gold-accent hover:bg-warm-white hover:text-charcoal"
            >
              <div className="flex items-center gap-2.5">
                <Home className="h-4 w-4 text-gold-accent" />
                <span>{currentUser?.role === 'Staff' ? 'View Room & Beds Status' : 'Manage Room Statuses'}</span>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-blue-gray-medium" />
            </button>
            <button
              id="dash-quick-maintenance"
              onClick={() => setView('maintenance')}
              className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-ivory bg-white px-3.5 py-3 text-left text-xs font-bold text-blue-gray-medium transition-all hover:border-gold-accent hover:bg-warm-white hover:text-charcoal"
            >
              <div className="flex items-center gap-2.5">
                <Wrench className="h-4 w-4 text-gold-accent" />
                <span>Examine Maintenance Tickets</span>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-blue-gray-medium" />
            </button>
            <button
              id="dash-quick-mess"
              onClick={() => setView('mess')}
              className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-ivory bg-white px-3.5 py-3 text-left text-xs font-bold text-blue-gray-medium transition-all hover:border-gold-accent hover:bg-warm-white hover:text-charcoal"
            >
              <div className="flex items-center gap-2.5">
                <ClipboardList className="h-4 w-4 text-gold-accent" />
                <span>Verify Food Pantry Stock</span>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-blue-gray-medium" />
            </button>
          </div>
        </div>
      </div>
      <AIChatbot />
    </div>
  );
};
