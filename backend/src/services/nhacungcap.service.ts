import { Prisma } from '@prisma/client';
import { z } from 'zod';
import prisma from '../config/database';

export const traNoNhaCungCapSchema = z.object({
  soTien: z.coerce.number().int().positive('Số tiền trả phải lớn hơn 0'),
  hinhThucTT: z.enum(['tienmat', 'chuyenkhoan']),
  ghiChu: z.string().trim().max(500).optional(),
});
const overdueBefore = () => { const date = new Date(); date.setDate(date.getDate() - 30); return date; };
const debtOf = (row: { tongTien: unknown; soTienDaThanhToan: unknown }) => Math.max(0, Number(row.tongTien) - Number(row.soTienDaThanhToan));

export async function layDanhSachNhaCungCap(q = '') {
  const rows = await prisma.nhaCungCap.findMany({ where: q ? { OR: [{ ten: { contains: q } }, { sdt: { contains: q } }] } : undefined, include: { phieuNhaps: { where: { trangThai: 'CONFIRMED' }, select: { tongTien: true, soTienDaThanhToan: true, ngayNhap: true } } }, orderBy: { ten: 'asc' }, take: 50 });
  const limit = overdueBefore();
  return rows.map(({ phieuNhaps, ...supplier }) => ({ ...supplier, tongDaNhap: phieuNhaps.reduce((sum, row) => sum + Number(row.tongTien), 0), tongNo: phieuNhaps.reduce((sum, row) => sum + debtOf(row), 0), noQuaHan: phieuNhaps.filter((row) => row.ngayNhap < limit).reduce((sum, row) => sum + debtOf(row), 0), soPhieuNo: phieuNhaps.filter((row) => debtOf(row) > 0).length }));
}

export async function layChiTietCongNoNhaCungCap(id: string | number) {
  const supplier = await prisma.nhaCungCap.findUnique({ where: { id: Number(id) }, include: { phieuNhaps: { where: { trangThai: 'CONFIRMED' }, orderBy: { ngayNhap: 'desc' }, select: { id: true, ngayNhap: true, tongTien: true, soTienDaThanhToan: true, trangThaiTT: true } }, traCongNos: { orderBy: { ngayTra: 'desc' }, include: { nguoiTra: { select: { hoTen: true } }, phanBos: { select: { phieuNhapId: true, soTien: true } } } } } });
  if (!supplier) throw new Error('NOT_FOUND');
  const limit = overdueBefore();
  const phieuNhaps = supplier.phieuNhaps.map((row) => ({ ...row, tongTien: Number(row.tongTien), soTienDaThanhToan: Number(row.soTienDaThanhToan), conNo: debtOf(row), quaHan: row.ngayNhap < limit && debtOf(row) > 0 }));
  return { nhaCungCap: { id: supplier.id, ten: supplier.ten, sdt: supplier.sdt, diaChi: supplier.diaChi }, tongNo: phieuNhaps.reduce((sum, row) => sum + row.conNo, 0), noQuaHan: phieuNhaps.filter((row) => row.quaHan).reduce((sum, row) => sum + row.conNo, 0), phieuNhaps, lichSuTra: supplier.traCongNos.map((payment) => ({ ...payment, soTien: Number(payment.soTien), phanBos: payment.phanBos.map((item) => ({ ...item, soTien: Number(item.soTien) })) })) };
}

export async function traCongNoNhaCungCap(id: string | number, nguoiTraId: string | number, input: z.infer<typeof traNoNhaCungCapSchema>) {
  const supplierId = Number(id);
  await prisma.$transaction(async (tx) => {
    if (!await tx.nhaCungCap.findUnique({ where: { id: supplierId }, select: { id: true } })) throw new Error('NOT_FOUND');
    const receipts = await tx.phieuNhap.findMany({ where: { nhaCungCapId: supplierId, trangThai: 'CONFIRMED' }, select: { id: true, tongTien: true, soTienDaThanhToan: true }, orderBy: { ngayNhap: 'asc' } });
    const open = receipts.filter((row) => debtOf(row) > 0);
    const totalDebt = open.reduce((sum, row) => sum + debtOf(row), 0);
    if (!totalDebt) throw new Error('Nhà cung cấp hiện không còn công nợ');
    if (input.soTien > totalDebt) throw new Error(`Số tiền trả không được vượt quá ${totalDebt.toLocaleString('vi-VN')}đ còn nợ`);
    const payment = await tx.traCongNoNhaCungCap.create({ data: { nhaCungCapId: supplierId, nguoiTraId: Number(nguoiTraId), soTien: input.soTien, hinhThucTT: input.hinhThucTT, ghiChu: input.ghiChu?.trim() || null } });
    let remaining = input.soTien;
    for (const row of open) { if (!remaining) break; const current = Number(row.soTienDaThanhToan); const total = Number(row.tongTien); const applied = Math.min(remaining, total - current); const paid = current + applied; await tx.phanBoTraCongNoNhaCungCap.create({ data: { traCongNoId: payment.id, phieuNhapId: row.id, soTien: applied } }); await tx.phieuNhap.update({ where: { id: row.id }, data: { soTienDaThanhToan: paid, trangThaiTT: paid >= total ? 'daTT' : 'chuaTT' } }); remaining -= applied; }
    await tx.nhatKyHeThong.create({ data: { userId: Number(nguoiTraId), hanhDong: 'PAY_SUPPLIER_DEBT', trangThai: 'SUCCESS', doiTuong: 'NhaCungCap', doiTuongId: String(supplierId), metadata: JSON.stringify(input) } });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  return layChiTietCongNoNhaCungCap(supplierId);
}
