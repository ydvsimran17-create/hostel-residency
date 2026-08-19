/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import {
  Room,
  Student,
  InventoryItem,
  StockRecord,
  MaintenanceRequest,
  MessSupply,
  UserSession,
  Toast,
  HostelRequest,
  AppNotification,
  DashboardStats,
} from './types';
import { INITIAL_MESS } from './mockData';
import {
  createRoom as createRoomApi,
  deleteRoomApi,
  fetchRooms,
  mapApiRoomToRoom,
  mapRoomToCreatePayload,
  mapRoomToUpdatePayload,
  updateRoomApi,
} from './services/roomService';
import {
  createStudent as createStudentApi,
  deleteStudentApi,
  fetchStudents,
  updateStudentApi,
} from './services/studentService';
import {
  createInventoryItem as createInventoryItemApi,
  createStockRecord as createStockRecordApi,
  deleteInventoryItemApi,
  deleteStockRecordApi,
  fetchInventory,
  fetchStockRecords,
  updateInventoryItemApi,
} from './services/inventoryService';
import {
  createMaintenanceRequest as createMaintenanceRequestApi,
  deleteMaintenanceRequestApi,
  fetchMaintenanceRequests,
  updateMaintenanceRequestApi,
} from './services/maintenanceService';
import {
  approveRequestApi,
  createRequest as createRequestApi,
  deleteRequestApi,
  fetchRequests,
  rejectRequestApi,
  updateRequestApi,
} from './services/requestService';
import {
  deleteNotificationApi,
  fetchNotifications,
  markNotificationRead,
} from './services/notificationService';
import { fetchDashboardStats } from './services/dashboardService';
import { ApiError, clearToken, getToken, setToken } from './services/api';
import { fetchProfile, login as loginApi, mapRole } from './services/authService';

interface AppContextType {
  rooms: Room[];
  students: Student[];
  inventory: InventoryItem[];
  stockRecords: StockRecord[];
  maintenance: MaintenanceRequest[];
  messSupplies: MessSupply[];
  hostelName: string;
  setHostelName: (name: string) => void;
  contactEmail: string;
  setContactEmail: (email: string) => void;
  contactPhone: string;
  setContactPhone: (phone: string) => void;
  systemLogs: Array<{ id: string; action: string; time: string; type: 'info' | 'warning' | 'success' }>;
  currentUser: UserSession | null;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logoutUser: () => void;
  updateUserProfile: (name: string, phone?: string, password?: string, profilePic?: string) => void;
  
  // Theme Presets Selection
  selectedTheme: string;
  setSelectedTheme: (theme: string) => void;
  
  // Toast Notification System
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  
  // Actions
  addRoom: (room: Omit<Room, 'id' | 'occupied' | 'status'>) => void;
  updateRoom: (room: Room) => void;
  deleteRoom: (id: string) => void;
  allocateRoomItem: (roomId: string, inventoryItemId: string, quantity: number) => void;
  removeRoomItem: (roomId: string, inventoryItemId: string) => void;
  
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
  
  allotStudentRoom: (studentId: string, roomNumber: string) => boolean;
  unallotStudent: (studentId: string) => void;
  
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryItem: (item: InventoryItem) => void;
  deleteInventoryItem: (id: string) => void;
  adjustStock: (id: string, goodDiff: number, damagedDiff: number, repairDiff: number) => void;
  addStockRecord: (record: Omit<StockRecord, 'id'>) => void;
  deleteStockRecord: (id: string) => void;
  
  addMaintenanceRequest: (req: Omit<MaintenanceRequest, 'id' | 'date' | 'status' | 'assignedTo'>) => void;
  updateMaintenanceStatus: (id: string, status: 'Pending' | 'In Progress' | 'Completed') => void;
  assignMaintenanceWorker: (id: string, worker: string | null) => void;
  deleteMaintenanceRequest: (id: string) => void;
  
  addMessSupply: (supply: Omit<MessSupply, 'id' | 'status' | 'lastStockDate'>) => void;
  updateMessQuantity: (id: string, newQty: number) => void;
  deleteMessSupply: (id: string) => void;
  addLog: (action: string, type?: 'info' | 'warning' | 'success') => void;

