import { RequestHandler, Response } from 'express';
import {
  KiemKeError,
  duyetPhieuKiemKe,
  layDanhSachKiemKe,
  layPhieuKiemKe,
  taoKiemKeSchema,
  taoPhieuKiemKe,
  tuChoiKiemKeSchema,
  tuChoiPhieuKiemKe,
} from '../services/kiemke.service';
import { badRequest, created, ok, serverError } from '../utils/response';

function handleError(res: Response, error: unknown) {
  if (error instanceof KiemKeError) {
    res.status(error.statusCode).json({ success: false, message: error.message });
  } else {
    serverError(res, error);
  }
}

function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export const getAll: RequestHandler = async (req, res) => {
  try { ok(res, await layDanhSachKiemKe(req.user!)); }
  catch (error) { handleError(res, error); }
};

export const getMine: RequestHandler = async (req, res) => {
  try { ok(res, await layDanhSachKiemKe({ ...req.user!, vaiTro: 'nhanvien' })); }
  catch (error) { handleError(res, error); }
};

export const getOne: RequestHandler = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return badRequest(res, 'Mã phiếu không hợp lệ');
  try { ok(res, await layPhieuKiemKe(id, req.user!)); }
  catch (error) { handleError(res, error); }
};

export const createOne: RequestHandler = async (req, res) => {
  const parsed = taoKiemKeSchema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, parsed.error.errors[0].message);
  try { created(res, await taoPhieuKiemKe(req.user!.id, parsed.data), 'Đã gửi phiếu kiểm kê chờ duyệt'); }
  catch (error) { handleError(res, error); }
};

export const approve: RequestHandler = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return badRequest(res, 'Mã phiếu không hợp lệ');
  try { ok(res, await duyetPhieuKiemKe(id, req.user!.id), 'Đã duyệt và cập nhật tồn kho'); }
  catch (error) { handleError(res, error); }
};

export const reject: RequestHandler = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return badRequest(res, 'Mã phiếu không hợp lệ');
  const parsed = tuChoiKiemKeSchema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, parsed.error.errors[0].message);
  try { ok(res, await tuChoiPhieuKiemKe(id, req.user!.id, parsed.data.lyDoTuChoi), 'Đã từ chối phiếu kiểm kê'); }
  catch (error) { handleError(res, error); }
};
