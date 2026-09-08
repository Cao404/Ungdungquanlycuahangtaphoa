export interface BienThe {
  id: string;
  ten: string;       // VD: "500ml", "Đỏ"
  gia: number;
  tonKho: number;
}

export interface SanPham {
  id: string;
  ten: string;
  hinhAnh?: string;
  donViTinh: string;
  gia: number;
  tonKho: number;
  bienThe?: BienThe[];
}
