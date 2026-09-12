import { RequestHandler } from 'express';
import { dangNhap, loginSchema } from '../services/auth.service';
import { ok, badRequest, serverError } from '../utils/response';

export const login: RequestHandler = async (req, res) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) return badRequest(res, parse.error.errors[0].message);

  try {
    const data = await dangNhap(parse.data.taiKhoan, parse.data.matKhau);
    ok(res, data, 'Đăng nhập thành công');
  } catch (e: any) {
    badRequest(res, e.message);
  }
};
