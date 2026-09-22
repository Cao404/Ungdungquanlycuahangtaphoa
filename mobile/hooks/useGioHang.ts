import { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useGioHangStore } from '../store/gioHangStore';
import { BienThe, SanPham } from '../types/SanPham';
import { HinhThucTT } from '../types/HoaDon';
import { hoaDonService } from '../services/hoadon.service';
import { getApiErrorMessage } from '../services/api';

// Wrapper hook để màn hình không import store trực tiếp
export function useGioHang() {
  const items = useGioHangStore((state) => state.items);
  const them = useGioHangStore((state) => state.them);
  const capNhat = useGioHangStore((state) => state.capNhat);
  const xoa = useGioHangStore((state) => state.xoa);
  const xoaHet = useGioHangStore((state) => state.xoaHet);
  const tongTien = useGioHangStore((state) => state.tongTien());
  const soMon = useGioHangStore((state) => state.soMon());
  const [dangThanhToan, setDangThanhToan] = useState(false);

  const themSanPham = (sanPham: SanPham, bienThe: BienThe, soLuong = 1) => {
    return them(sanPham, bienThe, soLuong);
  };

  const capNhatSoLuong = (bienTheId: number, soLuong: number) => {
    if (!capNhat(bienTheId, soLuong)) {
      Alert.alert('Không đủ hàng', 'Số lượng yêu cầu vượt quá tồn kho.');
    }
  };

  const thanhToan = async (hinhThucTT: HinhThucTT) => {
    if (items.length === 0) throw new Error('Giỏ hàng đang trống');
    setDangThanhToan(true);
    try {
      const hoaDon = await hoaDonService.create({
        hinhThucTT,
        chiTiet: items.map((item) => ({
          bienTheId: item.bienTheId,
          soLuong: item.soLuong,
          donGia: item.donGia,
          thanhTien: item.thanhTien,
        })),
      });
      xoaHet();
      return hoaDon;
    } finally {
      setDangThanhToan(false);
    }
  };

  return {
    items,
    themSanPham,
    thanhToan,
    capNhat: capNhatSoLuong,
    xoa,
    xoaHet,
    tongTien,
    soMon,
    dangThanhToan,
  };
}

export function useThanhToan() {
  const gioHang = useGioHang();
  const [showModal, setShowModal] = useState(false);
  const [hinhThuc, setHinhThuc] = useState<HinhThucTT>('tienmat');

  const xacNhanThanhToan = async () => {
    try {
      const hoaDon = await gioHang.thanhToan(hinhThuc);
      setShowModal(false);
      router.replace({ pathname: '/(tabs)/lichsu/[id]', params: { id: String(hoaDon.id) } });
      Alert.alert('Thanh toán thành công', `Đã tạo hóa đơn #${hoaDon.id}.`);
    } catch (error: unknown) {
      Alert.alert('Thanh toán thất bại', getApiErrorMessage(error));
    }
  };

  return {
    ...gioHang,
    showModal,
    moThanhToan: () => setShowModal(true),
    dongThanhToan: () => setShowModal(false),
    hinhThuc,
    setHinhThuc,
    xacNhanThanhToan,
  };
}