  requests: HostelRequest[];
  notifications: AppNotification[];
  dashboardStats: DashboardStats | null;
  refreshAllData: () => Promise<void>;
  addRequest: (req: Omit<HostelRequest, 'id' | 'status' | 'createdAt'>) => void;
  updateRequest: (id: string, updates: Partial<HostelRequest>) => void;
  approveRequest: (id: string) => void;
  rejectRequest: (id: string) => void;
  deleteRequest: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Ensure we clear out any stale local storage demo seeds from previous revisions
  if (typeof window !== 'undefined') {
    const CLEAN_KEY = 'hostel_cleaned_v6';
    if (!localStorage.getItem(CLEAN_KEY)) {
      localStorage.removeItem('hostel_rooms');
      localStorage.removeItem('hostel_students');
      localStorage.removeItem('hostel_inventory');
      localStorage.removeItem('hostel_stock_records');
      localStorage.removeItem('hostel_maintenance');
      localStorage.removeItem('hostel_mess');
      localStorage.removeItem('hostel_name');
      localStorage.removeItem('hostel_email');
      localStorage.removeItem('hostel_phone');
      localStorage.removeItem('hostel_current_user');
      localStorage.removeItem('hostel_registered_heads');
      localStorage.removeItem('hostel_registered_staff');
      localStorage.setItem(CLEAN_KEY, 'true');
    }
  }

  const [toasts, setToasts] = useState<Toast[]>([]);

  const [rooms, setRooms] = useState<Room[]>([]);

  const [students, setStudents] = useState<Student[]>([]);

  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  const [stockRecords, setStockRecords] = useState<StockRecord[]>([]);

  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);

  const [requests, setRequests] = useState<HostelRequest[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  const [messSupplies, setMessSupplies] = useState<MessSupply[]>(() => {
    const saved = localStorage.getItem('hostel_mess');
    return saved ? JSON.parse(saved) : INITIAL_MESS;
  });

  const [hostelName, setHostelNameState] = useState(() => {
    const saved = localStorage.getItem('hostel_name');
    return saved || 'Hostel Residency';
  });

  const [contactEmail, setContactEmailState] = useState(() => {
    const saved = localStorage.getItem('hostel_email');
    return saved || 'admin@hostel.edu';
  });

  const [contactPhone, setContactPhoneState] = useState(() => {
    return localStorage.getItem('hostel_phone') || '';
  });

  const setHostelName = (name: string) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot change system properties.', 'error');
      return;
    }
    setHostelNameState(name);
  };

  const setContactEmail = (email: string) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot change system properties.', 'error');
      return;
    }
    setContactEmailState(email);
  };

  const setContactPhone = (phone: string) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot change system properties.', 'error');
      return;
    }
    setContactPhoneState(phone);
  };

  // The session itself is never trusted from localStorage directly — only the
  // JWT is persisted. On load, if a token exists we re-fetch the profile from
  // the backend so a tampered/expired token can never fake a login.
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  const [selectedTheme, setSelectedThemeState] = useState<string>(() => {
    return localStorage.getItem('hostel_theme') || 'swiss';
  });

  const setSelectedTheme = (theme: string) => {
    setSelectedThemeState(theme);
    localStorage.setItem('hostel_theme', theme);
  };

  const [systemLogs, setSystemLogs] = useState<Array<{ id: string; action: string; time: string; type: 'info' | 'warning' | 'success' }>>([]);

  // Sync to localStorage (module data loaded from backend)
  useEffect(() => {
    localStorage.setItem('hostel_mess', JSON.stringify(messSupplies));
  }, [messSupplies]);

  useEffect(() => {
    localStorage.setItem('hostel_name', hostelName);
  }, [hostelName]);

  useEffect(() => {
    localStorage.setItem('hostel_email', contactEmail);
  }, [contactEmail]);

  useEffect(() => {
    localStorage.setItem('hostel_phone', contactPhone);
  }, [contactPhone]);

  // Restore session from the backend on load, using the saved JWT (if any).
  useEffect(() => {
    const restoreSession = async () => {
      const token = getToken();
      if (!token) {
        setAuthLoading(false);
        return;
      }
      try {
        const profile = await fetchProfile();
        setCurrentUser({
          name: profile.name,
          email: profile.email,
          role: mapRole(profile.role),
          studentRollNumber: profile.studentId,
          phone: profile.phone,
          profilePic: profile.profilePic,
        });
      } catch {
        // Token is invalid or expired — clear it and fall back to the login screen.
        clearToken();
        setCurrentUser(null);
      } finally {
        setAuthLoading(false);
      }
    };
    void restoreSession();
  }, []);

  // Recalculate room occupancy counts automatically based on students allotment
  useEffect(() => {
    const updatedRooms = rooms.map((room) => {
      const occupantsCount = students.filter((s) => s.roomNumber === room.roomNumber).length;
      let status: 'Available' | 'Full' | 'Maintenance' = room.status;

      if (room.status !== 'Maintenance') {
        status = occupantsCount >= room.capacity ? 'Full' : 'Available';
      }

      if (room.occupied !== occupantsCount || room.status !== status) {
        return { ...room, occupied: occupantsCount, status };
      }
      return room;
    });

    // Solve React infinite render loop by checking if values are actually different
    const isDifferent = JSON.stringify(rooms) !== JSON.stringify(updatedRooms);
    if (isDifferent) {
      setRooms(updatedRooms);
    }
  }, [students]); // re-run only when students allotments change

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshAllData = useCallback(async () => {
    try {
      const [
        apiRooms,
        studentData,
        inventoryData,
        stockData,
        maintenanceData,
        requestData,
        notificationData,
        statsData,
      ] = await Promise.all([
        fetchRooms(),
        fetchStudents(),
        fetchInventory(),
        fetchStockRecords(),
        fetchMaintenanceRequests(),
        fetchRequests(),
        fetchNotifications(),
        fetchDashboardStats(),
      ]);

      setStudents(studentData);
      setRooms(apiRooms.map((apiRoom) => mapApiRoomToRoom(apiRoom, studentData)));
      setInventory(inventoryData);
      setStockRecords(stockData);
      setMaintenance(maintenanceData);
      setRequests(requestData);
      setNotifications(notificationData);
      setDashboardStats(statsData);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Failed to sync data from server.';
      showToast(message, 'error');
    }
  }, []);

