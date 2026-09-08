import { z } from 'zod';
import prisma from '../config/database';
import { TaoHoaDonBody } from '../types/business.types';

export const chiTietSchema = z.object({
  bienTheId: z.string().min(1),
  soLuong: z.number().int().positive(),
  donGia: z.number().positive(),
});

export const taoHoaDonSchema = z.object({
  khachHangId: z.string().optional(),
  giamGia: z.number().min(0).optional(),
  hinhThucTT: z.enum(['tienmat', 'chuyenkhoan', 'congno']).optional(),
  trangThaiTT: z.enum(['daTT', 'chuaTT']).optional(),
  chiTiet: z.array(chiTietSchema).min(1, 'Phải có ít nhất 1 sản phẩm'),
});

/**
 * Tạo hoá đơn trong 1 transaction:
 * 1. Kiểm tra tồn kho từng biến thể
 * 2. Trừ tồn kho
 * 3. Tạo HoaDon + ChiTietHoaDon
 */
export async function taoHoaDon(nguoiBanId: string, body: TaoHoaDonBody) {
  return prisma.$transaction(async (tx) => {
    // Bước 1: Kiểm tra tồn kho
    for (const dong of body.chiTiet) {
      const bt = await tx.bienThe.findUnique({ where: { id: dong.bienTheId } });
      if (!bt) throw new Error(`Biến thể ${dong.bienTheId} không tồn tại`);
      if (bt.soLuongTon < dong.soLuong)
        throw new Error(`"${bt.tenBienThe}" chỉ còn ${bt.soLuongTon}, không đủ ${dong.soLuong}`);
    }

    // Bước 2: Trừ tồn kho
    for (const dong of body.chiTiet) {
      await tx.bienThe.update({
        where: { id: dong.bienTheId },
        data: { soLuongTon: { decrement: dong.soLuong } },
      });
    }

    const tongTien = body.chiTiet.reduce((s, d) => s + d.soLuong * d.donGia, 0);

    // Bước 3: Tạo HoaDon và ChiTietHoaDon
    const hoaDon = await tx.hoaDon.create({
      data: {
        nguoiBanId,
        khachHangId: body.khachHangId,
        giamGia: body.giamGia ?? 0,
        hinhThucTT: body.hinhThucTT ?? 'tienmat',
        trangThaiTT: body.trangThaiTT ?? 'daTT',
        tongTien,
        chiTiets: {
          create: body.chiTiet.map((d) => ({
            bienTheId: d.bienTheId,
            soLuong: d.soLuong,
            donGia: d.donGia,          // lưu cứng giá tại thời điểm bán
            thanhTien: d.soLuong * d.donGia,
          })),
        },
      },
      include: { chiTiets: true },
    });

    return hoaDon;
  });
}

export async function layDanhSachHoaDon() {
  return prisma.hoaDon.findMany({
    include: { nguoiBan: { select: { hoTen: true } }, khachHang: true },
    orderBy: { ngayBan: 'desc' },
  });
}

export async function layHoaDonTheoId(id: string) {
  return prisma.hoaDon.findUnique({
    where: { id },
    include: {
      nguoiBan: { select: { hoTen: true } },
      khachHang: true,
      chiTiets: { include: { bienThe: { include: { sanPham: true } } } },
    },
  });
}
