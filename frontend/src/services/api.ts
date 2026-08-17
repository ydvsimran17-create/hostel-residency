import axios, { AxiosRequestConfig } from 'axios';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

// Key used to persist the logged-in user's JWT in localStorage.
// Only the token lives here — no passwords or account data are ever stored client-side.
const TOKEN_KEY = 'hostel_auth_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the current user's JWT (if any) to every outgoing request so
// protected backend routes (verifyToken / authorizeRoles) can authenticate us.
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    (config.headers as unknown as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Request failed';
    throw new ApiError(message, error.response?.status || 500);
  }
);

interface WrappedResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
}

function unwrapResponse<T>(payload: WrappedResponse<T> | T): T {
  if (
    payload &&
    typeof payload === 'object' &&
    'success' in payload &&
    'data' in payload
  ) {
    const wrapped = payload as WrappedResponse<T>;
    if (wrapped.success === false) {
      throw new ApiError(wrapped.message || wrapped.error || 'Request failed', 400);
    }
    return wrapped.data as T;
  }
  return payload as T;
}

export async function apiGet<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.get<WrappedResponse<T> | T>(path, config);
  return unwrapResponse(response.data);
}

export async function apiPost<T>(
  path: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.post<WrappedResponse<T> | T>(path, body, config);
  return unwrapResponse(response.data);
}

export async function apiPut<T>(
  path: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.put<WrappedResponse<T> | T>(path, body, config);
  return unwrapResponse(response.data);
}

export async function apiDelete<T>(
  path: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.delete<WrappedResponse<T> | T>(path, config);
  return unwrapResponse(response.data);
}