import { z } from 'zod';
import prisma from '../config/database';
import { TaoHoaDonBody } from '../types/business.types';

export const chiTietSchema = z.object({
  bienTheId: z.string().regex(/^\d+$/, 'Biến thể không hợp lệ'),
  soLuong: z.number().int().positive(),
  donGia: z.number().positive().optional(),
});

const quoteBaseSchema = z.object({
  khachHangId: z.string().regex(/^\d+$/).optional(),
  giamGia: z.number().min(0).default(0),
  lyDoGiamGia: z.string().trim().max(255).optional(),
  chiTiet: z.array(chiTietSchema).min(1, 'Giỏ hàng đang trống'),
});
const validateDiscountReason = (body: { giamGia?: number; lyDoGiamGia?: string }, ctx: z.RefinementCtx) => {
  if ((body.giamGia ?? 0) > 0 && !body.lyDoGiamGia?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Cần nhập lý do giảm giá', path: ['lyDoGiamGia'] });
};
export const quoteSchema = quoteBaseSchema;

export const taoHoaDonSchema = quoteBaseSchema.extend({
  requestId: z.string().uuid('Mã giao dịch không hợp lệ'),
  giamGia: z.number().min(0).default(0),
  tienKhachDua: z.number().min(0).optional(),
  hinhThucTT: z.enum(['tienmat', 'chuyenkhoan', 'congno']).default('tienmat'),
  trangThaiTT: z.enum(['daTT', 'chuaTT']).default('daTT'),
}).superRefine(validateDiscountReason);

type LotAllocation = { loHangId: number; soLuong: number };
type CheckoutLine = { btId: number; soLuong: number; donGia: number; soLuongTon: number; ten: string; phanBoLos: LotAllocation[] };

function groupLines(body: { chiTiet: { bienTheId: string; soLuong: number }[] }) {
  const grouped = new Map<number, number>();
  for (const line of body.chiTiet) {
    const id = Number(line.bienTheId);
    grouped.set(id, (grouped.get(id) ?? 0) + line.soLuong);
  }
  return grouped;
}

async function resolveLines(client: Pick<typeof prisma, 'bienThe'>, body: { chiTiet: { bienTheId: string; soLuong: number }[] }) {
  const result: CheckoutLine[] = [];
  for (const [btId, soLuong] of groupLines(body)) {
    const variant = await client.bienThe.findUnique({ where: { id: btId }, include: { sanPham: true } });
    if (!variant) throw new Error('Sản phẩm không tồn tại');
    if (!variant.trangThai) throw new Error(`${variant.sanPham.ten} hiện không còn được bán`);
    if (Number(variant.giaBan) <= 0) throw new Error(`${variant.sanPham.ten} chưa có giá bán hợp lệ`);
    if (variant.soLuongTon < soLuong) throw new Error(`${variant.sanPham.ten} chỉ còn ${variant.soLuongTon}, không đủ ${soLuong}`);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const lots = await (client as any).loHang.findMany({ where: { bienTheId: btId, soLuongCon: { gt: 0 }, trangThai: 'DANG_BAN' } });
    const sellableLots = lots
      .filter((lot: any) => !lot.hanSuDung || new Date(lot.hanSuDung) >= today)
      .sort((a: any, b: any) => {
        const expiryA = a.hanSuDung ? new Date(a.hanSuDung).valueOf() : Number.MAX_SAFE_INTEGER;
        const expiryB = b.hanSuDung ? new Date(b.hanSuDung).valueOf() : Number.MAX_SAFE_INTEGER;
        return expiryA - expiryB || new Date(a.ngayNhap).valueOf() - new Date(b.ngayNhap).valueOf();
      });
    const available = sellableLots.reduce((sum: number, lot: any) => sum + lot.soLuongCon, 0);
    if (available < soLuong) {
      const expired = lots.reduce((sum: number, lot: any) => sum + (lot.hanSuDung && new Date(lot.hanSuDung) < today ? lot.soLuongCon : 0), 0);
      throw new Error(`${variant.sanPham.ten} chỉ còn ${available} sản phẩm có thể bán${expired ? `; ${expired} sản phẩm đã hết hạn` : ''}`);
    }
    let remaining = soLuong;
    const phanBoLos: LotAllocation[] = [];
    for (const lot of sellableLots) {
      if (!remaining) break;
      const take = Math.min(remaining, lot.soLuongCon);
      phanBoLos.push({ loHangId: lot.id, soLuong: take });
      remaining -= take;
    }
    result.push({ btId, soLuong, donGia: Number(variant.giaBan), soLuongTon: variant.soLuongTon, ten: variant.sanPham.ten, phanBoLos });
  }
  return result;
}

export async function baoGiaHoaDon(body: { khachHangId?: string; giamGia?: number; lyDoGiamGia?: string; chiTiet: { bienTheId: string; soLuong: number }[] }) {
  if (body.khachHangId) {
    const customer = await prisma.khachHang.findUnique({ where: { id: Number(body.khachHangId) }, select: { id: true, ten: true, sdt: true } });
    if (!customer) throw new Error('Khách hàng không tồn tại');
  }
  const lines = await resolveLines(prisma, body);
  const tamTinh = lines.reduce((sum, line) => sum + line.soLuong * line.donGia, 0);
  // CauHinhThue hiện là thuế nghĩa vụ theo kỳ doanh thu, không phải VAT trên hóa đơn.
  const giamGia = Number(body.giamGia ?? 0);
  if (giamGia > tamTinh) throw new Error('Giảm giá không được lớn hơn tiền hàng');
  const thue = 0;
  return { tamTinh, giamGia, thue, tongTien: tamTinh - giamGia + thue, lines: lines.map(({ phanBoLos: _phanBoLos, ...line }) => line) };
}

export async function taoHoaDon(nguoiBanId: string | number, body: TaoHoaDonBody) {
  const existing = await prisma.hoaDon.findUnique({ where: { requestId: body.requestId }, include: { chiTiets: true } });
  if (existing) {
    if (existing.nguoiBanId !== Number(nguoiBanId)) throw new Error('Mã giao dịch đã được sử dụng');
    return existing;
  }

  return prisma.$transaction(async (tx) => {
    if (body.khachHangId) {
      const customer = await tx.khachHang.findUnique({ where: { id: Number(body.khachHangId) }, select: { id: true } });
      if (!customer) throw new Error('Khách hàng không tồn tại');
    }

    const lines = await resolveLines(tx as any, body);
    const tamTinh = lines.reduce((sum, line) => sum + line.soLuong * line.donGia, 0);
    const giamGia = Number(body.giamGia ?? 0);
    if (giamGia > tamTinh) throw new Error('Giảm giá không được lớn hơn tiền hàng');
    if (giamGia > 0 && !body.lyDoGiamGia?.trim()) throw new Error('Cần nhập lý do giảm giá');
    const thue = 0;
    const tongTien = tamTinh - giamGia + thue;
    if (body.hinhThucTT === 'tienmat' && (body.tienKhachDua === undefined || body.tienKhachDua < tongTien)) {
      throw new Error('Tiền khách đưa chưa đủ để thanh toán');
    }
    const tienThua = body.hinhThucTT === 'tienmat' ? Number(body.tienKhachDua) - tongTien : null;

    const snapshot: { btId: number; soLuong: number; donGia: number; soLuongTruoc: number; soLuongSau: number }[] = [];
    for (const line of lines) {
      for (const allocation of line.phanBoLos) {
        const lotChanged = await tx.loHang.updateMany({
          where: { id: allocation.loHangId, soLuongCon: { gte: allocation.soLuong }, trangThai: 'DANG_BAN' },
          data: { soLuongCon: { decrement: allocation.soLuong } },
        });
        if (lotChanged.count !== 1) throw new Error('Số lượng theo lô vừa thay đổi. Vui lòng thử lại');
      }
      const changed = await tx.bienThe.updateMany({
        where: { id: line.btId, trangThai: true, soLuongTon: { gte: line.soLuong } },
        data: { soLuongTon: { decrement: line.soLuong } },
      });
      if (changed.count !== 1) throw new Error('Tồn kho vừa thay đổi. Vui lòng kiểm tra giỏ hàng và thử lại');
      const after = await tx.bienThe.findUniqueOrThrow({ where: { id: line.btId } });
      snapshot.push({ btId: line.btId, soLuong: line.soLuong, donGia: line.donGia, soLuongTruoc: after.soLuongTon + line.soLuong, soLuongSau: after.soLuongTon });
    }

    const invoice = await tx.hoaDon.create({
      data: {
        requestId: body.requestId, nguoiBanId: Number(nguoiBanId),
        khachHangId: body.khachHangId ? Number(body.khachHangId) : null,
        tamTinh, giamGia, lyDoGiamGia: giamGia > 0 ? body.lyDoGiamGia!.trim() : null, thue, tongTien,
        soTienDaThanhToan: body.hinhThucTT === 'congno' ? 0 : tongTien,
        tienKhachDua: body.hinhThucTT === 'tienmat' ? body.tienKhachDua : null,
        tienThua, hinhThucTT: body.hinhThucTT ?? 'tienmat', trangThaiTT: body.hinhThucTT === 'congno' ? 'chuaTT' : 'daTT',
        chiTiets: { create: snapshot.map((line) => {
          const resolved = lines.find((item) => item.btId === line.btId)!;
          return { bienTheId: line.btId, soLuong: line.soLuong, donGia: line.donGia, thanhTien: line.soLuong * line.donGia, phanBoLos: { create: resolved.phanBoLos.map((lot) => ({ loHangId: lot.loHangId, soLuong: lot.soLuong })) } };
        }) },
      },
      include: { chiTiets: true },
    });

    for (const line of snapshot) {
      await tx.giaoDichKho.create({ data: {
        bienTheId: line.btId, loaiGiaoDich: 'ban_hang', soLuongThayDoi: -line.soLuong,
        soLuongTruoc: line.soLuongTruoc, soLuongSau: line.soLuongSau,
        thamChieuLoai: 'HoaDon', thamChieuId: invoice.id, nguoiThucHienId: Number(nguoiBanId),
        ghiChu: `Bán hàng qua hóa đơn #${invoice.id}`,
      }});
    }
    await tx.nhatKyHeThong.create({ data: {
      userId: Number(nguoiBanId), hanhDong: 'CREATE_INVOICE', trangThai: 'SUCCESS',
      doiTuong: 'HoaDon', doiTuongId: String(invoice.id), metadata: JSON.stringify({ requestId: body.requestId, tongTien, giamGia, lyDoGiamGia: body.lyDoGiamGia, hinhThucTT: body.hinhThucTT }),
    } });
    return invoice;
  });
}

export async function layHoaDonTheoRequestId(requestId: string, nguoiBanId: string | number) {
  return prisma.hoaDon.findFirst({ where: { requestId, nguoiBanId: Number(nguoiBanId) }, include: { chiTiets: true } });
}

export async function layDanhSachHoaDon(nguoiBanId?: string | number, q?: string) {
  const numericId = q && /^\d+$/.test(q) ? Number(q) : undefined;
  return prisma.hoaDon.findMany({
    where: { ...(nguoiBanId ? { nguoiBanId: Number(nguoiBanId) } : {}), ...(numericId ? { id: numericId } : {}) },
    include: { nguoiBan: { select: { hoTen: true } }, khachHang: true }, orderBy: { ngayBan: 'desc' },
  });
}

export async function layHoaDonTheoId(id: string | number) {
  return prisma.hoaDon.findUnique({ where: { id: Number(id) }, include: { nguoiBan: { select: { hoTen: true } }, khachHang: true, chiTiets: { include: { bienThe: { include: { sanPham: true } }, phanBoLos: { include: { loHang: true } } } } } });
}
