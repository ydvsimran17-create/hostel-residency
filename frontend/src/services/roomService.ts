import { Room, RoomAllocatedItem, Student } from '../types';
import { apiDelete, apiGet, apiPost, apiPut } from './api';

export interface ApiRoom {
  _id: string;
  roomNumber: string;
  block: string;
  floor?: number;
  capacity: number;
  occupiedBeds?: number;
  inventoryItems?: string[];
  status?: 'Available' | 'Full' | 'Maintenance';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRoomPayload {
  roomNumber: string;
  block: string;
  floor?: number;
  capacity: number;
  occupiedBeds?: number;
  inventoryItems?: string[];
  status?: 'Available' | 'Full' | 'Maintenance';
}

export interface UpdateRoomPayload extends Partial<CreateRoomPayload> {}

function capacityToType(capacity: number): Room['type'] {
  switch (capacity) {
    case 1:
      return 'Single';
    case 3:
      return 'Triple';
    case 4:
      return 'Quad';
    default:
      return 'Double';
  }
}

function inventoryItemsToAllocatedItems(items: string[] = []): RoomAllocatedItem[] {
  return items.map((name, index) => ({
    inventoryItemId: `${name}__${index}`,
    inventoryItemName: name,
    quantity: 1,
    assignedDate: '',
  }));
}

function allocatedItemsToInventoryItems(items: RoomAllocatedItem[] = []): string[] {
  return items.flatMap((item) =>
    Array.from({ length: item.quantity }, () => item.inventoryItemName)
  );
}

export function mapApiRoomToRoom(apiRoom: ApiRoom, students: Student[] = []): Room {
  const occupiedFromStudents = students.filter(
    (student) => student.roomNumber === apiRoom.roomNumber
  ).length;
  const occupied = occupiedFromStudents || apiRoom.occupiedBeds || 0;

  let status: Room['status'] = apiRoom.status ?? 'Available';
  if (status !== 'Maintenance') {
    status = occupied >= apiRoom.capacity ? 'Full' : 'Available';
  }

  return {
    id: apiRoom._id,
    roomNumber: apiRoom.roomNumber,
    block: apiRoom.block,
    type: capacityToType(apiRoom.capacity),
    capacity: apiRoom.capacity,
    occupied,
    status,
    allocatedItems: inventoryItemsToAllocatedItems(apiRoom.inventoryItems),
  };
}

export function mapRoomToCreatePayload(
  room: Omit<Room, 'id' | 'occupied' | 'status'> & { status?: Room['status'] }
): CreateRoomPayload {
  return {
    roomNumber: room.roomNumber,
    block: room.block,
    floor: 1,
    capacity: room.capacity,
    occupiedBeds: 0,
    inventoryItems: allocatedItemsToInventoryItems(room.allocatedItems),
    status: room.status ?? 'Available',
  };
}

export function mapRoomToUpdatePayload(room: Room): UpdateRoomPayload {
  return {
    roomNumber: room.roomNumber,
    block: room.block,
    floor: 1,
    capacity: room.capacity,
    occupiedBeds: room.occupied,
    inventoryItems: allocatedItemsToInventoryItems(room.allocatedItems),
    status: room.status,
  };
}

export async function fetchRooms(): Promise<ApiRoom[]> {
  return apiGet<ApiRoom[]>('/rooms');
}

export async function createRoom(payload: CreateRoomPayload): Promise<ApiRoom> {
  return apiPost<ApiRoom>('/rooms', payload);
}

export async function updateRoomApi(id: string, payload: UpdateRoomPayload): Promise<ApiRoom> {
  return apiPut<ApiRoom>(`/rooms/${id}`, payload);
}

export async function deleteRoomApi(id: string): Promise<void> {
  await apiDelete(`/rooms/${id}`);
}
