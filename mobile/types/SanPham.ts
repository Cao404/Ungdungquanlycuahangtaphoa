export interface BienThe { id: string; sanPhamId: string; giaTri: number; donVi: string; giaBan: number; soLuongTon: number; trangThai?: boolean; barcode?: string | null; tenBienThe?: string; donViTinh?: string; }
export interface SanPham { id: string; ten: string; thuongHieu?: string | null; danhMuc: string; moTa?: string | null; hinhAnh?: string | null; bienThes: BienThe[]; }
export const variantLabel = (variant: BienThe) => variant.tenBienThe ?? `${variant.giaTri} ${variant.donVi}`;
