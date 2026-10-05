import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api';
const ASSET_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

export function resolveAssetUrl(value?: string | null): string {
  if (!value) return '';
  if (value.startsWith('/')) return `${ASSET_BASE_URL}${value}`;
  try {
    const parsed = new URL(value);
    if (parsed.pathname.startsWith('/uploads/')) return `${ASSET_BASE_URL}${parsed.pathname}`;
  } catch {
    return value;
  }
  return value;
}

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function unwrap<T>(payload: { data: T } | T): T {
  return payload && typeof payload === 'object' && 'data' in payload ? payload.data : payload;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await axiosInstance.get(path);
  return unwrap<T>(res.data);
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await axiosInstance.post(path, body);
  return unwrap<T>(res.data);
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await axiosInstance.put(path, body);
  return unwrap<T>(res.data);
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await axiosInstance.delete(path);
  return unwrap<T>(res.data);
}

export default axiosInstance;
