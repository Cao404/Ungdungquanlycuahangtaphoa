import { API_BASE_URL } from '../constants/config';
import { apiGet } from './api';
import { BienThe, SanPham } from '../types/SanPham';

const assetBase = API_BASE_URL.replace(/\/api$/, '');
const imageUrl = (value?: string | null) => {
  if (!value) return value;
  if (value.startsWith('/')) return `${assetBase}${value}`;
  try {
    const parsed = new URL(value);
    if (parsed.pathname.startsWith('/uploads/')) return `${assetBase}${parsed.pathname}`;
  } catch {
    return value;
  }
  return value;
};
const normalizeVariant = (variant: BienThe): BienThe => ({
  ...variant,
  id: String(variant.id), sanPhamId: String(variant.sanPhamId), giaTri: Number(variant.giaTri),
  giaBan: Number(variant.giaBan), soLuongTon: Number(variant.soLuongTon),
});
const normalizeProduct = (product: SanPham): SanPham => ({
  ...product, id: String(product.id), hinhAnh: imageUrl(product.hinhAnh),
  bienThes: (product.bienThes ?? []).map(normalizeVariant),
});

export const sanPhamService = {
  getAll: async (q = '', danhMuc = '') => (await apiGet<SanPham[]>(`/sanpham?q=${encodeURIComponent(q)}&danhMuc=${encodeURIComponent(danhMuc)}`)).map(normalizeProduct),
  getCategories: () => apiGet<string[]>('/sanpham/categories'),
  getById: async (id: string) => normalizeProduct(await apiGet<SanPham>(`/sanpham/${id}`)),
  getByBarcode: async (barcode: string) => {
    const raw = await apiGet<BienThe & { sanPham: SanPham }>(`/sanpham/barcode/${encodeURIComponent(barcode)}`);
    return { ...normalizeVariant(raw), sanPham: normalizeProduct({ ...raw.sanPham, bienThes: raw.sanPham.bienThes ?? [] }) };
  },
};
