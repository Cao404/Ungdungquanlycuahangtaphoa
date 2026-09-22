import { HoaDon, HinhThucTT, TrangThaiTT } from '../types/HoaDon';
import { BienThe, SanPham } from '../types/SanPham';

type Numeric = number | string;

export interface ApiBienThe {
  id: number;
  sanPhamId: number;
  giaTri: Numeric;
  donVi: string;
  giaBan: Numeric;
  soLuongTon: number;
}

export interface ApiSanPham {
  id: number;
  ten: string;
  thuongHieu?: string | null;
  danhMuc: string;
  moTa?: string | null;
  hinhAnh?: string | null;
  bienThes: ApiBienThe[];
}

interface ApiChiTietHoaDon {
  id?: number;
  bienTheId: number;
  soLuong: number;
  donGia: Numeric;
  thanhTien: Numeric;
  bienThe?: ApiBienThe & { sanPham: { ten: string } };
}

export interface ApiHoaDon {
  id: number;
  nguoiBanId: number;
  khachHangId?: number | null;
  ngayBan: string;
  tongTien: Numeric;
  giamGia: Numeric;
  hinhThucTT: HinhThucTT;
  trangThaiTT: TrangThaiTT;
  nguoiBan?: { hoTen: string };
  chiTiets?: ApiChiTietHoaDon[];
}

const toNumber = (value: Numeric) => Number(value);

// Backend dùng giaTri/donVi và Decimal; app dùng model hiển thị thống nhất.
export const mapBienThe = (item: ApiBienThe): BienThe => ({
  id: item.id,
  sanPhamId: item.sanPhamId,
  giaTri: toNumber(item.giaTri),
  donVi: item.donVi,
  tenBienThe: `${toNumber(item.giaTri).toLocaleString('vi-VN')} ${item.donVi}`,
  giaBan: toNumber(item.giaBan),
  donViTinh: item.donVi,
  soLuongTon: item.soLuongTon,
});

export const mapSanPham = (item: ApiSanPham): SanPham => ({
  id: item.id,
  ten: item.ten,
  thuongHieu: item.thuongHieu ?? undefined,
  danhMuc: item.danhMuc,
  moTa: item.moTa ?? undefined,
  hinhAnh: item.hinhAnh ?? undefined,
  bienThe: item.bienThes.map(mapBienThe),
});

export const mapHoaDon = (item: ApiHoaDon): HoaDon => ({
  id: item.id,
  nguoiBanId: item.nguoiBanId,
  khachHangId: item.khachHangId ?? undefined,
  ngayBan: item.ngayBan,
  tongTien: toNumber(item.tongTien),
  giamGia: toNumber(item.giamGia),
  hinhThucTT: item.hinhThucTT,
  trangThaiTT: item.trangThaiTT,
  nguoiBan: item.nguoiBan,
  chiTiet: (item.chiTiets ?? []).map((chiTiet) => ({
    id: chiTiet.id,
    bienTheId: chiTiet.bienTheId,
    soLuong: chiTiet.soLuong,
    donGia: toNumber(chiTiet.donGia),
    thanhTien: toNumber(chiTiet.thanhTien),
    bienThe: chiTiet.bienThe
      ? {
          tenBienThe: mapBienThe(chiTiet.bienThe).tenBienThe,
          sanPham: { ten: chiTiet.bienThe.sanPham.ten },
        }
      : undefined,
  })),
});
