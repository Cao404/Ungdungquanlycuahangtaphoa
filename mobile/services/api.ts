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

// Expired/revoked sessions return the user to Login instead of leaving a stale
// token capable of opening private screens.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) void useAuthStore.getState().logout();
    return Promise.reject(error);
  },
);

// Trích data.data từ response chuẩn { success, message, data }
export async function apiGet<T>(path: string): Promise<T> {
  const res = await axiosInstance.get<{ data: T }>(path);
  return res.data.data;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await axiosInstance.post<{ data: T }>(path, body);
  return res.data.data;
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await axiosInstance.put<{ data: T }>(path, body);
  return res.data.data;
}

export function getApiErrorMessage(error: any, fallback = 'Đã có lỗi xảy ra. Vui lòng thử lại.') {
  if (!error?.response) return error?.code === 'ECONNABORTED'
    ? 'Máy chủ phản hồi quá lâu. Vui lòng thử lại.'
    : 'Không thể kết nối máy chủ. Kiểm tra kết nối và thử lại.';
  const status = error.response.status as number;
  const message = error.response.data?.message as string | undefined;
  if (status === 401) return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  if (status === 403) return 'Bạn không có quyền thực hiện thao tác này.';
  if (status === 404) return message ?? 'Không tìm thấy dữ liệu yêu cầu.';
  if (status === 409) return message ?? 'Dữ liệu vừa thay đổi. Vui lòng tải lại.';
  if (status === 422 || status === 400) return message ?? 'Dữ liệu không hợp lệ.';
  if (status >= 500) return 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.';
  return message ?? fallback;
}

export default axiosInstance;
