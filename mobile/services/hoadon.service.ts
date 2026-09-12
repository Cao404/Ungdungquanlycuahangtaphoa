import { apiGet, apiPost } from './api';
import { HoaDon, TaoHoaDonPayload } from '../types/HoaDon';

export const hoaDonService = {
  create: (payload: TaoHoaDonPayload) => apiPost<HoaDon>('/hoadon', payload),
  getAll: () => apiGet<HoaDon[]>('/hoadon'),
  getById: (id: string) => apiGet<HoaDon>(`/hoadon/${id}`),
};
