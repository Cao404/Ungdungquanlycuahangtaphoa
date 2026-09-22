import { RequestHandler } from 'express';
import { khachHangQuerySchema, timKhachHang } from '../services/khachhang.service';
import { badRequest, ok, serverError } from '../utils/response';

export const getAll: RequestHandler = async (req, res) => {
  const parsed = khachHangQuerySchema.safeParse(req.query);
  if (!parsed.success) return badRequest(res, parsed.error.errors[0].message);

  try {
    ok(res, await timKhachHang(parsed.data));
  } catch (error) {
    serverError(res, error);
  }
};
