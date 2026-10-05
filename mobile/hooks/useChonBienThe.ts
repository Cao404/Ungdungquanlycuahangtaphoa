import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { getApiErrorMessage } from '../services/api';
import { sanPhamService } from '../services/sanpham.service';
import { BienThe } from '../types/SanPham';
import { useFetch } from './useFetch';
import { useGioHang } from './useGioHang';

export function useChonBienThe(id?: string) {
  const { data: sanPham, loading, error, refreshSilently } = useFetch(
    () => sanPhamService.getById(id ?? ''),
    [id]
  );
  const { themSanPham } = useGioHang();
  const [bienTheChon, setBienTheChon] = useState<BienThe | null>(null);
  const [soLuong, setSoLuong] = useState('1');

  // Expo Router giữ màn hình trong stack. Làm mới khi quay lại và trong lúc
  // màn hình đang mở để tồn kho không bị giữ ở snapshot cũ.
  useFocusEffect(useCallback(() => {
    void refreshSilently();
    const timer = setInterval(() => void refreshSilently(), 5000);
    return () => clearInterval(timer);
  }, [refreshSilently]));

  useEffect(() => {
    if (!bienTheChon || !sanPham) return;
    const freshVariant = sanPham.bienThes.find((item) => item.id === bienTheChon.id);
    setBienTheChon(freshVariant ?? null);
  }, [sanPham]);

  const tamTinh = useMemo(() => {
    const amount = Number.parseInt(soLuong, 10) || 0;
    return (bienTheChon?.giaBan ?? 0) * amount;
  }, [bienTheChon, soLuong]);

  const themVaoGio = async () => {
    if (!sanPham || !bienTheChon) return;

    const amount = Number.parseInt(soLuong, 10);
    if (Number.isNaN(amount) || amount <= 0) {
      Alert.alert('Lỗi', 'Số lượng không hợp lệ');
      return;
    }

    let freshProduct;
    try {
      freshProduct = await sanPhamService.getById(sanPham.id);
    } catch (e) {
      Alert.alert('Không kiểm tra được tồn kho', getApiErrorMessage(e, 'Kiểm tra kết nối rồi thử lại.'));
      return;
    }
    const freshVariant = freshProduct.bienThes.find((item) => item.id === bienTheChon.id);
    if (!freshVariant || freshVariant.soLuongTon <= 0) {
      setBienTheChon(freshVariant ?? null);
      Alert.alert('Đã hết hàng', 'Loại hàng này hiện không còn trong kho.');
      return;
    }
    setBienTheChon(freshVariant);
    const ok = themSanPham(freshProduct, freshVariant, amount);
    if (!ok) {
      Alert.alert('Không đủ hàng', `Chỉ còn ${freshVariant.soLuongTon} trong kho`);
      return;
    }

    Alert.alert('Đã thêm', `${freshProduct.ten} - ${freshVariant.tenBienThe}`);
    router.back();
  };

  return {
    sanPham,
    loading,
    error,
    bienTheChon,
    setBienTheChon,
    soLuong,
    setSoLuong,
    tamTinh,
    themVaoGio,
  };
}
