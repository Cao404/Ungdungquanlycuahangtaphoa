import { useCallback, useEffect, useRef, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { getApiErrorMessage } from '../services/api';
import { sanPhamService } from '../services/sanpham.service';
import { SanPham } from '../types/SanPham';

export function useSanPhamSearch() {
  const [query, setQuery] = useState('');
  const [danhMuc, setDanhMuc] = useState('Tất cả');
  const [categories, setCategories] = useState<string[]>(['Tất cả']);
  const [sanPhams, setSanPhams] = useState<SanPham[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const focusedOnce = useRef(false);

  useFocusEffect(useCallback(() => {
    if (focusedOnce.current) setReloadKey((value) => value + 1);
    else focusedOnce.current = true;
  }, []));

  useEffect(() => {
    sanPhamService.getCategories().then((items) => setCategories(['Tất cả', ...items])).catch(() => undefined);
  }, []);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setLoading(true); setError(null);
      try {
        const data = await sanPhamService.getAll(query.trim(), danhMuc === 'Tất cả' ? '' : danhMuc);
        if (active) setSanPhams(data);
      } catch (e) { if (active) setError(getApiErrorMessage(e, 'Không thể tải sản phẩm.')); }
      finally { if (active) setLoading(false); }
    }, query ? 320 : 0);
    return () => { active = false; clearTimeout(timer); };
  }, [query, danhMuc, reloadKey]);

  return {
    query, setQuery, danhMuc, chonDanhMuc: setDanhMuc, categories, sanPhams, loading, error,
    refetch: () => setReloadKey((value) => value + 1),
    chonSanPham: (sanPham: SanPham) => router.push({ pathname: '/(tabs)/banhang/chon-bien-the', params: { id: sanPham.id } }),
  };
}
