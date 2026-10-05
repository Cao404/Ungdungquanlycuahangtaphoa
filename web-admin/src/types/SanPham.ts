export interface BienThe {
  id?: string;
  sanPhamId?: string;
  tenBienThe?: string;
  giaTri?: number;
  donVi?: string;
  giaNhap: number;
  giaBan: number;
  donViTinh?: string;
  soLuongTon: number;
  nguongCanhBao: number;
  trangThai?: boolean;
  barcode?: string | null;
}

export interface SanPham {
  id: string;
  ten: string;
  thuongHieu?: string;
  danhMuc: string;
  moTa?: string;
  hinhAnh?: string;
  bienThes: BienThe[];
}

export interface NhaCungCap {
  id: string;
  ten: string;
  sdt?: string;
  diaChi?: string;
  tongDaNhap?: number;
  tongNo?: number;
  noQuaHan?: number;
  soPhieuNo?: number;
}

export interface KhachHang {
  id: string;
  ten: string;
  sdt?: string;
  diaChi?: string;
  tongNo?: number;
  noQuaHan?: number;
  soHoaDonNo?: number;
}

export interface PhieuNhapChiTiet {
  bienTheId: string;
  soLuong: number;
  giaNhap: number;
  maLo?: string;
  ngaySanXuat?: string;
  hanSuDung?: string;
}

export interface PhieuNhap {
  id: string;
  nhaCungCapId: string;
  ngayNhap: string;
  tongTien: number;
  ghiChu?: string;
  trangThai?: 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
  ngayXacNhan?: string | null;
  hinhThucTT?: 'tienmat' | 'chuyenkhoan' | 'congno';
  trangThaiTT?: 'daTT' | 'chuaTT';
  soTienDaThanhToan?: number;
  nhaCungCap?: NhaCungCap;
  nguoiTao?: { hoTen: string };
}

export interface GiaoDichKho {
  id: number;
  bienTheId: number;
  loaiGiaoDich: 'nhap_hang' | 'ban_hang' | 'kiem_ke' | 'tra_hang' | string;
  soLuongThayDoi: number;
  soLuongTruoc: number;
  soLuongSau: number;
  thamChieuLoai?: string | null;
  thamChieuId?: number | null;
  nguoiThucHienId: number;
  thoiGian: string;
  ghiChu?: string | null;
  nguoiThucHien?: {
    id: number;
    hoTen: string;
    taiKhoan: string;
  };
  bienThe?: BienThe;
}

export interface ChiTietKiemKe {
  id: number;
  phieuKiemKeId: number;
  bienTheId: number;
  soLuongHeThong: number;
  soLuongThucTe: number;
  nguyenNhanChenhLech?: string | null;
  chenhLech?: number;
  bienThe?: BienThe & {
    sanPham?: {
      id: number;
      ten: string;
    };
  };
}

export interface PhieuKiemKe {
  id: number;
  nguoiTaoId: number;
  ngayKiemKe: string;
  ghiChu?: string | null;
  trangThai: 'cho_duyet' | 'da_duyet' | 'tu_choi';
  nguoiDuyetId?: number | null;
  ngayDuyet?: string | null;
  lyDoTuChoi?: string | null;
  tongSoMatHang?: number;
  soMatHangLech?: number;
  tenNguoiTao?: string;
  nguoiTao?: {
    id: number;
    hoTen: string;
    taiKhoan: string;
  };
  nguoiDuyet?: { id: number; hoTen: string; taiKhoan: string } | null;
  chiTiets?: ChiTietKiemKe[];
}

export interface BienTheWithSanPham extends BienThe {
  sanPham?: {
    id: number;
    ten: string;
    danhMuc: string;
  };
}

export interface KiemKeNguon {
  id: number;
  tenSanPham: string;
  giaTri: number;
  donVi: string;
  danhMuc: string;
  soLuongTon: number;
}
