import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/database';
import { VaiTro } from '../types/auth.types';

export const loginSchema = z.object({
  taiKhoan: z.string({
    required_error: 'Vui lòng nhập tài khoản',
    invalid_type_error: 'Tài khoản không hợp lệ',
  }).trim().min(1, 'Vui lòng nhập tài khoản'),
  matKhau: z.string({
    required_error: 'Vui lòng nhập mật khẩu',
    invalid_type_error: 'Mật khẩu không hợp lệ',
  }).min(1, 'Vui lòng nhập mật khẩu'),
});

export class DangNhapError extends Error {}

const isVaiTro = (value: string): value is VaiTro =>
  value === 'admin' || value === 'nhanvien';

export async function dangNhap(taiKhoan: string, matKhau: string) {
  const nguoiDung = await prisma.nguoiDung.findUnique({ where: { taiKhoan } });
  if (!nguoiDung || !nguoiDung.trangThai) {
    throw new DangNhapError('Tài khoản không tồn tại hoặc đã bị khóa');
  }

  const hopLe = await bcrypt.compare(matKhau, nguoiDung.matKhau);
  if (!hopLe) throw new DangNhapError('Mật khẩu không đúng');
  if (!isVaiTro(nguoiDung.vaiTro)) {
    throw new DangNhapError('Tài khoản không có vai trò hợp lệ');
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET chưa được cấu hình');

  const token = jwt.sign(
    { id: nguoiDung.id, vaiTro: nguoiDung.vaiTro },
    secret,
    { expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'] }
  );

  return {
    token,
    nguoiDung: {
      id: nguoiDung.id,
      hoTen: nguoiDung.hoTen,
      taiKhoan: nguoiDung.taiKhoan,
      vaiTro: nguoiDung.vaiTro,
      trangThai: nguoiDung.trangThai,
    },
  };
}
