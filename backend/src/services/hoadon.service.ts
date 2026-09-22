import { Prisma } from '@prisma/client';
import { z } from 'zod';
import prisma from '../config/database';
import { JwtPayload } from '../types/auth.types';

export class HoaDonServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: 400 | 403 | 404 = 400
  ) {
    super(message);
    this.name = 'HoaDonServiceError';
  }
}

export const chiTietSchema = z.object({
  bienTheId: z.number({
    required_error: 'Vui lòng chọn biến thể sản phẩm',
    invalid_type_error: 'Mã biến thể không hợp lệ',
  }).int().positive('Mã biến thể không hợp lệ'),
  soLuong: z.number({
    required_error: 'Vui lòng nhập số lượng',
    invalid_type_error: 'Số lượng không hợp lệ',
  }).int().positive('Số lượng phải lớn hơn 0'),
  donGia: z.number({
    required_error: 'Vui lòng nhập đơn giá',
    invalid_type_error: 'Đơn giá không hợp lệ',
  }).positive('Đơn giá phải lớn hơn 0').finite('Đơn giá không hợp lệ'),
});

export const taoHoaDonSchema = z.object({
  khachHangId: z.number({ invalid_type_error: 'Mã khách hàng không hợp lệ' })
    .int().positive('Mã khách hàng không hợp lệ').nullable().optional(),
  hinhThucTT: z.enum(['tienmat', 'chuyenkhoan', 'congno'], {
    required_error: 'Vui lòng chọn hình thức thanh toán',
  }),
  giamGia: z.number({ invalid_type_error: 'Giảm giá không hợp lệ' })
    .min(0, 'Giảm giá không được nhỏ hơn 0').finite('Giảm giá không hợp lệ').default(0),
  chiTiet: z.array(chiTietSchema, {
    required_error: 'Phải có ít nhất 1 sản phẩm',
    invalid_type_error: 'Chi tiết hóa đơn không hợp lệ',
  }).min(1, 'Phải có ít nhất 1 sản phẩm'),
}).superRefine((data, context) => {
  if (data.hinhThucTT === 'congno' && !data.khachHangId) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['khachHangId'],
      message: 'Bán công nợ phải chọn khách hàng',
    });
  }

  const ids = new Set<number>();
  data.chiTiet.forEach((item, index) => {
    if (ids.has(item.bienTheId)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['chiTiet', index, 'bienTheId'],
        message: `Biến thể ${item.bienTheId} bị trùng trong hóa đơn`,
      });
    }
    ids.add(item.bienTheId);
  });

  const tamTinh = data.chiTiet.reduce(
    (total, item) => total + item.soLuong * item.donGia,
    0
  );
  if (data.giamGia > tamTinh) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['giamGia'],
      message: 'Giảm giá không được vượt quá tổng tiền hàng',
    });
  }
});

const dateSchema = z.preprocess((value) => value === '' ? undefined : value, z.string().trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày phải có định dạng YYYY-MM-DD')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, 'Ngày không hợp lệ')
  .optional());

export const hoaDonQuerySchema = z.object({
  tu: dateSchema,
  den: dateSchema,
}).superRefine((data, context) => {
  if (data.tu && data.den && data.tu > data.den) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['den'],
      message: 'Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu',
    });
  }
});

type TaoHoaDonInput = z.infer<typeof taoHoaDonSchema>;
type HoaDonQuery = z.infer<typeof hoaDonQuerySchema>;

const hoaDonInclude = {
  nguoiBan: { select: { id: true, hoTen: true, taiKhoan: true } },
  khachHang: { select: { id: true, ten: true, sdt: true } },
  chiTiets: {
    include: {
      bienThe: {
        select: {
          id: true,
          sanPhamId: true,
          giaTri: true,
          donVi: true,
          giaBan: true,
          soLuongTon: true,
          sanPham: {
            select: { id: true, ten: true, thuongHieu: true, danhMuc: true },
          },
        },
      },
    },
  },
} satisfies Prisma.HoaDonInclude;

