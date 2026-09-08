import { SanPham, BienThe } from './SanPham';

export interface ChiTietHoaDon {
  sanPham: SanPham;
  bienThe?: BienThe;
  soLuong: number;
  donGia: number;
  thanhTien: number;
}

export interface HoaDon {
  id: string;
  ngayTao: string;       // ISO date string
  chiTiet: ChiTietHoaDon[];
  tongTien: number;
  ghiChu?: string;
}
