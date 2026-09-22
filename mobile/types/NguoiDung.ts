export type VaiTro = 'admin' | 'nhanvien';

export interface NguoiDung {
  id: number;
  hoTen: string;
  taiKhoan: string;
  vaiTro: VaiTro;
  trangThai: boolean;
}
