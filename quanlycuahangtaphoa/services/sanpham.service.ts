import { api } from './api';
import { SanPham } from '../types/SanPham';

export const sanPhamService = {
  layDanhSach: () => api.get<SanPham[]>('/sanpham'),
  layTheoId: (id: string) => api.get<SanPham>(`/sanpham/${id}`),
  timKiem: (tuKhoa: string) => api.get<SanPham[]>(`/sanpham?q=${encodeURIComponent(tuKhoa)}`),
};
