import bcrypt from 'bcrypt';
import prisma from '../config/database';
import { z } from 'zod';

export const taoNguoiDungSchema = z.object({
  hoTen: z.string().min(1),
  taiKhoan: z.string().min(3),
  matKhau: z.string().min(6),
  vaiTro: z.enum(['admin', 'nhanvien']).optional(),
});

export async function layDanhSach() {
  return prisma.nguoiDung.findMany({
    select: { id: true, hoTen: true, taiKhoan: true, vaiTro: true, trangThai: true, createdAt: true },
  });
}

export async function taoNguoiDung(data: z.infer<typeof taoNguoiDungSchema>) {
  const matKhauHash = await bcrypt.hash(data.matKhau, 10);
  return prisma.nguoiDung.create({
    data: { ...data, matKhau: matKhauHash },
    select: { id: true, hoTen: true, taiKhoan: true, vaiTro: true },
  });
}

export async function capNhatNguoiDung(id: string, data: Partial<{ hoTen: string; trangThai: boolean; vaiTro: 'admin' | 'nhanvien' }>) {
  return prisma.nguoiDung.update({ where: { id: Number(id) }, data });
}

export async function xoaNguoiDung(id: string) {
  return prisma.nguoiDung.delete({ where: { id: Number(id) } });
}
