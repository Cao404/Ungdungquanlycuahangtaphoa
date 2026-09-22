import { Prisma } from '@prisma/client';
import { z } from 'zod';
import prisma from '../config/database';
import { JwtPayload } from '../types/auth.types';

export class KiemKeError extends Error {
  constructor(message: string, public readonly statusCode: 400 | 403 | 404 | 409 = 400) {
    super(message);
    this.name = 'KiemKeError';
  }
}

export const taoKiemKeSchema = z.object({
  ghiChu: z.string().trim().max(500, 'Ghi chú tối đa 500 ký tự').optional(),
  chiTiet: z.array(z.object({
    bienTheId: z.number().int().positive(),
    soLuongThucTe: z.number().int().min(0, 'Tồn thực tế không được âm').max(2147483647, 'Số lượng quá lớn'),
  })).min(1, 'Hãy nhập ít nhất một sản phẩm').max(500, 'Một phiếu tối đa 500 biến thể'),
}).superRefine((body, context) => {
  const ids = new Set<number>();
  body.chiTiet.forEach((item, index) => {
    if (ids.has(item.bienTheId)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['chiTiet', index, 'bienTheId'],
        message: `Biến thể ${item.bienTheId} bị trùng trong phiếu`,
      });
    }
    ids.add(item.bienTheId);
  });
});

export const tuChoiKiemKeSchema = z.object({
  lyDoTuChoi: z.string().trim().min(1, 'Vui lòng nhập lý do từ chối').max(500),
});

const include = {
  nguoiTao: { select: { id: true, hoTen: true } },
  nguoiDuyet: { select: { id: true, hoTen: true } },
  chiTiet: {
    include: {
      bienThe: {
        select: {
          id: true,
          giaTri: true,
          donVi: true,
          sanPham: { select: { id: true, ten: true } },
        },
      },
    },
  },
} satisfies Prisma.PhieuKiemKeInclude;

export async function taoPhieuKiemKe(nguoiTaoId: number, body: z.infer<typeof taoKiemKeSchema>) {
  return prisma.$transaction(async (tx) => {
    const ids = body.chiTiet.map((item) => item.bienTheId);
    const variants = await tx.bienThe.findMany({
      where: { id: { in: ids } },
      select: { id: true, soLuongTon: true, trangThai: true },
    });
    const byId = new Map(variants.map((item) => [item.id, item]));

    for (const item of body.chiTiet) {
      const variant = byId.get(item.bienTheId);
      if (!variant) throw new KiemKeError(`Biến thể ${item.bienTheId} không tồn tại`);
      if (!variant.trangThai) throw new KiemKeError(`Biến thể ${item.bienTheId} đã ngừng kinh doanh`);
    }

    return tx.phieuKiemKe.create({
      data: {
        nguoiTaoId,
        ghiChu: body.ghiChu,
        chiTiet: {
          create: body.chiTiet.map((item) => {
            const soLuongHeThong = byId.get(item.bienTheId)!.soLuongTon;
            return {
              bienTheId: item.bienTheId,
              soLuongHeThong,
              soLuongThucTe: item.soLuongThucTe,
              chenhLech: item.soLuongThucTe - soLuongHeThong,
            };
          }),
        },
      },
      include,
    });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export function layDanhSachKiemKe(user: JwtPayload) {
  return prisma.phieuKiemKe.findMany({
    where: user.vaiTro === 'admin' ? {} : { nguoiTaoId: user.id },
    orderBy: { ngayTao: 'desc' },
    include,
  });
}

export async function layPhieuKiemKe(id: number, user: JwtPayload) {
  const phieu = await prisma.phieuKiemKe.findUnique({ where: { id }, include });
  if (!phieu) throw new KiemKeError('Phiếu kiểm kê không tồn tại', 404);
  if (user.vaiTro !== 'admin' && phieu.nguoiTaoId !== user.id) {
    throw new KiemKeError('Bạn không có quyền xem phiếu này', 403);
  }
  return phieu;
}

export async function duyetPhieuKiemKe(id: number, nguoiDuyetId: number) {
  return prisma.$transaction(async (tx) => {
    const phieu = await tx.phieuKiemKe.findUnique({ where: { id }, include: { chiTiet: true } });
    if (!phieu) throw new KiemKeError('Phiếu kiểm kê không tồn tại', 404);
    if (phieu.trangThai !== 'choDuyet') throw new KiemKeError('Phiếu đã được xử lý', 409);

    const claimed = await tx.phieuKiemKe.updateMany({
      where: { id, trangThai: 'choDuyet' },
      data: { trangThai: 'daDuyet', nguoiDuyetId, ngayDuyet: new Date() },
    });
    if (claimed.count !== 1) throw new KiemKeError('Phiếu đã được xử lý', 409);

    for (const line of phieu.chiTiet) {
      const updated = await tx.bienThe.updateMany({
        where: { id: line.bienTheId, soLuongTon: line.soLuongHeThong },
        data: { soLuongTon: line.soLuongThucTe },
      });
      if (updated.count !== 1) {
        throw new KiemKeError(`Tồn kho biến thể ${line.bienTheId} đã thay đổi; cần kiểm kê lại`, 409);
      }
    }

    return tx.phieuKiemKe.findUniqueOrThrow({ where: { id }, include });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function tuChoiPhieuKiemKe(id: number, nguoiDuyetId: number, lyDoTuChoi: string) {
  const updated = await prisma.phieuKiemKe.updateMany({
    where: { id, trangThai: 'choDuyet' },
    data: { trangThai: 'tuChoi', nguoiDuyetId, ngayDuyet: new Date(), lyDoTuChoi },
  });
  if (updated.count !== 1) {
    const exists = await prisma.phieuKiemKe.findUnique({ where: { id }, select: { id: true } });
    throw new KiemKeError(exists ? 'Phiếu đã được xử lý' : 'Phiếu kiểm kê không tồn tại', exists ? 409 : 404);
  }
  return prisma.phieuKiemKe.findUniqueOrThrow({ where: { id }, include });
}
