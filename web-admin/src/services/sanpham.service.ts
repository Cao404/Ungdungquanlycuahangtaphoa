import { apiDelete, apiGet, apiPost, apiPut } from './api';
import { BienThe, BienTheWithSanPham, GiaoDichKho, SanPham } from '../types/SanPham';

type SanPhamPayload = Omit<SanPham, 'id' | 'bienThes'> & { bienThes?: BienThe[] };

function bienThePayload(bienThe: BienThe, sanPhamId?: string) {
  const tenBienThe = bienThe.tenBienThe?.trim();
  return {
    ...(sanPhamId ? { sanPhamId } : {}),
    tenBienThe,
    giaTri: bienThe.giaTri ?? (Number.parseFloat(tenBienThe || '0') || 0),
    donVi: bienThe.donVi || bienThe.donViTinh || tenBienThe || 'Cái',
    giaNhap: Number(bienThe.giaNhap),
    giaBan: Number(bienThe.giaBan),
    soLuongTon: Number(bienThe.soLuongTon),
    nguongCanhBao: Number(bienThe.nguongCanhBao),
    trangThai: bienThe.trangThai ?? true,
    barcode: bienThe.barcode?.trim() || null,
  };
}

async function syncBienThes(sanPhamId: string, bienThes: BienThe[] = []) {
  await Promise.all(
    bienThes.map((bienThe) => {
      const payload = bienThePayload(bienThe, sanPhamId);
      return bienThe.id
        ? apiPut<BienThe>(`/admin/variants/${bienThe.id}`, payload)
        : apiPost<BienThe>('/admin/variants', payload);
    })
  );
}

export const sanPhamService = {
  getAll: () => apiGet<SanPham[]>('/admin/products'),
  getById: (id: string) => apiGet<SanPham>(`/admin/products/${id}`),
  getAllBienThes: () => apiGet<BienTheWithSanPham[]>('/admin/variants'),
  getLichSuKho: (bienTheId: string | number) => apiGet<GiaoDichKho[]>(`/admin/variants/${bienTheId}/lichsu-kho`),
  create: async (payload: SanPhamPayload) => {
    const { bienThes, ...sanPhamPayload } = payload;
    // Nested create keeps the product and all of its variants atomic: a
    // duplicate barcode cannot leave an empty product behind.
    return apiPost<SanPham>('/admin/products', {
      ...sanPhamPayload,
      bienThes: bienThes?.map((bienThe) => bienThePayload(bienThe)),
    });
  },
  update: async (id: string, payload: SanPhamPayload) => {
    const { bienThes, ...sanPhamPayload } = payload;
    const sanPham = await apiPut<SanPham>(`/admin/products/${id}`, sanPhamPayload);
    await syncBienThes(id, bienThes);
    return sanPham;
  },
  remove: (id: string) => apiDelete<void>(`/admin/products/${id}`),
  removeBienThe: (id: string) => apiDelete<void>(`/admin/variants/${id}`),
};
