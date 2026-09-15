import { useState } from 'react';
import { hoaDonService } from '../services/hoadon.service';
import { useFetch } from './useFetch';

export function useLichSuHoaDon() {
  const { data, loading, error, refetch } = useFetch(hoaDonService.getAll);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpanded = (id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  return {
    hoaDons: data ?? [],
    loading,
    error,
    refetch,
    expandedId,
    toggleExpanded,
  };
}