// Refetch all data whenever someone logs in (currentUser changes from
// null to a session) — not just once when the app first mounts, since at
// mount time nobody is logged in yet and every request would fail (401).
useEffect(() => {
  if (currentUser) {
    void refreshAllData();
  }
}, [currentUser, refreshAllData]);

  const addLog = (action: string, type: 'info' | 'warning' | 'success' = 'info') => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setSystemLogs((prev) => [
      { id: `${Date.now()}`, action, time: `Today, ${timeStr}`, type },
      ...prev.slice(0, 19), // Cap logs at 20 items
    ]);
  };

  // Real login: verifies credentials against the backend (bcrypt + MongoDB),
  // stores the returned JWT, then loads the profile it identifies.
  const login = async (email: string, password: string) => {
    const { token } = await loginApi(email, password);
    setToken(token);

    try {
      const profile = await fetchProfile();
      const session: UserSession = {
        name: profile.name,
        email: profile.email,
        role: mapRole(profile.role),
        studentRollNumber: profile.studentId,
        phone: profile.phone,
        profilePic: profile.profilePic,
      };
      setCurrentUser(session);
      addLog(`${session.name} has successfully logged in as ${session.role === 'Head' ? 'Head of Hostel' : session.role === 'Staff' ? 'Staff Member' : 'Student'}.`, 'success');
      showToast(`Welcome, ${session.name}! Signed in as ${session.role === 'Head' ? 'Hostel Head' : session.role === 'Staff' ? 'Staff Member' : 'Student'}.`, 'success');
    } catch (error) {
      // Token was issued but profile fetch failed — don't leave a half-logged-in state.
      clearToken();
      throw error;
    }
  };

  const logoutUser = () => {
    if (currentUser) {
      addLog(`${currentUser.name} has logged out of the workspace.`, 'info');
      showToast('You have successfully logged out.', 'info');
    }
    clearToken();
    setCurrentUser(null);
  };

  const updateUserProfile = (name: string, phone?: string, password?: string, profilePic?: string) => {
    if (!currentUser) return;
    // Note: this currently only updates the local session view. Persisting
    // name/phone/photo changes to the backend needs a "update my own profile"
    // endpoint (today /api/users/:id is admin-only). Password changes should
    // go through "Forgot passcode?", which is already backend-verified.
    const updatedUser = { ...currentUser, name, phone: phone || currentUser.phone, profilePic: profilePic || currentUser.profilePic };
    setCurrentUser(updatedUser);

    if (password) {
      showToast('Password changes aren\'t saved here yet — use "Forgot passcode?" on the login screen to change your password securely.', 'info');
    }

    addLog(`User profile updated for ${name}`, 'success');
    showToast('Your profile has been saved successfully!', 'success');
  };

  // ROOM ACTIONS
  const addRoom = (roomData: Omit<Room, 'id' | 'occupied' | 'status'>) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot add rooms.', 'error');
      return;
    }

    void (async () => {
      try {
        const created = await createRoomApi(mapRoomToCreatePayload(roomData));
        const newRoom = mapApiRoomToRoom(created, students);
        setRooms((prev) => [...prev, newRoom]);
        addLog(`Room "${newRoom.roomNumber}" was created in database.`, 'success');
        showToast(`Room ${newRoom.roomNumber} created successfully!`, 'success');
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : 'Failed to create room.';
        showToast(message, 'error');
      }
    })();
  };

  const updateRoom = (updatedRoom: Room) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot modify hostel details.', 'error');
      return;
    }

    void (async () => {
      try {
        const saved = await updateRoomApi(updatedRoom.id, mapRoomToUpdatePayload(updatedRoom));
        const mappedRoom = mapApiRoomToRoom(saved, students);
        setRooms((prev) => prev.map((r) => (r.id === updatedRoom.id ? mappedRoom : r)));
        addLog(`Room info for "${mappedRoom.roomNumber}" was updated.`, 'info');
        showToast(`Room config for ${mappedRoom.roomNumber} updated successfully!`, 'success');
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : 'Failed to update room.';
        showToast(message, 'error');
      }
    })();
  };

  const deleteRoom = (id: string) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot delete rooms.', 'error');
      return;
    }
    const target = rooms.find((r) => r.id === id);
    if (!target) return;

    void (async () => {
      try {
        await deleteRoomApi(id);
        setStudents((prev) =>
          prev.map((s) =>
            s.roomNumber === target.roomNumber ? { ...s, roomNumber: null, block: null } : s
          )
        );
        setRooms((prev) => prev.filter((r) => r.id !== id));
        addLog(`Room "${target.roomNumber}" was deleted from the register.`, 'warning');
        showToast(`Room ${target.roomNumber} has been removed.`, 'info');
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : 'Failed to delete room.';
        showToast(message, 'error');
      }
    })();
  };

  const persistRoomUpdate = async (updatedRoom: Room) => {
    const saved = await updateRoomApi(updatedRoom.id, mapRoomToUpdatePayload(updatedRoom));
    const mappedRoom = mapApiRoomToRoom(saved, students);
    setRooms((prev) => prev.map((r) => (r.id === updatedRoom.id ? mappedRoom : r)));
    return mappedRoom;
  };

  const allocateRoomItem = (roomId: string, inventoryItemId: string, quantity: number) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot modify room asset allocations.', 'error');
      return;
    }
    const targetRoom = rooms.find((r) => r.id === roomId);
    const targetItem = inventory.find((i) => i.id === inventoryItemId);
    if (!targetRoom || !targetItem) return;

    const allocated = targetRoom.allocatedItems || [];
    const existingIndex = allocated.findIndex((item) => item.inventoryItemId === inventoryItemId);

    let updatedAllocated = [...allocated];
    if (existingIndex > -1) {
      updatedAllocated[existingIndex] = {
        ...updatedAllocated[existingIndex],
        quantity: updatedAllocated[existingIndex].quantity + quantity
      };
    } else {
      updatedAllocated.push({
        inventoryItemId,
        inventoryItemName: targetItem.name,
        quantity,
        assignedDate: new Date().toISOString().split('T')[0]
      });
    }

    const updatedRoom: Room = {
      ...targetRoom,
      allocatedItems: updatedAllocated
    };

    void (async () => {
      try {
        const mappedRoom = await persistRoomUpdate(updatedRoom);
        addLog(`Allocated ${quantity}x "${targetItem.name}" to Room ${mappedRoom.roomNumber}.`, 'success');
        showToast(`Allocated ${quantity}x ${targetItem.name} to Room ${mappedRoom.roomNumber}`, 'success');
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : 'Failed to allocate room item.';
        showToast(message, 'error');
      }
    })();
  };

  const removeRoomItem = (roomId: string, inventoryItemId: string) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot remove room assets.', 'error');
      return;
    }
    const targetRoom = rooms.find((r) => r.id === roomId);
    if (!targetRoom) return;

    const allocated = targetRoom.allocatedItems || [];
    const itemToRemove = allocated.find((item) => item.inventoryItemId === inventoryItemId);
    if (!itemToRemove) return;

    const updatedAllocated = allocated.filter((item) => item.inventoryItemId !== inventoryItemId);

    const updatedRoom: Room = {
      ...targetRoom,
      allocatedItems: updatedAllocated
    };

    void (async () => {
      try {
        const mappedRoom = await persistRoomUpdate(updatedRoom);
        addLog(`Removed "${itemToRemove.inventoryItemName}" from Room ${mappedRoom.roomNumber}.`, 'warning');
        showToast(`Removed asset from Room ${mappedRoom.roomNumber}`, 'info');
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : 'Failed to remove room item.';
        showToast(message, 'error');
      }
    })();
  };

  // STUDENT ACTIONS
  const addStudent = (studentData: Omit<Student, 'id'>) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot register students.', 'error');
      return;
    }

    void (async () => {
      try {
        const newStudent = await createStudentApi(studentData);
        setStudents((prev) => [...prev, newStudent]);
        addLog(`Student record created for ${newStudent.name}.`, 'success');
        showToast(`Student record for ${newStudent.name} created successfully!`, 'success');
        if (newStudent.roomNumber) {
          addLog(`Allotted Room ${newStudent.roomNumber} to ${newStudent.name}.`, 'success');
          showToast(`Allotted Room ${newStudent.roomNumber} to ${newStudent.name}.`, 'success');
        }
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : 'Failed to create student.';
        showToast(message, 'error');
      }
    })();
  };

  const updateStudent = (updatedStudent: Student) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot modify student records.', 'error');
      return;
    }

    void (async () => {
      try {
        const saved = await updateStudentApi(updatedStudent);
        setStudents((prev) => prev.map((s) => (s.id === saved.id ? saved : s)));
        addLog(`Student record for "${saved.name}" was modified.`, 'info');
        showToast(`Student record for ${saved.name} modified successfully!`, 'success');
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : 'Failed to update student.';
        showToast(message, 'error');
      }
    })();
  };

  const deleteStudent = (id: string) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot delete student records.', 'error');
      return;
    }
    const target = students.find((s) => s.id === id);
    if (!target) return;

    void (async () => {
      try {
        await deleteStudentApi(id);
        setStudents((prev) => prev.filter((s) => s.id !== id));
        addLog(`Student record for "${target.name}" removed from the database.`, 'warning');
        showToast(`Student record for ${target.name} removed.`, 'info');
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : 'Failed to delete student.';
        showToast(message, 'error');
      }
    })();
  };

  const allotStudentRoom = (studentId: string, roomNumber: string): boolean => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot manage room allotments.', 'error');
      return false;
    }
    const targetRoom = rooms.find((r) => r.roomNumber === roomNumber);
    if (!targetRoom) {
      showToast(`Error: Room ${roomNumber} not found.`, 'error');
      return false;
    }
    
    if (targetRoom.status === 'Maintenance') {
      addLog(`Cannot allot room ${roomNumber}: Room is under maintenance.`, 'warning');
      showToast(`Cannot allot room ${roomNumber}: Room is under maintenance.`, 'warning');
      return false;
    }
    
    const activeOccupants = students.filter((s) => s.roomNumber === roomNumber).length;
    if (activeOccupants >= targetRoom.capacity) {
      addLog(`Cannot allot room ${roomNumber}: Max capacity reached.`, 'warning');
      showToast(`Cannot allot room ${roomNumber}: Max capacity reached.`, 'warning');
      return false;
    }

    const targetStudent = students.find((s) => s.id === studentId);
    if (!targetStudent) return false;

    void (async () => {
      try {
        const saved = await updateStudentApi({
          ...targetStudent,
          roomNumber,
          block: targetRoom.block,
        });
        setStudents((prev) => prev.map((s) => (s.id === studentId ? saved : s)));
        addLog(`Successfully allotted Room ${roomNumber} to ${saved.name}.`, 'success');
        showToast(
          `Student Allotment Successfully Created for ${saved.name} in Room ${roomNumber}!`,
          'success'
        );
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : 'Failed to allot room.';
        showToast(message, 'error');
      }
    })();

    return true;
  };

  const unallotStudent = (studentId: string) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot manage room allotments.', 'error');
      return;
    }
    const targetStudent = students.find((s) => s.id === studentId);
    if (!targetStudent || !targetStudent.roomNumber) return;

    void (async () => {
      try {
        const saved = await updateStudentApi({
          ...targetStudent,
          roomNumber: null,
          block: null,
        });
        setStudents((prev) => prev.map((s) => (s.id === studentId ? saved : s)));
        addLog(`De-allocated Room ${targetStudent.roomNumber} from ${saved.name}.`, 'warning');
        showToast(`De-allocated Room ${targetStudent.roomNumber} from ${saved.name}.`, 'info');
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : 'Failed to unallot room.';
        showToast(message, 'error');
      }
    })();
  };

  // INVENTORY ACTIONS
  const addInventoryItem = (itemData: Omit<InventoryItem, 'id'>) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot manage inventory items.', 'error');
      return;
    }

    void (async () => {
      try {
        const newItem = await createInventoryItemApi(itemData);
        setInventory((prev) => [...prev, newItem]);
        addLog(`Added brand new inventory asset: "${newItem.name}".`, 'success');
        showToast(`Inventory asset "${newItem.name}" added successfully.`, 'success');
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : 'Failed to add inventory item.';
        showToast(message, 'error');
      }
    })();
  };

  const updateInventoryItem = (updatedItem: InventoryItem) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot modify inventory items.', 'error');
      return;
    }

    void (async () => {
      try {
        const saved = await updateInventoryItemApi(updatedItem);
        setInventory((prev) => prev.map((i) => (i.id === saved.id ? saved : i)));
        addLog(`Inventory record adjusted for "${saved.name}".`, 'info');
        showToast(`Inventory item "${saved.name}" updated successfully.`, 'success');
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : 'Failed to update inventory item.';
        showToast(message, 'error');
      }
    })();
  };

  const deleteInventoryItem = (id: string) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot delete inventory items.', 'error');
      return;
    }
    const target = inventory.find((i) => i.id === id);
    if (!target) return;

    void (async () => {
      try {
        await deleteInventoryItemApi(id);
        setInventory((prev) => prev.filter((i) => i.id !== id));
        addLog(`Removed assets group: "${target.name}" from logistics system.`, 'warning');
        showToast(`Removed logistics assets group: "${target.name}"`, 'info');
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : 'Failed to delete inventory item.';
        showToast(message, 'error');
      }
    })();
  };

  const addStockRecord = (recordData: Omit<StockRecord, 'id'>) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot log stock shipments.', 'error');
      return;
    }

    void (async () => {
      try {
        const newRecord = await createStockRecordApi(recordData);
        setStockRecords((prev) => [newRecord, ...prev]);

        if (recordData.type === 'Incoming') {
          const inventoryData = await fetchInventory();
          setInventory(inventoryData);
          addLog(
            `Received incoming stock of ${newRecord.quantity} unts for "${newRecord.inventoryItemName}". Cost: $${newRecord.purchaseCost || 0}.`,
            'success'
          );
          showToast(
            `Incoming shipment of ${newRecord.quantity}x ${newRecord.inventoryItemName} received!`,
            'success'
          );
        } else {
          addLog(
            `Recorded stock event for "${newRecord.inventoryItemName}" (${newRecord.type}).`,
            'info'
          );
          showToast(`Recorded stock event successfully.`, 'success');
        }
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : 'Failed to add stock record.';
        showToast(message, 'error');
      }
    })();
  };

  const deleteStockRecord = (id: string) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot delete stock logs.', 'error');
      return;
    }
    const target = stockRecords.find((r) => r.id === id);
    if (!target) return;

    void (async () => {
      try {
        await deleteStockRecordApi(id);
        setStockRecords((prev) => prev.filter((r) => r.id !== id));
        addLog(
          `Deleted stock log record from ${target.date} for "${target.inventoryItemName}".`,
          'warning'
        );
        showToast(`Stock record has been deleted.`, 'info');
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : 'Failed to delete stock record.';
        showToast(message, 'error');
      }
    })();
  };

  const adjustStock = (id: string, goodDiff: number, damagedDiff: number, repairDiff: number) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot adjust stock levels.', 'error');
      return;
    }

    const item = inventory.find((i) => i.id === id);
    if (!item) return;

    const updatedItem: InventoryItem = {
      ...item,
      goodCount: Math.max(0, item.goodCount + goodDiff),
      damagedCount: Math.max(0, item.damagedCount + damagedDiff),
      repairCount: Math.max(0, item.repairCount + repairDiff),
    };
    updatedItem.quantity = updatedItem.goodCount + updatedItem.damagedCount + updatedItem.repairCount;

    void (async () => {
      try {
        const saved = await updateInventoryItemApi(updatedItem);
        setInventory((prev) => prev.map((i) => (i.id === saved.id ? saved : i)));
        addLog(`Inventory stock levels adjusted for "${saved.name}".`, 'info');
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : 'Failed to adjust stock.';
        showToast(message, 'error');
      }
    })();
  };

  // MAINTENANCE ACTIONS
  const addMaintenanceRequest = (
    item: Omit<MaintenanceRequest, 'id' | 'date' | 'status' | 'assignedTo'>
  ) => {
    void (async () => {
      try {
        const newReq = await createMaintenanceRequestApi(item);
        setMaintenance((prev) => [newReq, ...prev]);
        addLog(
          `Raised a ${newReq.priority} priority maintenance ticket for ${newReq.roomNumber}: "${newReq.title}"`,
          'warning'
        );
        showToast(`Work Order Successfully Raised: "${newReq.title}"`, 'success');
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : 'Failed to create maintenance request.';
        showToast(message, 'error');
      }
    })();
  };

  const updateMaintenanceStatus = (
    id: string,
    status: 'Pending' | 'In Progress' | 'Completed'
  ) => {
    void (async () => {
      try {
        const saved = await updateMaintenanceRequestApi(id, { status });
        setMaintenance((prev) => prev.map((m) => (m.id === id ? saved : m)));
        addLog(
          `Maintenance issue "${saved.title}" status changed to ${status.toUpperCase()}.`,
          status === 'Completed' ? 'success' : 'info'
        );
        showToast(`Work Order Updated to ${status}!`, 'success');
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : 'Failed to update maintenance status.';
        showToast(message, 'error');
      }
    })();
  };

  const assignMaintenanceWorker = (id: string, worker: string | null) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot assign specialists.', 'error');
      return;
    }

    void (async () => {
      try {
        const saved = await updateMaintenanceRequestApi(id, {
          assignedTo: worker,
          status: worker ? 'In Progress' : 'Pending',
        });
        setMaintenance((prev) => prev.map((m) => (m.id === id ? saved : m)));
        addLog(`Assigned ${worker || 'nobody'} to maintenance task "${saved.title}".`, 'info');
        showToast(`Assigned worker to work order: "${saved.title}"`, 'success');
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : 'Failed to assign maintenance worker.';
        showToast(message, 'error');
      }
    })();
  };

  const deleteMaintenanceRequest = (id: string) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot delete maintenance requests.', 'error');
      return;
    }
    const target = maintenance.find((m) => m.id === id);
    if (!target) return;

    void (async () => {
      try {
        await deleteMaintenanceRequestApi(id);
        setMaintenance((prev) => prev.filter((m) => m.id !== id));
        addLog(`Deleted maintenance ticket #${id} (${target.title}).`, 'info');
        showToast(`Work order ticket for "${target.title}" deleted.`, 'info');
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : 'Failed to delete maintenance request.';
        showToast(message, 'error');
      }
    })();
  };

  // REQUEST ACTIONS
  const addRequest = (req: Omit<HostelRequest, 'id' | 'status' | 'createdAt'>) => {
    void (async () => {
      try {
        const created = await createRequestApi(req);
        setRequests((prev) => [created, ...prev]);
        addLog(`New request submitted: ${created.requestType}`, 'info');
        showToast('Request submitted successfully.', 'success');
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Failed to create request.';
        showToast(message, 'error');
      }
    })();
  };

  const updateRequest = (id: string, updates: Partial<HostelRequest>) => {
    void (async () => {
      try {
        const saved = await updateRequestApi(id, updates);
        setRequests((prev) => prev.map((r) => (r.id === id ? saved : r)));
        showToast('Request updated successfully.', 'success');
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Failed to update request.';
        showToast(message, 'error');
      }
    })();
  };

  const approveRequest = (id: string) => {
    void (async () => {
      try {
        const saved = await approveRequestApi(id);
        setRequests((prev) => prev.map((r) => (r.id === id ? saved : r)));
        showToast('Request approved.', 'success');
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Failed to approve request.';
        showToast(message, 'error');
      }
    })();
  };

  const rejectRequest = (id: string) => {
    void (async () => {
      try {
        const saved = await rejectRequestApi(id);
        setRequests((prev) => prev.map((r) => (r.id === id ? saved : r)));
        showToast('Request rejected.', 'info');
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Failed to reject request.';
        showToast(message, 'error');
      }
    })();
  };

  const deleteRequest = (id: string) => {
    void (async () => {
      try {
        await deleteRequestApi(id);
        setRequests((prev) => prev.filter((r) => r.id !== id));
        showToast('Request deleted.', 'info');
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Failed to delete request.';
        showToast(message, 'error');
      }
    })();
  };

  // NOTIFICATION ACTIONS
  const markNotificationAsRead = (id: string) => {
    void (async () => {
      try {
        const saved = await markNotificationRead(id);
        setNotifications((prev) => prev.map((n) => (n.id === id ? saved : n)));
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : 'Failed to mark notification as read.';
        showToast(message, 'error');
      }
    })();
  };

  const deleteNotification = (id: string) => {
    void (async () => {
      try {
        await deleteNotificationApi(id);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : 'Failed to delete notification.';
        showToast(message, 'error');
      }
    })();
  };

  const clearAllNotifications = () => {
    void (async () => {
      try {
        await Promise.all(notifications.map((n) => deleteNotificationApi(n.id)));
        setNotifications([]);
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : 'Failed to clear notifications.';
        showToast(message, 'error');
      }
    })();
  };

  // MESS ACTIONS
  const addMessSupply = (supplyData: Omit<MessSupply, 'id' | 'status' | 'lastStockDate'>) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot add mess supply items.', 'error');
      return;
    }
    let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
    if (supplyData.quantity === 0) status = 'Out of Stock';
    else if (supplyData.quantity <= supplyData.minRequired) status = 'Low Stock';

    const newSupply: MessSupply = {
      ...supplyData,
      id: `mess_${Date.now()}`,
      status,
      lastStockDate: new Date().toISOString().split('T')[0],
    };
    setMessSupplies((prev) => [...prev, newSupply]);
    addLog(`Stock added for Mess pantry item: "${newSupply.name}"`, 'success');
    showToast(`Added kitchen pantry item "${newSupply.name}".`, 'success');
  };

  const updateMessQuantity = (id: string, newQty: number) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot modify mess stock quantity.', 'error');
      return;
    }
    setMessSupplies((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
          if (newQty <= 0) status = 'Out of Stock';
          else if (newQty <= m.minRequired) status = 'Low Stock';

          return {
            ...m,
            quantity: Math.max(0, newQty),
            status,
            lastStockDate: new Date().toISOString().split('T')[0],
          };
        }
        return m;
      })
    );
    const item = messSupplies.find((m) => m.id === id);
    addLog(`Mess store inventory for "${item?.name}" set to ${newQty} unit(s).`, 'info');
    showToast(`Mess supply "${item?.name}" pantry stock updated to ${newQty}!`, 'success');
  };

  const deleteMessSupply = (id: string) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot delete mess supply items.', 'error');
      return;
    }
    const target = messSupplies.find((m) => m.id === id);
    if (!target) return;
    setMessSupplies((prev) => prev.filter((m) => m.id !== id));
    addLog(`Removed pantry item "${target.name}" from mess records.`, 'warning');
    showToast(`Removed pantry item "${target.name}".`, 'info');
  };

  return (
    <AppContext.Provider
      value={{
        rooms,
        students,
        inventory,
        maintenance,
        messSupplies,
        hostelName,
        setHostelName,
        contactEmail,
        setContactEmail,
        contactPhone,
        setContactPhone,
        systemLogs,
        currentUser,
        authLoading,
        login,
        logoutUser,
        updateUserProfile,
        selectedTheme,
        setSelectedTheme,
        toasts,
        showToast,
        removeToast,
        addRoom,
        updateRoom,
        deleteRoom,
        allocateRoomItem,
        removeRoomItem,
        addStudent,
        updateStudent,
        deleteStudent,
        allotStudentRoom,
        unallotStudent,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        adjustStock,
        stockRecords,
        addStockRecord,
        deleteStockRecord,
        addMaintenanceRequest,
        updateMaintenanceStatus,
        assignMaintenanceWorker,
        deleteMaintenanceRequest,
        addMessSupply,
        updateMessQuantity,
        deleteMessSupply,
        addLog,
        requests,
        notifications,
        dashboardStats,
        refreshAllData,
        addRequest,
        updateRequest,
        approveRequest,
        rejectRequest,
        deleteRequest,
        markNotificationAsRead,
        deleteNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
};
