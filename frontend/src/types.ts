/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RoomAllocatedItem {
  inventoryItemId: string;
  inventoryItemName: string;
  quantity: number;
  assignedDate: string;
}

export interface Room {
  id: string;
  roomNumber: string;
  block: string;
  type: 'Single' | 'Double' | 'Triple' | 'Quad';
  capacity: number;
  occupied: number; // tracks active beds allotted
  status: 'Available' | 'Full' | 'Maintenance';
  allocatedItems?: RoomAllocatedItem[];
}

export interface Student {
  id: string;
  name: string;
  studentId: string;
  email: string;
  contact: string;
  gender: 'Male' | 'Female' | 'Other';
  roomNumber: string | null; // Null means unallotted
  block: string | null;
  joinDate: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Furniture' | 'Electronics' | 'Bedding' | 'Utility' | 'Safety';
  quantity: number;
  goodCount: number;
  damagedCount: number;
  repairCount: number;
  location: string;
  minRequired: number; // threshold for low stock alert
}

export interface StockRecord {
  id: string;
  inventoryItemId: string;
  inventoryItemName: string;
  type: 'Incoming' | 'Outgoing' | 'Adjustment';
  quantity: number;
  date: string;
  supplierName?: string;
  supplierContact?: string;
  supplierEmail?: string;
  purchaseCost?: number; // total cost for the shipment
  invoiceFileName?: string;
  notes?: string;
}

export interface MaintenanceRequest {
  id: string;
  title: string;
  roomNumber: string;
  category: 'Electrical' | 'Plumbing' | 'Furniture' | 'Appliance' | 'Other';
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Pending' | 'In Progress' | 'Completed';
  raisedBy: string;
  date: string;
  assignedTo: string | null;
}

export interface MessSupply {
  id: string;
  name: string;
  category: 'Grains & Pulses' | 'Dairy' | 'Vegetables' | 'Spices & Pantry';
  quantity: number;
  unit: string;
  minRequired: number;
  weeklyConsumption: number[]; // 5 weeks consumption in units
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  lastStockDate: string;
}

export type PageView =
  | 'dashboard'
  | 'rooms'
  | 'students'
  | 'inventory'
  | 'maintenance'
  | 'mess'
  | 'settings'
  | 'student-portal';

export interface UserSession {
  name: string;
  email: string;
  role: 'Head' | 'Staff' | 'Student';
  studentRollNumber?: string;
  phone?: string;
  profilePic?: string;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export interface HostelRequest {
  id: string;
  roomId: string;
  requestType: string;
  description: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  isRead: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalRooms: number;
  totalRequests: number;
  totalStudents: number;
  totalInventoryItems: number;
  totalMaintenance: number;
  approvedRequests: number;
  rejectedRequests: number;
  pendingRequests: number;
  pendingMaintenance: number;
  inProgressMaintenance: number;
  completedMaintenance: number;
}

