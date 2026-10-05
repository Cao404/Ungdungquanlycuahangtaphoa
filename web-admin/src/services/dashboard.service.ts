import { apiGet } from './api';

export interface DashboardOverview {
  tuNgay: string;
  denNgay: string;
  doanhThu: number;
  soHoaDon: number;
  soSanPham: number;
  sapHetHang: number;
  hetHang: number;
  soPhieuNhap: number;
  tienNhap: number;
  soKhachHang: number;
  soNhanVien: number;
  giaTriTonKho: number;
  loSapHetHan: number;
  loHetHan: number;
  hangCanXuLy: { loHangId: number; tenSanPham: string; quyCach: string; maLo?: string | null; hanSuDung: string; soLuongCon: number; daHetHan: boolean }[];
  tongCongNo: number;
  noQuaHan: number;
  soKhachDangNo: number;
  tongNoNhaCungCap: number;
  noNhaCungCapQuaHan: number;
  soNhaCungCapDangNo: number;
  doanhThuTheoNgay: { date: string; total: number }[];
}

export const dashboardService = {
  getOverview: (tu?: string, den?: string) => apiGet<DashboardOverview>(`/admin/dashboard${tu && den ? `?tu=${tu}&den=${den}` : ''}`),
};
