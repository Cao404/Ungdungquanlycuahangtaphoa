import { useCallback, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { sanPhamService } from '../services/sanpham.service';
import { SanPham } from '../types/SanPham';
import { useFetch } from './useFetch';

export const DANH_MUC = ['Tất cả', 'Thực phẩm', 'Đồ uống', 'Gia vị', 'Chăm sóc', 'Khác'];

export function useSanPhamSearch() {
  const [query, setQuery] = useState('');
  const [danhMuc, setDanhMuc] = useState('');

  const fetcher = useCallback(
    () => sanPhamService.search(query.trim(), danhMuc),
    [query, danhMuc]
  );
  const { data, loading, error, refetch } = useFetch(fetcher, [fetcher]);

  const selectedDanhMuc = useMemo(() => danhMuc || 'Tất cả', [danhMuc]);

  const chonDanhMuc = (value: string) => {
    setDanhMuc(value === 'Tất cả' ? '' : value);
  };

  const chonSanPham = (sanPham: SanPham) => {
    router.push({ pathname: '/(tabs)/banhang/chon-bien-the', params: { id: sanPham.id } });
  };

  return {
    query,
    setQuery,
    danhMuc: selectedDanhMuc,
    chonDanhMuc,
    sanPhams: data ?? [],
    loading,
    error,
    refetch,
    chonSanPham,
  };
}
