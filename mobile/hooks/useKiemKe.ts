import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { sanPhamService } from '../services/sanpham.service';
import { kiemKeService } from '../services/kiemke.service';
import { getApiErrorMessage } from '../services/api';
import { KiemKeProductRow } from '../types/KiemKe';
import { useFetch } from './useFetch';

export function useKiemKe() {
  const products = useFetch(sanPhamService.getKiemKeNguon, []);
  const [query, setQuery] = useState('');
  const [counts, setCounts] = useState<Record<number, string>>({});
  const [ghiChu, setGhiChu] = useState('');
  const [sending, setSending] = useState(false);

  const rows = useMemo<KiemKeProductRow[]>(() => (products.data ?? []).flatMap((sanPham) =>
    sanPham.bienThe.map((bienThe) => ({ sanPhamTen: sanPham.ten, bienThe }))
  ), [products.data]);

  const visibleRows = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase('vi-VN');
    return keyword
      ? rows.filter((row) => `${row.sanPhamTen} ${row.bienThe.tenBienThe}`.toLocaleLowerCase('vi-VN').includes(keyword))
      : rows;
  }, [query, rows]);

  const setCount = (bienTheId: number, value: string) => {
    setCounts((current) => ({ ...current, [bienTheId]: value }));
  };

  const soDongDaNhap = rows.length;

  const guiPhieu = async () => {
    if (rows.length === 0) {
      Alert.alert('Chưa có sản phẩm', 'Không có biến thể nào để kiểm kê.');
      return;
    }
    const entered = rows.map((row) => ({
      bienTheId: row.bienThe.id,
      value: counts[row.bienThe.id] ?? String(row.bienThe.soLuongTon),
    }));
    if (entered.some(({ value }) => !/^\d+$/.test(value.trim()) || !Number.isSafeInteger(Number(value)) || Number(value) > 2147483647)) {
      Alert.alert('Số lượng không hợp lệ', 'Tồn thực tế phải là số nguyên không âm.');
      return;
    }

    setSending(true);
    try {
      const phieu = await kiemKeService.create({
        ghiChu: ghiChu.trim() || undefined,
        chiTiet: entered.map(({ bienTheId, value }) => ({
          bienTheId,
          soLuongThucTe: Number(value),
        })),
      });
      setCounts({});
      setGhiChu('');
      Alert.alert('Đã gửi phiếu', `Phiếu #${phieu.id} đang chờ duyệt.`);
      router.push('/(tabs)/kiemke/lichsu');
    } catch (error) {
      Alert.alert('Không gửi được phiếu', getApiErrorMessage(error));
    } finally {
      setSending(false);
    }
  };

  return {
    rows: visibleRows,
    query,
    setQuery,
    counts,
    setCount,
    ghiChu,
    setGhiChu,
    soDongDaNhap,
    guiPhieu,
    sending,
    loading: products.loading,
    error: products.error,
    refetch: products.refetch,
  };
}

export function useLichSuKiemKe() {
  const result = useFetch(kiemKeService.getAll, []);
  const hasFocused = useRef(false);

  useFocusEffect(useCallback(() => {
    if (hasFocused.current) result.refetch();
    else hasFocused.current = true;
  }, [result.refetch]));

  return {
    phieu: result.data ?? [],
    loading: result.loading,
    error: result.error,
    refetch: result.refetch,
  };
}
