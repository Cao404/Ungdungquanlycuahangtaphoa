import { RequestHandler } from 'express';
import { dangNhap, loginSchema } from '../services/auth.service';
import { ok, badRequest, serverError } from '../utils/response';
import prisma from '../config/database';
import { ghiNhatKy } from '../services/audit.service';

export const login: RequestHandler = async (req, res) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) return badRequest(res, parse.error.errors[0].message);

  try {
    const data = await dangNhap(parse.data.taiKhoan, parse.data.matKhau);
    void ghiNhatKy({ userId: data.nguoiDung.id, hanhDong: 'LOGIN', trangThai: 'SUCCESS', doiTuong: 'NguoiDung', doiTuongId: data.nguoiDung.id });
    ok(res, data, 'Đăng nhập thành công');
  } catch (e: any) {
    void ghiNhatKy({ hanhDong: 'LOGIN', trangThai: 'FAILED', doiTuong: 'NguoiDung', metadata: { taiKhoan: parse.data.taiKhoan, reason: e.message } });
    badRequest(res, e.message);
  }
};

export const me: RequestHandler = async (req, res) => {
  try {
    const nguoiDung = await prisma.nguoiDung.findUnique({ where: { id: Number(req.user!.id) }, select: { id: true, taiKhoan: true, hoTen: true, vaiTro: true, trangThai: true } });
    ok(res, nguoiDung);
  } catch (error) { serverError(res, error); }
};

export const logout: RequestHandler = (req, res) => {
  void ghiNhatKy({ userId: req.user!.id, hanhDong: 'LOGOUT', trangThai: 'SUCCESS', doiTuong: 'NguoiDung', doiTuongId: req.user!.id });
  ok(res, null, 'Đăng xuất thành công');
};
