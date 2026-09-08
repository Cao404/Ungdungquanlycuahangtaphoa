export interface NguoiDung {
  id: string;
  tenDangNhap: string;
  hoTen: string;
  vaiTro: 'admin' | 'nhanvien';
  token?: string;
}
