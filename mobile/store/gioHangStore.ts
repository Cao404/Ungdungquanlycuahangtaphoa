import { create } from 'zustand';
import { BienThe, SanPham } from '../types/SanPham';
import { ChiTietHoaDon } from '../types/HoaDon';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface GioHangItem extends ChiTietHoaDon {
  tenSanPham: string;
  tenBienThe: string;
  soLuongTon: number;
}

interface GioHangState {
  nguoiDungId: number | null;
  items: GioHangItem[];
  ganNguoiDung: (id: number) => void;
  them: (sanPham: SanPham, bienThe: BienThe, soLuong: number) => boolean;
  capNhat: (bienTheId: number, soLuong: number) => boolean;
  xoa: (bienTheId: number) => void;
  xoaHet: () => void;
  tongTien: () => number;
  soMon: () => number;
}

export const useGioHangStore = create<GioHangState>()(persist((set, get) => ({
  nguoiDungId: null,
  items: [],

  // Giữ giỏ của cùng tài khoản; không để nhân viên khác dùng chung giỏ.
  ganNguoiDung: (id) => set((state) => state.nguoiDungId === id
    ? state
    : { nguoiDungId: id, items: [] }),

  // Cộng dồn cùng biến thể nhưng không cho vượt tồn kho.
  them: (sanPham, bienThe, soLuong) => {
    const exists = get().items.find((item) => item.bienTheId === bienThe.id);
    const soLuongMoi = (exists?.soLuong ?? 0) + soLuong;
    if (soLuong <= 0 || soLuongMoi > bienThe.soLuongTon) return false;

    if (exists) {
      set((state) => ({
        items: state.items.map((item) =>
          item.bienTheId === bienThe.id
            ? { ...item, soLuong: soLuongMoi, thanhTien: soLuongMoi * item.donGia }
            : item
        ),
      }));
      return true;
    }

    set((state) => ({
      items: [
        ...state.items,
        {
          bienTheId: bienThe.id,
          soLuong,
          donGia: bienThe.giaBan,
          thanhTien: soLuong * bienThe.giaBan,
          tenSanPham: sanPham.ten,
          tenBienThe: bienThe.tenBienThe,
          soLuongTon: bienThe.soLuongTon,
        },
      ],
    }));
    return true;
  },

  capNhat: (bienTheId, soLuong) => {
    if (soLuong <= 0) {
      get().xoa(bienTheId);
      return true;
    }

    const item = get().items.find((current) => current.bienTheId === bienTheId);
    if (!item || soLuong > item.soLuongTon) return false;

    set((state) => ({
      items: state.items.map((i) =>
        i.bienTheId === bienTheId
          ? { ...i, soLuong, thanhTien: soLuong * i.donGia }
          : i
      ),
    }));
    return true;
  },

  xoa: (bienTheId) =>
    set((state) => ({ items: state.items.filter((i) => i.bienTheId !== bienTheId) })),

  xoaHet: () => set({ items: [] }),

  tongTien: () => get().items.reduce((sum, i) => sum + i.thanhTien, 0),

  soMon: () => get().items.reduce((sum, i) => sum + i.soLuong, 0),
}), {
  name: 'gio-hang',
  storage: createJSONStorage(() => AsyncStorage),
  partialize: (state) => ({ nguoiDungId: state.nguoiDungId, items: state.items }),
}));
