import { AppNotification } from '../types';
import { apiDelete, apiGet, apiPost, apiPut } from './api';

export interface ApiNotification {
  _id: string;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'success';
  isRead?: boolean;
  userId?: string;
  createdAt?: string;
}

export function mapApiNotification(item: ApiNotification): AppNotification {
  return {
    id: item._id,
    title: item.title,
    message: item.message,
    type: item.type || 'info',
    isRead: item.isRead ?? false,
    createdAt: item.createdAt || new Date().toISOString(),
  };
}

export async function fetchNotifications(): Promise<AppNotification[]> {
  const data = await apiGet<ApiNotification[]>('/notifications');
  return data.map(mapApiNotification);
}

export async function createNotification(
  payload: Omit<AppNotification, 'id' | 'isRead' | 'createdAt'>
): Promise<AppNotification> {
  const created = await apiPost<ApiNotification>('/notifications', payload);
  return mapApiNotification(created);
}

export async function markNotificationRead(id: string): Promise<AppNotification> {
  const updated = await apiPut<ApiNotification>(`/notifications/${id}/read`);
  return mapApiNotification(updated);
}

export async function deleteNotificationApi(id: string): Promise<void> {
  await apiDelete(`/notifications/${id}`);
}
