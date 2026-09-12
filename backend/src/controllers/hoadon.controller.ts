import { RequestHandler } from 'express';
import { taoHoaDon, taoHoaDonSchema, layDanhSachHoaDon, layHoaDonTheoId } from '../services/hoadon.service';
import { created, ok, badRequest, notFound, serverError } from '../utils/response';

export const getAll: RequestHandler = async (_req, res) => {
  try { ok(res, await layDanhSachHoaDon()); }
  catch (e) { serverError(res, e); }
};

export const getOne: RequestHandler = async (req, res) => {
  try {
    const data = await layHoaDonTheoId(req.params.id);
    if (!data) return notFound(res, 'Hoá đơn không tồn tại');
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
    // Lỗi tồn kho từ transaction sẽ trả về message rõ ràng
    badRequest(res, e.message);
  }
};
