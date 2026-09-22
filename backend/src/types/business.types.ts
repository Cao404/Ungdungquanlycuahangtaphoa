export type HinhThucTT = 'tienmat' | 'chuyenkhoan' | 'congno';
export type TrangThaiTT = 'daTT' | 'chuaTT';

// Body tạo hoá đơn
export interface TaoHoaDonBody {
  khachHangId?: number | null;
  giamGia?: number;
  hinhThucTT?: HinhThucTT;
  chiTiet: {
    bienTheId: number;
    soLuong: number;
    donGia: number;
  }[];
}

// Body tạo phiếu nhập
export interface TaoPhieuNhapBody {
  nhaCungCapId: number;
  ghiChu?: string;
  chiTiet: {
    bienTheId: number;
    soLuong: number;
    giaNhap: number;
  }[];
}