export async function taoHoaDon(nguoiBanId: number, body: TaoHoaDonInput) {
  return prisma.$transaction(async (tx) => {
    if (body.khachHangId) {
      const khachHang = await tx.khachHang.findUnique({
        where: { id: body.khachHangId },
        select: { id: true },
      });
      if (!khachHang) throw new HoaDonServiceError('Khách hàng không tồn tại');
    }

    const bienThes = await tx.bienThe.findMany({
      where: { id: { in: body.chiTiet.map((item) => item.bienTheId) } },
      select: {
        id: true,
        soLuongTon: true,
        donVi: true,
        trangThai: true,
        sanPham: { select: { ten: true } },
      },
    });
    const bienTheById = new Map(bienThes.map((item) => [item.id, item]));

    for (const item of body.chiTiet) {
      const bienThe = bienTheById.get(item.bienTheId);
      if (!bienThe) {
        throw new HoaDonServiceError(`Biến thể ${item.bienTheId} không tồn tại`);
      }
      if (!bienThe.trangThai) {
        throw new HoaDonServiceError(`Sản phẩm ${bienThe.sanPham.ten} đang ngừng kinh doanh`);
      }
      if (bienThe.soLuongTon < item.soLuong) {
        throw new HoaDonServiceError(
          `Sản phẩm ${bienThe.sanPham.ten} không đủ tồn kho, còn lại ${bienThe.soLuongTon} ${bienThe.donVi}`
        );
      }
    }

    // Điều kiện gte giúp tránh bán âm kho nếu có hai quầy thanh toán cùng lúc.
    for (const item of body.chiTiet) {
      const bienThe = bienTheById.get(item.bienTheId)!;
      const updated = await tx.bienThe.updateMany({
        where: {
          id: item.bienTheId,
          trangThai: true,
          soLuongTon: { gte: item.soLuong },
        },
        data: { soLuongTon: { decrement: item.soLuong } },
      });

      if (updated.count !== 1) {
        const current = await tx.bienThe.findUnique({
          where: { id: item.bienTheId },
          select: { soLuongTon: true },
        });
        throw new HoaDonServiceError(
          `Sản phẩm ${bienThe.sanPham.ten} không đủ tồn kho, còn lại ${current?.soLuongTon ?? 0} ${bienThe.donVi}`
        );
      }
    }

    const tamTinh = body.chiTiet.reduce(
      (total, item) => total + item.soLuong * item.donGia,
      0
    );
    const tongTien = tamTinh - body.giamGia;

    return tx.hoaDon.create({
      data: {
        nguoiBanId,
        khachHangId: body.khachHangId ?? null,
        hinhThucTT: body.hinhThucTT,
        trangThaiTT: body.hinhThucTT === 'congno' ? 'chuaTT' : 'daTT',
        giamGia: body.giamGia,
        tongTien,
        chiTiets: {
          create: body.chiTiet.map((item) => ({
            bienTheId: item.bienTheId,
            soLuong: item.soLuong,
            donGia: item.donGia,
            thanhTien: item.soLuong * item.donGia,
          })),
        },
      },
      include: hoaDonInclude,
    });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function layDanhSachHoaDon(user: JwtPayload, query: HoaDonQuery) {
  const ngayBan: Prisma.DateTimeFilter | undefined = query.tu || query.den
    ? {
        ...(query.tu ? { gte: new Date(`${query.tu}T00:00:00.000`) } : {}),
        ...(query.den ? { lte: new Date(`${query.den}T23:59:59.999`) } : {}),
      }
    : undefined;

  const where: Prisma.HoaDonWhereInput = {
    ...(user.vaiTro === 'admin' ? {} : { nguoiBanId: user.id }),
    ...(ngayBan ? { ngayBan } : {}),
  };

  return prisma.hoaDon.findMany({
    where,
    orderBy: { ngayBan: 'desc' },
    select: {
      id: true,
      nguoiBanId: true,
      khachHangId: true,
      ngayBan: true,
      tongTien: true,
      giamGia: true,
      hinhThucTT: true,
      trangThaiTT: true,
      nguoiBan: { select: { id: true, hoTen: true } },
      khachHang: { select: { id: true, ten: true, sdt: true } },
    },
  });
}

export async function layHoaDonTheoId(id: number, user: JwtPayload) {
  const hoaDon = await prisma.hoaDon.findUnique({
    where: { id },
    include: hoaDonInclude,
  });

  if (!hoaDon) return null;
  if (user.vaiTro !== 'admin' && hoaDon.nguoiBanId !== user.id) {
    throw new HoaDonServiceError('Bạn không có quyền xem hóa đơn này', 403);
  }

  return hoaDon;
}
