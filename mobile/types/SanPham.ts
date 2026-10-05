export interface BienThe {
  id: string;
  sanPhamId: string;
  tenBienThe: string;   // VD: "1 Lít", "500ml"
  giaBan: number;
  donViTinh: string;
  soLuongTon: number;
}

export interface SanPham {
  id: string;
  ten: string;
  thuongHieu?: string;
  danhMuc: string;
  moTa?: string;
  hinhAnh?: string;
  bienThes: BienThe[];
}
