import axios, { AxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../constants/config';
import { tokenConHan, useAuthStore } from '../store/authStore';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token && !tokenConHan(token)) {
    useAuthStore.getState().logout();
    return Promise.reject(new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'));
  }
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use((response) => response, (error) => {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    useAuthStore.getState().logout();
  }
  return Promise.reject(error);
});

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export async function apiGet<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await axiosInstance.get<ApiResponse<T>>(path, config);
  return res.data.data;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await axiosInstance.post<ApiResponse<T>>(path, body);
  return res.data.data;
}

export function getApiErrorMessage(error: unknown, fallback = 'Có lỗi xảy ra'): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    if (!API_BASE_URL) {
      return 'Chưa cấu hình địa chỉ API trong mobile/.env. Hãy đặt EXPO_PUBLIC_API_BASE_URL rồi khởi động lại Expo.';
    }
    if (!error.response) {
      return 'Không kết nối được máy chủ. Hãy kiểm tra backend đang chạy, điện thoại cùng Wi-Fi với máy tính và địa chỉ API trong mobile/.env.';
    }
    return error.response?.data?.message ?? error.message ?? fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

export default axiosInstance;
