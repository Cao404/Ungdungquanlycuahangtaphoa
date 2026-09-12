import { useGioHangStore } from '../store/gioHangStore';
import { BienThe, SanPham } from '../types/SanPham';

// Wrapper hook để màn hình không import store trực tiếp
export function useGioHang() {
  const { items, them, capNhat, xoa, xoaHet, tongTien, soMon } = useGioHangStore();

  const themSanPham = (sanPham: SanPham, bienThe: BienThe, soLuong = 1) => {
    if (soLuong <= 0 || soLuong > bienThe.soLuongTon) return false;
    them(sanPham, bienThe, soLuong);
    return true;
  };

  return {
    items,
    themSanPham,
    capNhat,
    xoa,
    xoaHet,
    tongTien: tongTien(),
    soMon: soMon(),
  };
}
