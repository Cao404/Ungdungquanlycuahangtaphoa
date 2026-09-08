import { api } from './api';
import { HoaDon, ChiTietHoaDon } from '../types/HoaDon';

export const hoaDonService = {
  taoHoaDon: (chiTiet: ChiTietHoaDon[]) =>
    api.post<HoaDon>('/hoadon', { chiTiet }),

  layDanhSach: () => api.get<HoaDon[]>('/hoadon'),
  layTheoId: (id: string) => api.get<HoaDon>(`/hoadon/${id}`),
};
