import { apiGet, apiPost } from './api';

// Backend (MongoDB User model) uses lowercase roles.
export type BackendRole = 'admin' | 'staff' | 'student';

// Frontend/UI uses these role labels everywhere else in the app.
export type AppRole = 'Head' | 'Staff' | 'Student';

const ROLE_TO_APP: Record<BackendRole, AppRole> = {
  admin: 'Head',
  staff: 'Staff',
  student: 'Student',
};

export function mapRole(role: BackendRole): AppRole {
  return ROLE_TO_APP[role];
}

export interface LoginResponse {
  token: string;
  role: BackendRole;
}

export interface ProfileResponse {
  _id: string;
  name: string;
  email: string;
  role: BackendRole;
  phone?: string;
  profilePic?: string;
  studentId?: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  return apiPost<LoginResponse>('/auth/login', { email, password });
}

export async function fetchProfile(): Promise<ProfileResponse> {
  return apiGet<ProfileResponse>('/auth/profile');
}

export async function requestPasswordReset(email: string): Promise<{ resetToken: string }> {
  return apiPost<{ resetToken: string }>('/auth/forgot-password', { email });
}

export async function confirmPasswordReset(resetToken: string, password: string): Promise<void> {
  await apiPost(`/auth/reset-password/${resetToken}`, { password });
}