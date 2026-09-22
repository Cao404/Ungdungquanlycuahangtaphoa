import { z } from 'zod';
import prisma from '../config/database';
import { TaoPhieuNhapBody } from '../types/business.types';

export const taoPhieuNhapSchema = z.object({
  nhaCungCapId: z.coerce.number().int().positive(),
  ghiChu: z.string().optional(),
  chiTiet: z.array(z.object({
    bienTheId: z.coerce.number().int().positive(),
    soLuong: z.number().int().positive(),
    giaNhap: z.number().positive(),
  })).min(1),
});

/**
 * Tạo phiếu nhập trong 1 transaction:
 * 1. Tạo PhieuNhap + ChiTietPhieuNhap
 * 2. Cộng tồn kho cho từng biến thể
 */
export async function taoPhieuNhap(nguoiTaoId: number, body: TaoPhieuNhapBody) {
  return prisma.$transaction(async (tx) => {
    const tongTien = body.chiTiet.reduce((s, d) => s + d.soLuong * d.giaNhap, 0);

    // Bước 1: Tạo phiếu nhập
    const phieuNhap = await tx.phieuNhap.create({
      data: {
        nhaCungCapId: body.nhaCungCapId,
        nguoiTaoId,
        ghiChu: body.ghiChu,
        tongTien,
        chiTiets: {
          create: body.chiTiet.map((d) => ({
            bienTheId: d.bienTheId,
            soLuong: d.soLuong,
            giaNhap: d.giaNhap,
          })),
        },
      },
      include: { chiTiets: true },
    });

    // Bước 2: Cộng tồn kho
    for (const dong of body.chiTiet) {
      await tx.bienThe.update({
        where: { id: dong.bienTheId },
        data: { soLuongTon: { increment: dong.soLuong } },
      });
    }

    return phieuNhap;
  });
}

export async function layDanhSachPhieuNhap() {
  return prisma.phieuNhap.findMany({
    include: { nhaCungCap: true, nguoiTao: { select: { hoTen: true } } },
    orderBy: { ngayNhap: 'desc' },
  });
}
