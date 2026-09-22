import { apiGet } from './api';
import { SanPham } from '../types/SanPham';
import { ApiSanPham, mapSanPham } from './mappers';

export const sanPhamService = {
  getAll: async (search = '', danhMuc = ''): Promise<SanPham[]> =>
    (await apiGet<ApiSanPham[]>('/sanpham', { params: { search, danhMuc, limit: 100 } })).map(mapSanPham),
  getDanhMuc: () => apiGet<string[]>('/sanpham/danhmuc'),
  getKiemKeNguon: async (): Promise<SanPham[]> =>
    (await apiGet<ApiSanPham[]>('/sanpham/kiemke-nguon')).map(mapSanPham),
  getById: async (id: number): Promise<SanPham> =>
    mapSanPham(await apiGet<ApiSanPham>(`/sanpham/${id}`)),
};
