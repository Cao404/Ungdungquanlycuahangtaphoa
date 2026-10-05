import { apiGet, apiPost } from './api';
import { NguoiDung } from '../types/NguoiDung';

interface LoginResponse {
  token: string;
  nguoiDung: NguoiDung;
}

export const authService = {
  login: (taiKhoan: string, matKhau: string) =>
    apiPost<LoginResponse>('/auth/login', { taiKhoan, matKhau }),
  me: () => apiGet<NguoiDung>('/auth/me'),
  logout: () => apiPost<void>('/auth/logout', {}),
};
