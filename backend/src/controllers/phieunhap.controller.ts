import { RequestHandler } from 'express';
import { capNhatPhieuNhap, huyPhieuNhap, layChiTietPhieuNhap, layDanhSachPhieuNhap, taoPhieuNhap, taoPhieuNhapSchema, xacNhanPhieuNhap } from '../services/phieunhap.service';
import { created, ok, badRequest, serverError } from '../utils/response';

export const getAll: RequestHandler = async (_req, res) => {
  try { ok(res, await layDanhSachPhieuNhap()); }
  catch (e) { serverError(res, e); }
};

export const createOne: RequestHandler = async (req, res) => {
  const parse = taoPhieuNhapSchema.safeParse(req.body);
  if (!parse.success) return badRequest(res, parse.error.errors[0].message);

  try {
    const phieu = await taoPhieuNhap(req.user!.id, parse.data as any);
    created(res, phieu, 'Tạo phiếu nhập thành công');
  } catch (e: any) {
    badRequest(res, e.message);
  }
};

export const getOne: RequestHandler = async (req, res) => {
  try { const data = await layChiTietPhieuNhap(req.params.id); if (!data) return badRequest(res, 'Phiếu nhập không tồn tại', 'NOT_FOUND'); ok(res, data); }
  catch (e) { serverError(res, e); }
};

export const updateOne: RequestHandler = async (req, res) => {
  const parse = taoPhieuNhapSchema.safeParse(req.body);
  if (!parse.success) return badRequest(res, parse.error.errors[0].message);
  try { ok(res, await capNhatPhieuNhap(req.params.id, parse.data as any), 'Cập nhật phiếu nhập thành công'); }
  catch (e: any) { if (e.message === 'NOT_FOUND') return badRequest(res, 'Phiếu nhập không tồn tại', 'NOT_FOUND'); badRequest(res, e.message, 'INVALID_STATUS'); }
};

export const confirm: RequestHandler = async (req, res) => {
  try { ok(res, await xacNhanPhieuNhap(req.params.id, req.user!.id), 'Xác nhận phiếu nhập thành công, tồn kho đã được cập nhật'); }
  catch (e: any) { if (e.message === 'NOT_FOUND') return badRequest(res, 'Phiếu nhập không tồn tại', 'NOT_FOUND'); badRequest(res, e.message, 'INVALID_STATUS'); }
};

export const cancel: RequestHandler = async (req, res) => {
  try { ok(res, await huyPhieuNhap(req.params.id), 'Đã hủy phiếu nhập nháp'); }
  catch (e: any) { badRequest(res, e.message, 'INVALID_STATUS'); }
};
