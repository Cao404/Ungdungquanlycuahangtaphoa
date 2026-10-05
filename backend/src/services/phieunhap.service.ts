import { z } from 'zod';
import prisma from '../config/database';
import { TaoPhieuNhapBody } from '../types/business.types';

const optionalDate = z.preprocess((value) => value === '' || value == null ? undefined : value, z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày phải có định dạng YYYY-MM-DD').optional());
const receiptLineSchema = z.object({
  bienTheId: z.coerce.number().int().positive(),
  soLuong: z.coerce.number().int().positive(),
  giaNhap: z.coerce.number().min(0),
  maLo: z.string().trim().max(100).optional(),
  ngaySanXuat: optionalDate,
  hanSuDung: optionalDate,
}).superRefine((row, ctx) => {
  if (row.ngaySanXuat && row.hanSuDung && row.ngaySanXuat > row.hanSuDung) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Ngày sản xuất không được sau hạn sử dụng', path: ['ngaySanXuat'] });
  }
});

export const taoPhieuNhapSchema = z.object({
  nhaCungCapId: z.coerce.number().int().positive(),
  ghiChu: z.string().trim().max(2000).optional(),
  hinhThucTT: z.enum(['tienmat', 'chuyenkhoan', 'congno']).default('tienmat'),
  soTienDaThanhToan: z.coerce.number().int().min(0).optional(),
  chiTiet: z.array(receiptLineSchema).min(1),
});
const includeReceipt = { nhaCungCap: true, nguoiTao: { select: { hoTen: true } }, nguoiXacNhan: { select: { hoTen: true } }, chiTiets: { include: { bienThe: { include: { sanPham: true } } } } } as const;
const totalOf = (body: TaoPhieuNhapBody) => body.chiTiet.reduce((sum, row) => sum + row.soLuong * row.giaNhap, 0);
const dateOrNull = (value?: string) => value ? new Date(`${value}T00:00:00`) : null;
const detailData = (row: TaoPhieuNhapBody['chiTiet'][number]) => ({
  bienTheId: Number(row.bienTheId), soLuong: row.soLuong, giaNhap: row.giaNhap,
  maLo: row.maLo?.trim() || null, ngaySanXuat: dateOrNull(row.ngaySanXuat), hanSuDung: dateOrNull(row.hanSuDung),
});
const verifyDetails = async (body: TaoPhieuNhapBody) => {
  const ids = body.chiTiet.map((row) => Number(row.bienTheId));
  if (new Set(ids).size !== ids.length) throw new Error('Không được lặp biến thể trong cùng một phiếu nhập');
  const count = await prisma.bienThe.count({ where: { id: { in: ids } } });
  if (count !== ids.length) throw new Error('Một hoặc nhiều biến thể không tồn tại');
  const today = new Date(); today.setHours(0, 0, 0, 0);
  for (const row of body.chiTiet) {
    const expiry = dateOrNull(row.hanSuDung);
    if (expiry && expiry < today) throw new Error('Không thể nhập lô hàng đã hết hạn');
  }
};

export async function taoPhieuNhap(nguoiTaoId: string | number, body: TaoPhieuNhapBody) {
  await verifyDetails(body);
  const total = totalOf(body);
  const paid = body.hinhThucTT === 'congno' ? Number(body.soTienDaThanhToan || 0) : total;
  if (paid > total) throw new Error('Số tiền đã trả không được vượt quá tổng tiền phiếu nhập');
  return prisma.phieuNhap.create({
    data: { nhaCungCapId: Number(body.nhaCungCapId), nguoiTaoId: Number(nguoiTaoId), ghiChu: body.ghiChu || null, tongTien: total, hinhThucTT: body.hinhThucTT || 'tienmat', soTienDaThanhToan: paid, trangThaiTT: paid >= total ? 'daTT' : 'chuaTT', trangThai: 'DRAFT', chiTiets: { create: body.chiTiet.map(detailData) } },
    include: includeReceipt,
  });
}

