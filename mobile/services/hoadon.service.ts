import { apiGet, apiPost } from './api';
import { CheckoutQuote, HoaDon, TaoHoaDonPayload } from '../types/HoaDon';
type QuotePayload = Pick<TaoHoaDonPayload, 'khachHangId' | 'chiTiet' | 'giamGia' | 'lyDoGiamGia'>;
const normalizeInvoice = (invoice: HoaDon): HoaDon => ({
  ...invoice,
  tamTinh: Number(invoice.tamTinh), giamGia: Number(invoice.giamGia), thue: Number(invoice.thue), tongTien: Number(invoice.tongTien),
  tienKhachDua: invoice.tienKhachDua == null ? null : Number(invoice.tienKhachDua),
  tienThua: invoice.tienThua == null ? null : Number(invoice.tienThua),
  soTienDaThanhToan: Number(invoice.soTienDaThanhToan ?? 0),
  chiTiets: (invoice.chiTiets ?? []).map((line) => ({ ...line, donGia: Number(line.donGia), thanhTien: Number(line.thanhTien) })),
});
export const hoaDonService = {
  quote: (payload: QuotePayload) => apiPost<CheckoutQuote>('/hoadon/quote', payload),
  create: async (payload: TaoHoaDonPayload) => normalizeInvoice(await apiPost<HoaDon>('/hoadon', payload)),
  getByRequestId: async (requestId: string) => normalizeInvoice(await apiGet<HoaDon>(`/hoadon/request/${requestId}`)),
  getAll: async (q = '') => (await apiGet<HoaDon[]>(`/hoadon?q=${encodeURIComponent(q)}`)).map(normalizeInvoice),
  getById: async (id: string) => normalizeInvoice(await apiGet<HoaDon>(`/hoadon/${id}`)),
};
