import { apiGet, apiPost } from './api';
import { HoaDon, TaoHoaDonPayload } from '../types/HoaDon';
import { ApiHoaDon, mapHoaDon } from './mappers';

export const hoaDonService = {
  create: async (payload: TaoHoaDonPayload): Promise<HoaDon> =>
    mapHoaDon(await apiPost<ApiHoaDon>('/hoadon', payload)),
  getAll: async (tu?: string, den?: string): Promise<HoaDon[]> =>
    (await apiGet<ApiHoaDon[]>('/hoadon', { params: { tu, den } })).map(mapHoaDon),
  getById: async (id: number): Promise<HoaDon> =>
    mapHoaDon(await apiGet<ApiHoaDon>(`/hoadon/${id}`)),
};
