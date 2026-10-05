import { Prisma } from '@prisma/client';
import { z } from 'zod';
import prisma from '../config/database';

export const thuNoSchema = z.object({
  soTien: z.coerce.number().int().positive('Số tiền thu phải lớn hơn 0'),
  hinhThucTT: z.enum(['tienmat', 'chuyenkhoan']),
  ghiChu: z.string().trim().max(500).optional(),
});

const overdueBefore = () => {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date;
};

const debtOf = (invoice: { tongTien: unknown; soTienDaThanhToan: unknown }) =>
  Math.max(0, Number(invoice.tongTien) - Number(invoice.soTienDaThanhToan));

export async function layDanhSachKhachHang(q = '') {
  const rows = await prisma.khachHang.findMany({
    where: q ? { OR: [{ ten: { contains: q } }, { sdt: { contains: q } }] } : undefined,
    include: { hoaDons: { where: { hinhThucTT: 'congno' }, select: { tongTien: true, soTienDaThanhToan: true, ngayBan: true } } },
    orderBy: { ten: 'asc' }, take: 50,
  });
  const limit = overdueBefore();
  return rows.map(({ hoaDons, ...customer }) => ({
    ...customer,
    tongNo: hoaDons.reduce((sum, invoice) => sum + debtOf(invoice), 0),
    noQuaHan: hoaDons.filter((invoice) => invoice.ngayBan < limit).reduce((sum, invoice) => sum + debtOf(invoice), 0),
    soHoaDonNo: hoaDons.filter((invoice) => debtOf(invoice) > 0).length,
  }));
}

export async function layChiTietCongNo(khachHangId: string | number) {
  const customer = await prisma.khachHang.findUnique({
    where: { id: Number(khachHangId) },
    include: {
      hoaDons: {
        where: { hinhThucTT: 'congno' }, orderBy: { ngayBan: 'desc' },
        select: { id: true, ngayBan: true, tongTien: true, soTienDaThanhToan: true, trangThaiTT: true },
      },
      thuCongNos: {
        orderBy: { ngayThu: 'desc' },
        include: { nguoiThu: { select: { hoTen: true } }, phanBos: { select: { hoaDonId: true, soTien: true } } },
      },
    },
  });
  if (!customer) throw new Error('NOT_FOUND');
  const limit = overdueBefore();
  const hoaDons = customer.hoaDons.map((invoice) => ({
    ...invoice, tongTien: Number(invoice.tongTien), soTienDaThanhToan: Number(invoice.soTienDaThanhToan),
    conNo: debtOf(invoice), quaHan: invoice.ngayBan < limit && debtOf(invoice) > 0,
  }));
  return {
    khachHang: { id: customer.id, ten: customer.ten, sdt: customer.sdt, diaChi: customer.diaChi },
    tongNo: hoaDons.reduce((sum, invoice) => sum + invoice.conNo, 0),
    noQuaHan: hoaDons.filter((invoice) => invoice.quaHan).reduce((sum, invoice) => sum + invoice.conNo, 0),
    hoaDons,
    lichSuThu: customer.thuCongNos.map((payment) => ({
      ...payment, soTien: Number(payment.soTien),
      phanBos: payment.phanBos.map((allocation) => ({ ...allocation, soTien: Number(allocation.soTien) })),
    })),
  };
}

export async function thuCongNo(khachHangId: string | number, nguoiThuId: string | number, input: z.infer<typeof thuNoSchema>) {
  const customerId = Number(khachHangId);
  await prisma.$transaction(async (tx) => {
    const customer = await tx.khachHang.findUnique({ where: { id: customerId }, select: { id: true } });
    if (!customer) throw new Error('NOT_FOUND');
    const invoices = await tx.hoaDon.findMany({
      where: { khachHangId: customerId, hinhThucTT: 'congno' },
      select: { id: true, tongTien: true, soTienDaThanhToan: true }, orderBy: { ngayBan: 'asc' },
    });
    const openInvoices = invoices.filter((invoice) => debtOf(invoice) > 0);
    const totalDebt = openInvoices.reduce((sum, invoice) => sum + debtOf(invoice), 0);
    if (!totalDebt) throw new Error('Khách hàng hiện không còn công nợ');
    if (input.soTien > totalDebt) throw new Error(`Số tiền thu không được vượt quá ${totalDebt.toLocaleString('vi-VN')}đ còn nợ`);

    const payment = await tx.thuCongNo.create({ data: {
      khachHangId: customerId, nguoiThuId: Number(nguoiThuId), soTien: input.soTien,
      hinhThucTT: input.hinhThucTT, ghiChu: input.ghiChu?.trim() || null,
    } });
    let remaining = input.soTien;
    for (const invoice of openInvoices) {
      if (!remaining) break;
      const currentPaid = Number(invoice.soTienDaThanhToan);
      const invoiceTotal = Number(invoice.tongTien);
      const applied = Math.min(remaining, invoiceTotal - currentPaid);
      const newPaid = currentPaid + applied;
      await tx.phanBoThuCongNo.create({ data: { thuCongNoId: payment.id, hoaDonId: invoice.id, soTien: applied } });
      await tx.hoaDon.update({ where: { id: invoice.id }, data: {
        soTienDaThanhToan: newPaid, trangThaiTT: newPaid >= invoiceTotal ? 'daTT' : 'chuaTT',
      } });
      remaining -= applied;
    }
    await tx.nhatKyHeThong.create({ data: {
      userId: Number(nguoiThuId), hanhDong: 'COLLECT_CUSTOMER_DEBT', trangThai: 'SUCCESS',
      doiTuong: 'KhachHang', doiTuongId: String(customerId), metadata: JSON.stringify(input),
    } });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  return layChiTietCongNo(customerId);
}
