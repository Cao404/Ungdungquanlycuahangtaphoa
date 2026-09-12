import { HinhThucTT, TrangThaiTT } from '@prisma/client';

// Body tạo hoá đơn
export interface TaoHoaDonBody {
  khachHangId?: string;
  giamGia?: number;
  hinhThucTT?: HinhThucTT;
  trangThaiTT?: TrangThaiTT;
  chiTiet: {
    bienTheId: string;
    soLuong: number;
    donGia: number;
  }[];
}

// Body tạo phiếu nhập
export interface TaoPhieuNhapBody {
  nhaCungCapId: string;
  ghiChu?: string;
  chiTiet: {
    bienTheId: string;
    soLuong: number;
    giaNhap: number;
  }[];
}
