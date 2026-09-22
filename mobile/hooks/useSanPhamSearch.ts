import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { sanPhamService } from '../services/sanpham.service';
import { SanPham } from '../types/SanPham';
import { useFetch } from './useFetch';
import { useGioHang } from './useGioHang';

export const TAT_CA_DANH_MUC = 'Tất cả';

export function useSanPhamSearch() {
  const { themSanPham } = useGioHang();
  const [query, setQuery] = useState('');
  const [danhMuc, setDanhMuc] = useState(TAT_CA_DANH_MUC);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);
  const { data, loading, error, refetch } = useFetch(
    () => sanPhamService.getAll(debouncedQuery, danhMuc === TAT_CA_DANH_MUC ? '' : danhMuc),
    [debouncedQuery, danhMuc]
  );
  const categories = useFetch(sanPhamService.getDanhMuc, []);
  const danhMucs = [TAT_CA_DANH_MUC, ...(categories.data ?? [])];
  const sanPhams = data ?? [];

  const chonDanhMuc = (value: string) => {
    setDanhMuc((current) => (current === value ? TAT_CA_DANH_MUC : value));
  };

  const chonSanPham = (sanPham: SanPham) => {
    if (sanPham.bienThe.length === 0) {
      Alert.alert('Chưa thể bán', 'Sản phẩm chưa có biến thể.');
      return;
    }

    if (sanPham.bienThe.length > 1) {
      router.push({
        pathname: '/(tabs)/banhang/chon-bien-the',
        params: { id: String(sanPham.id) },
      });
      return;
    }

    const bienThe = sanPham.bienThe[0];
    if (!themSanPham(sanPham, bienThe, 1)) {
      Alert.alert('Không đủ hàng', `${bienThe.tenBienThe} đã hết hoặc không đủ tồn kho.`);
      return;
    }
    Alert.alert('Đã thêm vào giỏ', `${sanPham.ten} - ${bienThe.tenBienThe}`);
  };

  return {
    query,
    setQuery,
    danhMuc,
    danhMucs,
    chonDanhMuc,
    sanPhams,
    loading,
    error,
    refetch,
    chonSanPham,
  };
}
