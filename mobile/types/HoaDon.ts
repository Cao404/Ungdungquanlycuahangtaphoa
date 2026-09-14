export type HinhThucTT = 'tienmat' | 'chuyenkhoan';
export type TrangThaiTT = 'daTT' | 'chuaTT';

export interface ChiTietHoaDon {
  bienTheId: string;
  soLuong: number;
  donGia: number;       // giá tại thời điểm bán (lưu cứng)
  thanhTien: number;
}

export interface TaoHoaDonPayload {
  khachHangId?: string;
  giamGia?: number;
  hinhThucTT: HinhThucTT;
  chiTiet: ChiTietHoaDon[];
}

export interface HoaDon {
  id: string;
  ngayBan: string;
  tongTien: number;
  giamGia: number;
  hinhThucTT: HinhThucTT;
  trangThaiTT: TrangThaiTT;
  nguoiBan: { hoTen: string };
  chiTiets: (ChiTietHoaDon & {
    bienThe: { tenBienThe: string; sanPham: { ten: string } };
  })[];
}
