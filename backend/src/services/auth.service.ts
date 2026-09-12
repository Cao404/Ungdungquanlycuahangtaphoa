import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/database';

export const loginSchema = z.object({
  taiKhoan: z.string().min(1),
  matKhau: z.string().min(1),
});

export async function dangNhap(taiKhoan: string, matKhau: string) {
  const nguoiDung = await prisma.nguoiDung.findUnique({ where: { taiKhoan } });
  if (!nguoiDung || !nguoiDung.trangThai) throw new Error('Tài khoản không tồn tại hoặc đã bị khoá');

  const hopLe = await bcrypt.compare(matKhau, nguoiDung.matKhau);
  if (!hopLe) throw new Error('Mật khẩu không đúng');

  const token = jwt.sign(
    { id: nguoiDung.id, vaiTro: nguoiDung.vaiTro },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' }
  );

  const { matKhau: _, ...info } = nguoiDung;
  return { token, nguoiDung: info };
}
