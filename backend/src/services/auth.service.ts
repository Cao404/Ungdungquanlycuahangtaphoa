import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/database';

export const loginSchema = z.object({
  taiKhoan: z.string().min(1),
  matKhau: z.string().min(1),
});

export const registerSchema = z.object({
  hoTen: z.string().trim().min(1, 'Vui lòng nhập họ tên').max(100),
  taiKhoan: z.string().trim().min(3, 'Tài khoản phải có ít nhất 3 ký tự').max(50),
  matKhau: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').max(72),
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

export async function dangKy(hoTen: string, taiKhoan: string, matKhau: string) {
  const taiKhoanDaTonTai = await prisma.nguoiDung.findUnique({ where: { taiKhoan } });
  if (taiKhoanDaTonTai) throw new Error('Tài khoản đã tồn tại');

  const matKhauHash = await bcrypt.hash(matKhau, 10);
  return prisma.nguoiDung.create({
    data: {
      hoTen,
      taiKhoan,
      matKhau: matKhauHash,
      vaiTro: 'nhanvien',
      trangThai: true,
    },
    select: { id: true, hoTen: true, taiKhoan: true, vaiTro: true, trangThai: true },
  });
}
