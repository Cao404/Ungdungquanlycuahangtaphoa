import { apiGet } from './api';
import { SanPham } from '../types/SanPham';

export const sanPhamService = {
  // Tìm theo tên hoặc lọc theo danh mục
  search: (q: string, danhMuc?: string) => {
    const params = new URLSearchParams({ ...(q && { q }), ...(danhMuc && { danhMuc }) });
    return apiGet<SanPham[]>(`/sanpham?${params}`);
  },

  getById: (id: string) => apiGet<SanPham>(`/sanpham/${id}`),
};
