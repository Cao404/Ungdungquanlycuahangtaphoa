import { create } from 'zustand';
import { BienThe, SanPham, variantLabel } from '../types/SanPham';
export interface GioHangItem { bienTheId: string; soLuong: number; donGia: number; thanhTien: number; tenSanPham: string; tenBienThe: string; tonKho: number; }
interface State { items: GioHangItem[]; them: (p: SanPham, v: BienThe, q: number) => boolean; capNhat: (id: string, q: number) => boolean; xoa: (id: string) => void; xoaHet: () => void; tongTien: () => number; soMon: () => number; }
export const useGioHangStore = create<State>((set, get) => ({
  items: [],
  them: (p, v, q) => { const current = get().items.find((i) => i.bienTheId === v.id)?.soLuong ?? 0; if (current + q > v.soLuongTon) return false; set((s) => ({ items: s.items.some((i) => i.bienTheId === v.id) ? s.items.map((i) => i.bienTheId === v.id ? { ...i, soLuong: current + q, thanhTien: (current + q) * i.donGia, tonKho: v.soLuongTon } : i) : [...s.items, { bienTheId: v.id, soLuong: q, donGia: v.giaBan, thanhTien: q * v.giaBan, tenSanPham: p.ten, tenBienThe: variantLabel(v), tonKho: v.soLuongTon }] })); return true; },
  capNhat: (id, q) => { const item = get().items.find((i) => i.bienTheId === id); if (!item) return false; if (q <= 0) { get().xoa(id); return true; } if (q > item.tonKho) return false; set((s) => ({ items: s.items.map((i) => i.bienTheId === id ? { ...i, soLuong: q, thanhTien: q * i.donGia } : i) })); return true; },
  xoa: (id) => set((s) => ({ items: s.items.filter((i) => i.bienTheId !== id) })), xoaHet: () => set({ items: [] }), tongTien: () => get().items.reduce((sum, i) => sum + i.thanhTien, 0), soMon: () => get().items.reduce((sum, i) => sum + i.soLuong, 0),
}));