export async function capNhatPhieuNhap(id: string | number, body: TaoPhieuNhapBody) {
  await verifyDetails(body);
  return prisma.$transaction(async (tx) => {
    const receipt = await tx.phieuNhap.findUnique({ where: { id: Number(id) } });
    if (!receipt) throw new Error('NOT_FOUND');
    if (receipt.trangThai !== 'DRAFT') throw new Error('Chỉ được sửa phiếu nhập đang ở trạng thái nháp');
    await tx.chiTietPhieuNhap.deleteMany({ where: { phieuNhapId: receipt.id } });
    const total = totalOf(body);
    const paid = body.hinhThucTT === 'congno' ? Number(body.soTienDaThanhToan || 0) : total;
    if (paid > total) throw new Error('Số tiền đã trả không được vượt quá tổng tiền phiếu nhập');
    return tx.phieuNhap.update({ where: { id: receipt.id }, data: { nhaCungCapId: Number(body.nhaCungCapId), ghiChu: body.ghiChu || null, tongTien: total, hinhThucTT: body.hinhThucTT || 'tienmat', soTienDaThanhToan: paid, trangThaiTT: paid >= total ? 'daTT' : 'chuaTT', chiTiets: { create: body.chiTiet.map(detailData) } }, include: includeReceipt });
  });
}

export async function xacNhanPhieuNhap(id: string | number, nguoiXacNhanId: string | number) {
  return prisma.$transaction(async (tx) => {
    const receipt = await tx.phieuNhap.findUnique({ where: { id: Number(id) }, include: { chiTiets: true } });
    if (!receipt) throw new Error('NOT_FOUND');
    if (receipt.trangThai !== 'DRAFT') throw new Error('Phiếu nhập đã được xử lý, không thể xác nhận lại');
    const claim = await tx.phieuNhap.updateMany({ where: { id: receipt.id, trangThai: 'DRAFT' }, data: { trangThai: 'CONFIRMED', nguoiXacNhanId: Number(nguoiXacNhanId), ngayXacNhan: new Date() } });
    if (claim.count !== 1) throw new Error('Phiếu nhập đã được xử lý bởi phiên làm việc khác');
    if (Number(receipt.soTienDaThanhToan) > 0) {
      const payment = await tx.traCongNoNhaCungCap.create({ data: { nhaCungCapId: receipt.nhaCungCapId, nguoiTraId: Number(nguoiXacNhanId), soTien: receipt.soTienDaThanhToan, hinhThucTT: receipt.hinhThucTT === 'congno' ? 'tienmat' : receipt.hinhThucTT, ghiChu: `Thanh toán khi xác nhận phiếu nhập #${receipt.id}` } });
      await tx.phanBoTraCongNoNhaCungCap.create({ data: { traCongNoId: payment.id, phieuNhapId: receipt.id, soTien: receipt.soTienDaThanhToan } });
    }
    for (const row of receipt.chiTiets) {
      const variant = await tx.bienThe.findUnique({ where: { id: row.bienTheId } });
      if (!variant || !variant.trangThai) throw new Error(`Biến thể #${row.bienTheId} không còn hoạt động`);
      const before = variant.soLuongTon;
      const after = before + row.soLuong;
      await tx.bienThe.update({ where: { id: variant.id }, data: { soLuongTon: after, giaNhap: row.giaNhap } });
      await tx.loHang.create({ data: {
        bienTheId: variant.id, chiTietPhieuNhapId: row.id, maLo: row.maLo,
        ngaySanXuat: row.ngaySanXuat, hanSuDung: row.hanSuDung, ngayNhap: receipt.ngayNhap,
        soLuongNhap: row.soLuong, soLuongCon: row.soLuong, giaNhap: row.giaNhap,
      } });
      await tx.giaoDichKho.create({ data: { bienTheId: variant.id, loaiGiaoDich: 'nhap_hang', soLuongThayDoi: row.soLuong, soLuongTruoc: before, soLuongSau: after, thamChieuLoai: 'PhieuNhap', thamChieuId: receipt.id, nguoiThucHienId: Number(nguoiXacNhanId), ghiChu: `Xác nhận phiếu nhập #${receipt.id}` } });
    }
    return tx.phieuNhap.findUniqueOrThrow({ where: { id: receipt.id }, include: includeReceipt });
  });
}

export async function huyPhieuNhap(id: string | number) {
  const result = await prisma.phieuNhap.updateMany({ where: { id: Number(id), trangThai: 'DRAFT' }, data: { trangThai: 'CANCELLED' } });
  if (!result.count) throw new Error('Không thể hủy phiếu đã xác nhận hoặc không tồn tại');
  return prisma.phieuNhap.findUniqueOrThrow({ where: { id: Number(id) }, include: includeReceipt });
}

export const layDanhSachPhieuNhap = () => prisma.phieuNhap.findMany({ include: includeReceipt, orderBy: { ngayNhap: 'desc' } });
export const layChiTietPhieuNhap = (id: string | number) => prisma.phieuNhap.findUnique({ where: { id: Number(id) }, include: includeReceipt });
