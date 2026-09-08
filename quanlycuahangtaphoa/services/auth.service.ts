import { api, setToken } from './api';
import { NguoiDung } from '../types/NguoiDung';

export const authService = {
  dangNhap: async (tenDangNhap: string, matKhau: string): Promise<NguoiDung> => {
    const data = await api.post<NguoiDung>('/auth/login', { tenDangNhap, matKhau });
    if (data.token) setToken(data.token);
    return data;
  },

  dangXuat: () => {
    setToken(null);
  },
};
