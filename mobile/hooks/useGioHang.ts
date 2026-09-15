import { useState } from 'react';
import { useGioHangStore } from '../store/gioHangStore';
import { BienThe, SanPham } from '../types/SanPham';
import { HinhThucTT } from '../types/HoaDon';
import { hoaDonService } from '../services/hoadon.service';

// Wrapper hook để màn hình không import store trực tiếp
export function useGioHang() {
  const { items, them, capNhat, xoa, xoaHet, tongTien, soMon } = useGioHangStore();
  const [dangThanhToan, setDangThanhToan] = useState(false);

  const themSanPham = (sanPham: SanPham, bienThe: BienThe, soLuong = 1) => {
    if (soLuong <= 0 || soLuong > bienThe.soLuongTon) return false;
    them(sanPham, bienThe, soLuong);
    return true;
  };

  const thanhToan = async (hinhThucTT: HinhThucTT) => {
    setDangThanhToan(true);
    try {
      await hoaDonService.create({
        hinhThucTT,
        chiTiet: items.map((item) => ({
          bienTheId: item.bienTheId,
          soLuong: item.soLuong,
          donGia: item.donGia,
          thanhTien: item.thanhTien,
        })),
      });
      xoaHet();
      return true;
    } finally {
      setDangThanhToan(false);
    }
  };

  return {
    items,
    themSanPham,
    thanhToan,
    capNhat,
    xoa,
    xoaHet,
    tongTien: tongTien(),
    soMon: soMon(),
    dangThanhToan,
  };
}
