import { create } from 'zustand';
import { BienThe, SanPham } from '../types/SanPham';
import { ChiTietHoaDon } from '../types/HoaDon';

// Mỗi item trong giỏ = chi tiết hoá đơn + info hiển thị
export interface GioHangItem extends ChiTietHoaDon {
  tenSanPham: string;
  tenBienThe: string;
}

interface GioHangState {
  items: GioHangItem[];

  // Thêm vào giỏ (nếu đã có cùng bienTheId thì cộng dồn số lượng)
  them: (sanPham: SanPham, bienThe: BienThe, soLuong: number) => void;

  // Cập nhật số lượng; soLuong <= 0 thì tự xoá
  capNhat: (bienTheId: string, soLuong: number) => void;

  xoa: (bienTheId: string) => void;
  xoaHet: () => void;

  tongTien: () => number;
  soMon: () => number;
}

export const useGioHangStore = create<GioHangState>((set, get) => ({
  items: [],

  them: (sanPham, bienThe, soLuong) => {
    set((state) => {
      const exists = state.items.find((i) => i.bienTheId === bienThe.id);
      if (exists) {
        return {
          items: state.items.map((i) =>
            i.bienTheId === bienThe.id
              ? { ...i, soLuong: i.soLuong + soLuong, thanhTien: (i.soLuong + soLuong) * i.donGia }
              : i
          ),
        };
      }
      const newItem: GioHangItem = {
        bienTheId: bienThe.id,
        soLuong,
        donGia: bienThe.giaBan,
        thanhTien: soLuong * bienThe.giaBan,
        tenSanPham: sanPham.ten,
        tenBienThe: bienThe.tenBienThe,
      };
      return { items: [...state.items, newItem] };
    });
  },

  capNhat: (bienTheId, soLuong) => {
    if (soLuong <= 0) {
      get().xoa(bienTheId);
      return;
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.bienTheId === bienTheId
          ? { ...i, soLuong, thanhTien: soLuong * i.donGia }
          : i
      ),
    }));
  },

  xoa: (bienTheId) =>
    set((state) => ({ items: state.items.filter((i) => i.bienTheId !== bienTheId) })),

  xoaHet: () => set({ items: [] }),

  tongTien: () => get().items.reduce((sum, i) => sum + i.thanhTien, 0),

  soMon: () => get().items.reduce((sum, i) => sum + i.soLuong, 0),
}));
