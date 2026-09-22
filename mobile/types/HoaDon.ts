export type HinhThucTT = 'tienmat' | 'chuyenkhoan';
export type TrangThaiTT = 'daTT' | 'chuaTT';

export interface ChiTietHoaDon {
  id?: number;
  bienTheId: number;
  soLuong: number;
  donGia: number;
  thanhTien: number;
  bienThe?: {
    tenBienThe: string;
    sanPham: { ten: string };
  };
}

export interface TaoHoaDonPayload {
  khachHangId?: number;
  giamGia?: number;
  hinhThucTT: HinhThucTT;
  chiTiet: ChiTietHoaDon[];
}

export interface HoaDon {
  id: number;
  nguoiBanId: number;
  khachHangId?: number;
  ngayBan: string;
  tongTien: number;
  giamGia: number;
  hinhThucTT: HinhThucTT;
  trangThaiTT: TrangThaiTT;
  nguoiBan?: { hoTen: string };
  chiTiet: ChiTietHoaDon[];
}
