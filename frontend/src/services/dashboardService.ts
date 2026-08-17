import { DashboardStats } from '../types';
import { apiGet } from './api';

export type { DashboardStats };

export async function fetchDashboardStats(): Promise<DashboardStats> {
  return apiGet<DashboardStats>('/dashboard/stats');
}
