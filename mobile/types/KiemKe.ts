import { BienThe } from './SanPham';

export interface KiemKeProductRow {
  sanPhamTen: string;
  bienThe: BienThe;
}

export type TrangThaiKiemKe = 'cho_duyet' | 'da_duyet' | 'tu_choi';

export interface ChiTietKiemKe {
  id: number;
  bienTheId: number;
  soLuongHeThong: number;
  soLuongThucTe: number;
  chenhLech: number;
  bienThe?: {
    giaTri: number | string;
    donVi: string;
    sanPham: { ten: string };
  };
}

export interface PhieuKiemKe {
  id: number;
  nguoiTaoId: number;
  ngayTao: string;
  ngayKiemKe: string;
  ngayDuyet?: string | null;
  ghiChu?: string | null;
  lyDoTuChoi?: string | null;
  trangThai: TrangThaiKiemKe;
  nguoiDuyet?: { id: number; hoTen: string } | null;
  chiTiet: ChiTietKiemKe[];
}

export interface TaoPhieuKiemKePayload {
  ghiChu?: string;
  chiTiet: { bienTheId: number; soLuongThucTe: number }[];
}
