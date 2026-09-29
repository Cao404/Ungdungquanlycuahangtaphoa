import { RequestHandler } from 'express';
import { baoGiaHoaDon, quoteSchema, taoHoaDon, taoHoaDonSchema, layDanhSachHoaDon, layHoaDonTheoId, layHoaDonTheoRequestId } from '../services/hoadon.service';
import { created, ok, badRequest, notFound, serverError } from '../utils/response';
import { ghiNhatKy } from '../services/audit.service';

export const getAll: RequestHandler = async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : undefined;
  try { ok(res, await layDanhSachHoaDon(req.user?.vaiTro === 'nhanvien' ? req.user.id : undefined, q)); }
  catch (e) { serverError(res, e); }
};

export const quote: RequestHandler = async (req, res) => {
  const parse = quoteSchema.safeParse(req.body);
  if (!parse.success) return badRequest(res, parse.error.errors[0].message);
  try { ok(res, await baoGiaHoaDon(parse.data)); }
  catch (e: any) { badRequest(res, e.message); }
};

export const getByRequestId: RequestHandler = async (req, res) => {
  try {
    const data = await layHoaDonTheoRequestId(req.params.requestId, req.user!.id);
    if (!data) return notFound(res, 'Chưa ghi nhận giao dịch này');
    ok(res, data);
  } catch (e) { serverError(res, e); }
};

export const getOne: RequestHandler = async (req, res) => {
  try {
    const data = await layHoaDonTheoId(req.params.id);
    if (!data) return notFound(res, 'Hoá đơn không tồn tại');
    if (req.user?.vaiTro === 'nhanvien' && data.nguoiBanId !== Number(req.user.id)) return notFound(res, 'Hoá đơn không tồn tại');
    ok(res, data);
  } catch (e) { serverError(res, e); }
};

export const createOne: RequestHandler = async (req, res) => {
  const parse = taoHoaDonSchema.safeParse(req.body);
  if (!parse.success) return badRequest(res, parse.error.errors[0].message);

  try {
    const hoaDon = await taoHoaDon(req.user!.id, parse.data as any);
    created(res, hoaDon, 'Tạo hoá đơn thành công');
  } catch (e: any) {
    void ghiNhatKy({ userId: req.user!.id, hanhDong: 'CREATE_INVOICE', trangThai: 'FAILED', doiTuong: 'HoaDon', doiTuongId: parse.data.requestId, metadata: { reason: e.message } });
    // Lỗi tồn kho từ transaction sẽ trả về message rõ ràng
    badRequest(res, e.message);
  }
};
