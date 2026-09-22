import { useCallback, useRef, useState } from 'react';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { hoaDonService } from '../services/hoadon.service';
import { useFetch } from './useFetch';

export function useLichSuHoaDon() {
  const [tu, setTu] = useState('');
  const [den, setDen] = useState('');
  const [filter, setFilter] = useState<{ tu?: string; den?: string }>({});
  const [filterError, setFilterError] = useState('');
  const result = useFetch(() => hoaDonService.getAll(filter.tu, filter.den), [filter.tu, filter.den]);
  const hasFocused = useRef(false);

  useFocusEffect(useCallback(() => {
    if (hasFocused.current) result.refetch();
    else hasFocused.current = true;
  }, [result.refetch]));

  return {
    tu, setTu, den, setDen, filterError,
    applyFilter: () => {
      const valid = (date: string) => !date || /^\d{4}-\d{2}-\d{2}$/.test(date);
      if (!valid(tu) || !valid(den) || (tu && den && tu > den)) {
        setFilterError('Nhập ngày dạng YYYY-MM-DD; ngày đầu không sau ngày cuối.');
        return;
      }
      setFilterError('');
      setFilter({ tu: tu || undefined, den: den || undefined });
    },
    hoaDons: result.data ?? [],
    loading: result.loading,
    error: result.error,
    refetch: result.refetch,
  };
}

export function useHoaDonDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const invoiceId = Number(id);
  return useFetch(() => {
    if (!Number.isInteger(invoiceId) || invoiceId <= 0) {
      return Promise.reject(new Error('Mã hóa đơn không hợp lệ'));
    }
    return hoaDonService.getById(invoiceId);
  }, [invoiceId]);
}
