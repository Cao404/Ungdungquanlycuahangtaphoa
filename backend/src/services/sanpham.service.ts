import { Prisma } from '@prisma/client';
import { z } from 'zod';
import prisma from '../config/database';

export const sanPhamQuerySchema = z.object({
  search: z.string().trim().max(200, 'Từ khóa tìm kiếm quá dài').optional(),
  danhMuc: z.string().trim().max(100, 'Danh mục không hợp lệ').optional(),
  page: z.coerce.number().int().positive('Trang phải lớn hơn 0').default(1),
  limit: z.coerce.number().int().min(1).max(100, 'Mỗi lần chỉ được lấy tối đa 100 sản phẩm').default(50),
});

export type SanPhamQuery = z.infer<typeof sanPhamQuerySchema>;

const bienTheBanHangSelect = {
  id: true,
  sanPhamId: true,
  giaTri: true,
  donVi: true,
  giaBan: true,
  soLuongTon: true,
} satisfies Prisma.BienTheSelect;

export async function timSanPham(query: SanPhamQuery) {
  const where: Prisma.SanPhamWhereInput = {
    ...(query.search ? { ten: { contains: query.search } } : {}),
    ...(query.danhMuc ? { danhMuc: query.danhMuc } : {}),
    // SanPham chưa có trangThai; biến thể hoạt động là nguồn xác định hàng đang bán.
    bienThes: { some: { trangThai: true } },
  };

  return prisma.sanPham.findMany({
    where,
    skip: (query.page - 1) * query.limit,
    take: query.limit,
    orderBy: { ten: 'asc' },
    select: {
      id: true,
      ten: true,
      thuongHieu: true,
      danhMuc: true,
      hinhAnh: true,
      bienThes: {
        where: { trangThai: true },
        orderBy: { giaTri: 'asc' },
        select: bienTheBanHangSelect,
      },
    },
  });
}

export async function layDanhMucSanPham() {
  const rows = await prisma.sanPham.findMany({
    where: { bienThes: { some: { trangThai: true } } },
    distinct: ['danhMuc'],
    orderBy: { danhMuc: 'asc' },
    select: { danhMuc: true },
  });

  return rows.map((item) => item.danhMuc);
}

export async function layNguonKiemKe() {
  return prisma.sanPham.findMany({
    where: { bienThes: { some: { trangThai: true } } },
    orderBy: { ten: 'asc' },
    select: {
      id: true, ten: true, thuongHieu: true, danhMuc: true, hinhAnh: true,
      bienThes: { where: { trangThai: true }, orderBy: { giaTri: 'asc' }, select: bienTheBanHangSelect },
    },
  });
}
