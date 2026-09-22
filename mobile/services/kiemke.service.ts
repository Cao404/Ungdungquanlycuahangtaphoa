import { apiGet, apiPost } from './api';
import { PhieuKiemKe, TaoPhieuKiemKePayload } from '../types/KiemKe';

type ApiPhieu = Omit<PhieuKiemKe, 'trangThai' | 'ngayKiemKe'> & {
  trangThai: 'choDuyet' | 'daDuyet' | 'tuChoi';
};

const mapPhieu = (item: ApiPhieu): PhieuKiemKe => ({
  ...item,
  ngayKiemKe: item.ngayTao,
  trangThai: { choDuyet: 'cho_duyet', daDuyet: 'da_duyet', tuChoi: 'tu_choi' }[item.trangThai] as PhieuKiemKe['trangThai'],
});

export const kiemKeService = {
  getAll: async () => (await apiGet<ApiPhieu[]>('/kiemke/cua-toi')).map(mapPhieu),
  create: async (payload: TaoPhieuKiemKePayload) => mapPhieu(await apiPost<ApiPhieu>('/kiemke', payload)),
};
