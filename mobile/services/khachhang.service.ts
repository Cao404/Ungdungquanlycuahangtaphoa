import { apiGet } from './api';
import { KhachHang } from '../types/HoaDon';
export const khachHangService = {
  search: async (q = '') => (await apiGet<KhachHang[]>(`/khachhang?q=${encodeURIComponent(q)}`)).map((item) => ({ ...item, id: String(item.id) })),
};
