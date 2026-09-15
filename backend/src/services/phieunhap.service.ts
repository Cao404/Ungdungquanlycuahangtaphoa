import { z } from 'zod';
import prisma from '../config/database';
import { TaoPhieuNhapBody } from '../types/business.types';

export const taoPhieuNhapSchema = z.object({
  nhaCungCapId: z.string().min(1),
  ghiChu: z.string().optional(),
  chiTiet: z.array(z.object({
    bienTheId: z.string().min(1),
    soLuong: z.number().int().positive(),
    giaNhap: z.number().positive(),
  })).min(1),
});

/**
 * Tạo phiếu nhập trong 1 transaction:
 * 1. Tạo PhieuNhap + ChiTietPhieuNhap
 * 2. Cộng tồn kho cho từng biến thể
 */
export async function taoPhieuNhap(nguoiTaoId: string | number, body: TaoPhieuNhapBody) {
  return prisma.$transaction(async (tx) => {
    const tongTien = body.chiTiet.reduce((s, d) => s + d.soLuong * d.giaNhap, 0);

    // Bước 1: Tạo phiếu nhập
    const phieuNhap = await tx.phieuNhap.create({
      data: {
        nhaCungCapId: Number(body.nhaCungCapId),
        nguoiTaoId: Number(nguoiTaoId),
        ghiChu: body.ghiChu,
        tongTien,
        chiTiets: {
          create: body.chiTiet.map((d) => ({
            bienTheId: Number(d.bienTheId),
            soLuong: d.soLuong,
            giaNhap: d.giaNhap,
          })),
        },
      },
      include: { chiTiets: true },
    });

    // Bước 2: Cộng tồn kho và ghi log GiaoDichKho
    for (const dong of body.chiTiet) {
      const bienTheId = Number(dong.bienTheId);
      const bt = await tx.bienThe.findUnique({ where: { id: bienTheId } });
      if (!bt) throw new Error(`Biến thể #${bienTheId} không tồn tại`);

      const soLuongTruoc = bt.soLuongTon;
      const soLuongSau = soLuongTruoc + dong.soLuong;

      await tx.bienThe.update({
        where: { id: bienTheId },
        data: { soLuongTon: soLuongSau },
      });

      // Tạo bản ghi GiaoDichKho
      await tx.giaoDichKho.create({
        data: {
          bienTheId,
          loaiGiaoDich: 'nhap_hang',
          soLuongThayDoi: dong.soLuong,
          soLuongTruoc,
          soLuongSau,
          thamChieuLoai: 'PhieuNhap',
          thamChieuId: phieuNhap.id,
          nguoiThucHienId: Number(nguoiTaoId),
          ghiChu: body.ghiChu || 'Nhập hàng từ nhà cung cấp',
        },
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
