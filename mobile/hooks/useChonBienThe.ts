import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { sanPhamService } from '../services/sanpham.service';
import { BienThe } from '../types/SanPham';
import { useFetch } from './useFetch';
import { useGioHang } from './useGioHang';

export function useChonBienThe(id?: string) {
  const sanPhamId = Number(id);
  const { data: sanPham, loading, error } = useFetch(
    () => sanPhamService.getById(sanPhamId),
    [sanPhamId]
  );
  const { themSanPham } = useGioHang();
  const [bienTheChon, setBienTheChon] = useState<BienThe | null>(null);
  const [soLuong, setSoLuong] = useState('1');

  useEffect(() => {
    if (!bienTheChon && sanPham) {
      setBienTheChon(sanPham.bienThe.find((item) => item.soLuongTon > 0) ?? null);
    }
  }, [bienTheChon, sanPham]);

  const tamTinh = useMemo(() => {
    const amount = Number.parseInt(soLuong, 10) || 0;
    return (bienTheChon?.giaBan ?? 0) * amount;
  }, [bienTheChon, soLuong]);

  const themVaoGio = () => {
    if (!sanPham || !bienTheChon) return;

    const amount = Number.parseInt(soLuong, 10);
    if (Number.isNaN(amount) || amount <= 0) {
      Alert.alert('Lỗi', 'Số lượng không hợp lệ');
      return;
    }

    const ok = themSanPham(sanPham, bienTheChon, amount);
    if (!ok) {
      Alert.alert('Không đủ hàng', `Chỉ còn ${bienTheChon.soLuongTon} trong kho`);
      return;
    }

    Alert.alert('Đã thêm vào giỏ', `${sanPham.ten} - ${bienTheChon.tenBienThe}`);
    router.back();
  };

  return {
    sanPham,
    loading,
    error: Number.isFinite(sanPhamId) ? error : 'Mã sản phẩm không hợp lệ',
    bienTheChon,
    setBienTheChon,
    soLuong,
    setSoLuong,
    tamTinh,
    themVaoGio,
  };
}
