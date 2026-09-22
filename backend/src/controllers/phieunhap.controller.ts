import { RequestHandler } from 'express';
import { taoPhieuNhap, taoPhieuNhapSchema, layDanhSachPhieuNhap } from '../services/phieunhap.service';
import { created, ok, badRequest, serverError } from '../utils/response';

export const getAll: RequestHandler = async (_req, res) => {
  try { ok(res, await layDanhSachPhieuNhap()); }
  catch (e) { serverError(res, e); }
};

export const createOne: RequestHandler = async (req, res) => {
  const parse = taoPhieuNhapSchema.safeParse(req.body);
  if (!parse.success) return badRequest(res, parse.error.errors[0].message);

  try {
    const phieu = await taoPhieuNhap(req.user!.id, parse.data);
    created(res, phieu, 'Tạo phiếu nhập thành công');
  } catch (e: any) {
    badRequest(res, e.message);
  }
};
