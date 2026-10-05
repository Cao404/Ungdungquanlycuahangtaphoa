export type HinhThucTT = 'tienmat' | 'chuyenkhoan' | 'congno';
export type TrangThaiTT = 'daTT' | 'chuaTT';
export interface KhachHang { id: string; ten: string; sdt?: string | null; diaChi?: string | null; }
export interface ChiTietHoaDon { bienTheId: string; soLuong: number; donGia: number; thanhTien: number; }
export interface CheckoutQuote { tamTinh: number; giamGia: number; thue: number; tongTien: number; lines: { btId: number; soLuong: number; donGia: number; soLuongTon: number; ten: string }[]; }
export interface TaoHoaDonPayload { requestId: string; khachHangId?: string; giamGia?: number; lyDoGiamGia?: string; tienKhachDua?: number; hinhThucTT: HinhThucTT; chiTiet: Pick<ChiTietHoaDon, 'bienTheId' | 'soLuong'>[]; }
export interface HoaDon {
  id: string; requestId?: string | null; ngayBan: string; tamTinh: number; tongTien: number;
  giamGia: number; thue: number; tienKhachDua?: number | null; tienThua?: number | null;
  soTienDaThanhToan?: number;
  lyDoGiamGia?: string | null;
  hinhThucTT: HinhThucTT; trangThaiTT: TrangThaiTT; nguoiBan: { hoTen: string };
  khachHang?: KhachHang | null;
  chiTiets: (ChiTietHoaDon & { bienThe: { giaTri: number; donVi: string; sanPham: { ten: string } } })[];
}
