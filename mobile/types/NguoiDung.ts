export type VaiTro = 'admin' | 'nhanvien';

export interface NguoiDung {
  id: string;
  hoTen: string;
  taiKhoan: string;
  vaiTro: VaiTro;
  trangThai: boolean;
}
