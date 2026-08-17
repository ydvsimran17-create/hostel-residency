import { HostelRequest } from '../types';
import { apiDelete, apiGet, apiPost, apiPut } from './api';

export interface ApiRequest {
  _id: string;
  roomId: string;
  requestType: string;
  description: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt?: string;
}

export function mapApiRequestToHostelRequest(item: ApiRequest): HostelRequest {
  return {
    id: item._id,
    roomId: item.roomId,
    requestType: item.requestType,
    description: item.description,
    status: item.status,
    createdAt: (item.createdAt || new Date().toISOString()).split('T')[0],
  };
}

export async function fetchRequests(): Promise<HostelRequest[]> {
  const data = await apiGet<ApiRequest[]>('/requests');
  return data.map(mapApiRequestToHostelRequest);
}

export async function createRequest(
  payload: Omit<HostelRequest, 'id' | 'status' | 'createdAt'>
): Promise<HostelRequest> {
  const created = await apiPost<ApiRequest>('/requests', payload);
  return mapApiRequestToHostelRequest(created);
}

export async function updateRequestApi(
  id: string,
  payload: Partial<HostelRequest>
): Promise<HostelRequest> {
  const updated = await apiPut<ApiRequest>(`/requests/${id}`, payload);
  return mapApiRequestToHostelRequest(updated);
}

export async function approveRequestApi(id: string): Promise<HostelRequest> {
  const updated = await apiPut<ApiRequest>(`/requests/${id}/approve`);
  return mapApiRequestToHostelRequest(updated);
}

export async function rejectRequestApi(id: string): Promise<HostelRequest> {
  const updated = await apiPut<ApiRequest>(`/requests/${id}/reject`);
  return mapApiRequestToHostelRequest(updated);
}

export async function deleteRequestApi(id: string): Promise<void> {
  await apiDelete(`/requests/${id}`);
}
