import { z } from 'zod';
import prisma from '../config/database';

export const taoKiemKeSchema = z.object({
  ghiChu: z.string().optional(),
  chiTiet: z
    .array(
      z.object({
        bienTheId: z.union([z.string(), z.number()]),
        soLuongThucTe: z.number().int().min(0),
      })
    )
    .min(1, 'Cần ít nhất 1 biến thể để kiểm kê'),
});

export type TaoKiemKeInput = z.infer<typeof taoKiemKeSchema>;

export async function taoPhieuKiemKe(nguoiTaoId: number | string, data: TaoKiemKeInput) {
  return prisma.$transaction(async (tx) => {
    // 1. Tạo phiếu kiểm kê
    const phieuKiemKe = await tx.phieuKiemKe.create({
      data: {
        nguoiTaoId: Number(nguoiTaoId),
        ghiChu: data.ghiChu || null,
      },
    });

    // 2. Duyệt qua từng dòng kiểm kê
    for (const item of data.chiTiet) {
      const bienTheId = Number(item.bienTheId);
      const bt = await tx.bienThe.findUnique({ where: { id: bienTheId } });
      if (!bt) throw new Error(`Biến thể #${bienTheId} không tồn tại`);

      const soLuongHeThong = bt.soLuongTon;
      const soLuongThucTe = item.soLuongThucTe;
      const soLuongThayDoi = soLuongThucTe - soLuongHeThong;

      // Lưu chi tiết kiểm kê
      await tx.chiTietKiemKe.create({
        data: {
          phieuKiemKeId: phieuKiemKe.id,
          bienTheId,
          soLuongHeThong,
          soLuongThucTe,
        },
      });

      // Cập nhật tồn kho thực tế cho biến thể
      await tx.bienThe.update({
        where: { id: bienTheId },
        data: { soLuongTon: soLuongThucTe },
      });

      // Ghi log giao dịch kho
      await tx.giaoDichKho.create({
        data: {
          bienTheId,
          loaiGiaoDich: 'kiem_ke',
          soLuongThayDoi, // có thể âm hoặc dương
          soLuongTruoc: soLuongHeThong,
          soLuongSau: soLuongThucTe,
          thamChieuLoai: 'PhieuKiemKe',
          thamChieuId: phieuKiemKe.id,
          nguoiThucHienId: Number(nguoiTaoId),
          ghiChu: `Kiểm kê kho: Hệ thống ${soLuongHeThong} -> Thực tế ${soLuongThucTe} (Lệch ${soLuongThayDoi >= 0 ? '+' : ''}${soLuongThayDoi})`,
        },
      });
    }

    return tx.phieuKiemKe.findUnique({
      where: { id: phieuKiemKe.id },
      include: {
        nguoiTao: { select: { id: true, hoTen: true, taiKhoan: true } },
        chiTiets: {
          include: {
            bienThe: {
              include: { sanPham: { select: { id: true, ten: true } } },
            },
          },
        },
      },
    });
  });
}

export async function layDanhSachKiemKe() {
  return prisma.phieuKiemKe.findMany({
    include: {
      nguoiTao: { select: { id: true, hoTen: true, taiKhoan: true } },
      chiTiets: {
        include: {
          bienThe: {
            include: { sanPham: { select: { id: true, ten: true } } },
          },
        },
      },
    },
    orderBy: { ngayKiemKe: 'desc' },
  });
}

export async function layChiTietKiemKe(id: number | string) {
  return prisma.phieuKiemKe.findUnique({
    where: { id: Number(id) },
    include: {
      nguoiTao: { select: { id: true, hoTen: true, taiKhoan: true } },
      chiTiets: {
        include: {
          bienThe: {
            include: { sanPham: { select: { id: true, ten: true } } },
          },
        },
      },
    },
  });
}
