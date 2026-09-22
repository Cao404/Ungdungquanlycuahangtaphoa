export interface BienThe {
  id: number;
  sanPhamId: number;
  giaTri: number;
  donVi: string;
  tenBienThe: string;
  giaBan: number;
  donViTinh: string;
  soLuongTon: number;
}

export interface SanPham {
  id: number;
  ten: string;
  thuongHieu?: string;
  danhMuc: string;
  moTa?: string;
  hinhAnh?: string;
  bienThe: BienThe[];
}
