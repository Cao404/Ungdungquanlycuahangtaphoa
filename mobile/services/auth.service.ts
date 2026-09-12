import { apiPost } from './api';
import { NguoiDung } from '../types/NguoiDung';

interface LoginResponse {
  token: string;
  nguoiDung: NguoiDung;
}

export const authService = {
  login: (taiKhoan: string, matKhau: string) =>
    apiPost<LoginResponse>('/auth/login', { taiKhoan, matKhau }),

  register: (hoTen: string, taiKhoan: string, matKhau: string) =>
    apiPost<NguoiDung>('/auth/register', { hoTen, taiKhoan, matKhau }),
};
