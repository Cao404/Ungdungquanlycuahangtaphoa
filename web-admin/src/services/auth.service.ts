import { apiPost } from './api';
import { DangNhapResponse } from '../types/NguoiDung';

export const authService = {
  login: (taiKhoan: string, matKhau: string) =>
    apiPost<DangNhapResponse>('/auth/login', { taiKhoan, matKhau }),
};
