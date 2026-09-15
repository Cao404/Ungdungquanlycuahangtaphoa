import { RequestHandler } from 'express';
import { taoKiemKeSchema, taoPhieuKiemKe, layDanhSachKiemKe, layChiTietKiemKe } from '../services/kiemke.service';
import { created, ok, badRequest, notFound, serverError } from '../utils/response';

export const getAll: RequestHandler = async (_req, res) => {
  try {
    const data = await layDanhSachKiemKe();
    ok(res, data);
  } catch (e) {
    serverError(res, e);
  }
};

export const getOne: RequestHandler = async (req, res) => {
  try {
    const data = await layChiTietKiemKe(req.params.id);
    if (!data) return notFound(res, 'Phiếu kiểm kê không tồn tại');
    ok(res, data);
  } catch (e) {
    serverError(res, e);
  }
};

export const createOne: RequestHandler = async (req, res) => {
  const parse = taoKiemKeSchema.safeParse(req.body);
  if (!parse.success) return badRequest(res, parse.error.errors[0].message);

  try {
    const data = await taoPhieuKiemKe(req.user!.id, parse.data);
    created(res, data, 'Tạo phiếu kiểm kê và cân bằng kho thành công');
  } catch (e: any) {
    badRequest(res, e.message);
  }
};
