export type HinhThucTT = 'tienmat' | 'chuyenkhoan' | 'congno';

export interface DoanhThuBaoCao {
  tuNgay: string;
  denNgay: string;
  soHoaDon: number;
  tongDoanhThu: number;
}

export interface SanPhamBanChay {
  bienTheId: string;
  tenSanPham: string;
  tenBienThe?: string;
  tongSoLuong: number;
  tongDoanhThu: number;
}
