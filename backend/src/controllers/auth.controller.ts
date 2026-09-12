import { RequestHandler } from 'express';
import { dangKy, dangNhap, loginSchema, registerSchema } from '../services/auth.service';
import { ok, created, badRequest } from '../utils/response';

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

export const register: RequestHandler = async (req, res) => {
  const parse = registerSchema.safeParse(req.body);
  if (!parse.success) return badRequest(res, parse.error.errors[0].message);

  try {
    const data = await dangKy(parse.data.hoTen, parse.data.taiKhoan, parse.data.matKhau);
    created(res, data, 'Đăng ký thành công');
  } catch (e: any) {
    badRequest(res, e.message);
  }
};
