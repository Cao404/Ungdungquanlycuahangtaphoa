export type HinhThucTT = 'tienmat' | 'chuyenkhoan' | 'congno';
export type TrangThaiTT = 'daTT' | 'chuaTT';

// Body tạo hoá đơn
export interface TaoHoaDonBody {
  requestId: string;
  khachHangId?: string;
  giamGia?: number;
  lyDoGiamGia?: string;
  tienKhachDua?: number;
  hinhThucTT?: HinhThucTT;
  trangThaiTT?: TrangThaiTT;
  chiTiet: {
    bienTheId: string;
    soLuong: number;
    donGia?: number;
  }[];
}

// Body tạo phiếu nhập
export interface TaoPhieuNhapBody {
  nhaCungCapId: string;
  ghiChu?: string;
  hinhThucTT?: HinhThucTT;
  soTienDaThanhToan?: number;
  chiTiet: {
    bienTheId: string;
    soLuong: number;
    giaNhap: number;
    maLo?: string;
    ngaySanXuat?: string;
    hanSuDung?: string;
  }[];
}
