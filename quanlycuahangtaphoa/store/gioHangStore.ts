import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { SanPham, BienThe } from '../types/SanPham';
import { ChiTietHoaDon } from '../types/HoaDon';

// --- Item trong giỏ ---
export interface GioHangItem extends ChiTietHoaDon {}

interface GioHangState {
  items: GioHangItem[];
}

type GioHangAction =
  | { type: 'THEM'; payload: { sanPham: SanPham; bienThe?: BienThe; soLuong: number } }
  | { type: 'XOA'; payload: { sanPhamId: string; bienTheId?: string } }
  | { type: 'CAP_NHAT_SO_LUONG'; payload: { sanPhamId: string; bienTheId?: string; soLuong: number } }
  | { type: 'XOA_HET' };

function gioHangReducer(state: GioHangState, action: GioHangAction): GioHangState {
  const isSameItem = (item: GioHangItem, spId: string, btId?: string) =>
    item.sanPham.id === spId && item.bienThe?.id === btId;

  switch (action.type) {
    case 'THEM': {
      const { sanPham, bienThe, soLuong } = action.payload;
      const gia = bienThe?.gia ?? sanPham.gia;
      const existing = state.items.find(i => isSameItem(i, sanPham.id, bienThe?.id));
      if (existing) {
        return {
          items: state.items.map(i =>
            isSameItem(i, sanPham.id, bienThe?.id)
              ? { ...i, soLuong: i.soLuong + soLuong, thanhTien: (i.soLuong + soLuong) * gia }
              : i
          ),
        };
      }
      return {
        items: [...state.items, { sanPham, bienThe, soLuong, donGia: gia, thanhTien: soLuong * gia }],
      };
    }
    case 'XOA':
      return { items: state.items.filter(i => !isSameItem(i, action.payload.sanPhamId, action.payload.bienTheId)) };
    case 'CAP_NHAT_SO_LUONG':
      return {
        items: state.items.map(i =>
          isSameItem(i, action.payload.sanPhamId, action.payload.bienTheId)
            ? { ...i, soLuong: action.payload.soLuong, thanhTien: action.payload.soLuong * i.donGia }
            : i
        ),
      };
    case 'XOA_HET':
      return { items: [] };
    default:
      return state;
  }
}

// --- Context ---
const GioHangContext = createContext<{
  state: GioHangState;
  them: (sanPham: SanPham, bienThe?: BienThe, soLuong?: number) => void;
  xoa: (sanPhamId: string, bienTheId?: string) => void;
  capNhatSoLuong: (sanPhamId: string, bienTheId: string | undefined, soLuong: number) => void;
  xoaHet: () => void;
  tongTien: number;
  soLuongTong: number;
} | null>(null);

export function GioHangProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gioHangReducer, { items: [] });

  const them = (sanPham: SanPham, bienThe?: BienThe, soLuong = 1) =>
    dispatch({ type: 'THEM', payload: { sanPham, bienThe, soLuong } });

  const xoa = (sanPhamId: string, bienTheId?: string) =>
    dispatch({ type: 'XOA', payload: { sanPhamId, bienTheId } });

  const capNhatSoLuong = (sanPhamId: string, bienTheId: string | undefined, soLuong: number) =>
    dispatch({ type: 'CAP_NHAT_SO_LUONG', payload: { sanPhamId, bienTheId, soLuong } });

  const xoaHet = () => dispatch({ type: 'XOA_HET' });

  const tongTien = state.items.reduce((sum, i) => sum + i.thanhTien, 0);
  const soLuongTong = state.items.reduce((sum, i) => sum + i.soLuong, 0);

  return (
    <GioHangContext.Provider value={{ state, them, xoa, capNhatSoLuong, xoaHet, tongTien, soLuongTong }}>
      {children}
    </GioHangContext.Provider>
  );
}

export function useGioHang() {
  const ctx = useContext(GioHangContext);
  if (!ctx) throw new Error('useGioHang phải dùng trong GioHangProvider');
  return ctx;
}
