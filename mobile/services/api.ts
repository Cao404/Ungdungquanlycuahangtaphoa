import axios from 'axios';
import { API_BASE_URL } from '../constants/config';
import { useAuthStore } from '../store/authStore';

// Axios instance dùng chung cho toàn bộ project
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Tự động gắn Bearer token vào mọi request
axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Trích data.data từ response chuẩn { success, message, data }
export async function apiGet<T>(path: string): Promise<T> {
  const res = await axiosInstance.get<{ data: T }>(path);
  return res.data.data;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await axiosInstance.post<{ data: T }>(path, body);
  return res.data.data;
}

export default axiosInstance;
