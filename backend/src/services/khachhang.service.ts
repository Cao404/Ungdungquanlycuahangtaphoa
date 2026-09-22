import { Prisma } from '@prisma/client';
import { z } from 'zod';
import prisma from '../config/database';

export const khachHangQuerySchema = z.object({
  search: z.string().trim().max(200, 'Từ khóa tìm kiếm quá dài').optional(),
  limit: z.coerce.number().int().min(1).max(50, 'Mỗi lần chỉ được lấy tối đa 50 khách hàng').default(20),
});

export async function timKhachHang(query: z.infer<typeof khachHangQuerySchema>) {
  const where: Prisma.KhachHangWhereInput = query.search
    ? {
        OR: [
          { ten: { contains: query.search } },
          { sdt: { contains: query.search } },
        ],
      }
    : {};

  return prisma.khachHang.findMany({
    where,
    take: query.limit,
    orderBy: { ten: 'asc' },
    select: { id: true, ten: true, sdt: true, diaChi: true },
  });
}
