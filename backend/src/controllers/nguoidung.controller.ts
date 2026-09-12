import { RequestHandler } from 'express';
import * as svc from '../services/nguoidung.service';
import { ok, created, badRequest, serverError } from '../utils/response';

export const getAll: RequestHandler = async (_req, res) => {
  try { ok(res, await svc.layDanhSach()); }
  catch (e) { serverError(res, e); }
};

export const createOne: RequestHandler = async (req, res) => {
  const parse = svc.taoNguoiDungSchema.safeParse(req.body);
  if (!parse.success) return badRequest(res, parse.error.errors[0].message);
  try { created(res, await svc.taoNguoiDung(parse.data)); }
  catch (e: any) { badRequest(res, e.message); }
};

export const updateOne: RequestHandler = async (req, res) => {
  try { ok(res, await svc.capNhatNguoiDung(req.params.id, req.body), 'Cập nhật thành công'); }
  catch (e) { serverError(res, e); }
};

export const deleteOne: RequestHandler = async (req, res) => {
  try { ok(res, await svc.xoaNguoiDung(req.params.id), 'Xoá thành công'); }
  catch (e) { serverError(res, e); }
};
