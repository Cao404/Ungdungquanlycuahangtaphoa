import { RequestHandler } from 'express';
import { z as zTuChoiLib } from 'zod';
import { taoKiemKeSchema, taoPhieuKiemKe, layDanhSachKiemKe, layChiTietKiemKe, layPhieuCuaToi, layNguonKiemKe, duyetPhieu, tuChoiPhieu } from '../services/kiemke.service';
import { created, ok, badRequest, notFound, serverError } from '../utils/response';

export const getAll: RequestHandler = async (req, res) => {
  try {
    const trangThai = req.query.trangThai as string | undefined;
    if (trangThai && !['cho_duyet', 'da_duyet', 'tu_choi'].includes(trangThai)) return badRequest(res, 'trangThai không hợp lệ');
    const data = await layDanhSachKiemKe(trangThai);
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
    if (req.user!.vaiTro === 'admin' || req.user!.vaiTro === 'owner') {
      const approved = await duyetPhieu(data!.id, req.user!.id);
      return created(res, approved, 'Đã kiểm kê và cập nhật tồn kho');
    }
    created(res, data, 'Tạo phiếu kiểm kê thành công, đang chờ chủ cửa hàng duyệt');
  } catch (e: any) {
    badRequest(res, e.message);
  }
};

export const getMine: RequestHandler = async (req, res) => { try { ok(res, await layPhieuCuaToi(req.user!.id)); } catch (e) { serverError(res, e); } };
export const getSource: RequestHandler = async (_req, res) => { try { ok(res, await layNguonKiemKe()); } catch (e) { serverError(res, e); } };
export const approve: RequestHandler = async (req, res) => { try { const data = await duyetPhieu(req.params.id, req.user!.id); ok(res, data, 'Duyệt phiếu kiểm kê thành công'); } catch (e: any) { if (e.message === 'NOT_FOUND') return notFound(res, 'Phiếu kiểm kê không tồn tại'); badRequest(res, e.message); } };
export const reject: RequestHandler = async (req, res) => { const parse = zTuChoi.safeParse(req.body); if (!parse.success) return badRequest(res, parse.error.errors[0].message); try { const data = await tuChoiPhieu(req.params.id, req.user!.id, parse.data.lyDoTuChoi); ok(res, data, 'Từ chối phiếu kiểm kê thành công'); } catch (e: any) { if (e.message === 'NOT_FOUND') return notFound(res, 'Phiếu kiểm kê không tồn tại'); badRequest(res, e.message); } };

const zTuChoi = zTuChoiLib.object({ lyDoTuChoi: zTuChoiLib.string().trim().min(1, 'lyDoTuChoi là bắt buộc').max(255) });
