export type VaiTro = 'admin' | 'owner' | 'nhanvien';

export interface NguoiDung {
  id: string;
  hoTen: string;
  taiKhoan: string;
  vaiTro: VaiTro;
  trangThai?: boolean;
}

export interface DangNhapResponse {
  token: string;
  nguoiDung: NguoiDung;
}
