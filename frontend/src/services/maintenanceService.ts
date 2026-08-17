import { MaintenanceRequest } from '../types';
import { apiDelete, apiGet, apiPost, apiPut } from './api';

export interface ApiMaintenance {
  _id: string;
  title?: string;
  roomNumber: string;
  issueType: string;
  category?: string;
  description: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  raisedBy?: string;
  assignedTo?: string | null;
  status?: string;
  createdAt?: string;
}

export function mapApiMaintenanceToRequest(item: ApiMaintenance): MaintenanceRequest {
  return {
    id: item._id,
    title: item.title || item.issueType,
    roomNumber: item.roomNumber,
    category: (item.category || item.issueType) as MaintenanceRequest['category'],
    description: item.description,
    priority: item.priority || 'Medium',
    status: (item.status as MaintenanceRequest['status']) || 'Pending',
    raisedBy: item.raisedBy || 'Staff Reporter',
    date: (item.createdAt || new Date().toISOString()).split('T')[0],
    assignedTo: item.assignedTo ?? null,
  };
}

export function mapMaintenanceToPayload(
  req: Omit<MaintenanceRequest, 'id' | 'date' | 'status' | 'assignedTo'> & {
    status?: MaintenanceRequest['status'];
    assignedTo?: string | null;
  }
) {
  return {
    title: req.title,
    roomNumber: req.roomNumber,
    issueType: req.category,
    category: req.category,
    description: req.description,
    priority: req.priority,
    raisedBy: req.raisedBy,
    status: req.status,
    assignedTo: req.assignedTo,
  };
}

export async function fetchMaintenanceRequests(): Promise<MaintenanceRequest[]> {
  const data = await apiGet<ApiMaintenance[]>('/maintenance');
  return data.map(mapApiMaintenanceToRequest);
}

export async function createMaintenanceRequest(
  req: Omit<MaintenanceRequest, 'id' | 'date' | 'status' | 'assignedTo'>
): Promise<MaintenanceRequest> {
  const created = await apiPost<ApiMaintenance>(
    '/maintenance',
    mapMaintenanceToPayload({ ...req, status: 'Pending', assignedTo: null })
  );
  return mapApiMaintenanceToRequest(created);
}

export async function updateMaintenanceRequestApi(
  id: string,
  updates: Partial<MaintenanceRequest>
): Promise<MaintenanceRequest> {
  const updated = await apiPut<ApiMaintenance>(`/maintenance/${id}`, updates);
  return mapApiMaintenanceToRequest(updated);
}

export async function deleteMaintenanceRequestApi(id: string): Promise<void> {
  await apiDelete(`/maintenance/${id}`);
}
