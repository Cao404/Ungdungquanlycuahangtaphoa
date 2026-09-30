import prisma from '../config/database';

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const endOfDay = (date: Date) => { const value = startOfDay(date); value.setDate(value.getDate() + 1); return value; };

export function dashboardRange(from?: string, to?: string) {
  const today = startOfDay(new Date());
  const start = from ? startOfDay(new Date(`${from}T00:00:00`)) : today;
  const end = to ? endOfDay(new Date(`${to}T00:00:00`)) : endOfDay(today);
  if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf()) || start >= end) throw new Error('Khoảng thời gian không hợp lệ');
  return { start, end };
}

export async function layTongQuanDashboard(from?: string, to?: string) {
  const { start, end } = dashboardRange(from, to);
  const range = { gte: start, lt: end };
  const today = startOfDay(new Date());
  const expiryLimit = new Date(today); expiryLimit.setDate(expiryLimit.getDate() + 30);
  const [doanhThu, soHoaDon, soSanPham, bienThes, soPhieuNhap, tienNhap, soKhachHang, soNhanVien, hoaDons, loCanhBaos, hoaDonCongNos, phieuNhapCongNos] = await prisma.$transaction([
    prisma.hoaDon.aggregate({ where: { ngayBan: range }, _sum: { tongTien: true } }),
    prisma.hoaDon.count({ where: { ngayBan: range } }),
    prisma.sanPham.count(),
    prisma.bienThe.findMany({ select: { soLuongTon: true, nguongCanhBao: true, giaNhap: true } }),
    prisma.phieuNhap.count({ where: { ngayNhap: range, trangThai: 'CONFIRMED' } }),
    prisma.phieuNhap.aggregate({ where: { ngayNhap: range, trangThai: 'CONFIRMED' }, _sum: { tongTien: true } }),
    prisma.khachHang.count(),
    prisma.nguoiDung.count({ where: { trangThai: true } }),
    prisma.hoaDon.findMany({ where: { ngayBan: range }, select: { ngayBan: true, tongTien: true }, orderBy: { ngayBan: 'asc' } }),
    prisma.loHang.findMany({
      where: { soLuongCon: { gt: 0 }, trangThai: 'DANG_BAN', hanSuDung: { not: null, lte: expiryLimit } },
      include: { bienThe: { include: { sanPham: { select: { ten: true } } } } },
      orderBy: { hanSuDung: 'asc' },
    }),
    prisma.hoaDon.findMany({ where: { hinhThucTT: 'congno' }, select: { khachHangId: true, ngayBan: true, tongTien: true, soTienDaThanhToan: true } }),
    prisma.phieuNhap.findMany({ where: { trangThai: 'CONFIRMED' }, select: { nhaCungCapId: true, ngayNhap: true, tongTien: true, soTienDaThanhToan: true } }),
  ]);
  const days = Math.min(Math.max(Math.ceil((end.valueOf() - start.valueOf()) / 86_400_000), 1), 31);
  const doanhThuTheoNgay = Array.from({ length: days }, (_, index) => {
    const date = new Date(start); date.setDate(date.getDate() + index);
    const next = endOfDay(date);
    return { date: date.toISOString().slice(0, 10), total: hoaDons.filter((item) => item.ngayBan >= date && item.ngayBan < next).reduce((sum, item) => sum + Number(item.tongTien), 0) };
  });
  const debts = hoaDonCongNos.map((invoice) => ({ ...invoice, conNo: Math.max(0, Number(invoice.tongTien) - Number(invoice.soTienDaThanhToan)) })).filter((invoice) => invoice.conNo > 0);
  const supplierDebts = phieuNhapCongNos.map((receipt) => ({ ...receipt, conNo: Math.max(0, Number(receipt.tongTien) - Number(receipt.soTienDaThanhToan)) })).filter((receipt) => receipt.conNo > 0);
  const overdueLimit = new Date(today); overdueLimit.setDate(overdueLimit.getDate() - 30);
  return {
    tuNgay: start.toISOString().slice(0, 10), denNgay: new Date(end.valueOf() - 1).toISOString().slice(0, 10),
    doanhThu: Number(doanhThu._sum.tongTien ?? 0), soHoaDon, soSanPham,
    sapHetHang: bienThes.filter((item) => item.soLuongTon > 0 && item.soLuongTon <= item.nguongCanhBao).length,
    hetHang: bienThes.filter((item) => item.soLuongTon === 0).length,
    soPhieuNhap, tienNhap: Number(tienNhap._sum.tongTien ?? 0), soKhachHang, soNhanVien,
    giaTriTonKho: bienThes.reduce((sum, item) => sum + item.soLuongTon * Number(item.giaNhap), 0), doanhThuTheoNgay,
    loHetHan: loCanhBaos.filter((item) => item.hanSuDung && item.hanSuDung < today).length,
    loSapHetHan: loCanhBaos.filter((item) => item.hanSuDung && item.hanSuDung >= today).length,
    hangCanXuLy: loCanhBaos.slice(0, 20).map((item) => ({
      loHangId: item.id, tenSanPham: item.bienThe.sanPham.ten,
      quyCach: `${Number(item.bienThe.giaTri)} ${item.bienThe.donVi}`,
      maLo: item.maLo, hanSuDung: item.hanSuDung?.toISOString().slice(0, 10), soLuongCon: item.soLuongCon,
      daHetHan: Boolean(item.hanSuDung && item.hanSuDung < today),
    })),
    tongCongNo: debts.reduce((sum, invoice) => sum + invoice.conNo, 0),
    noQuaHan: debts.filter((invoice) => invoice.ngayBan < overdueLimit).reduce((sum, invoice) => sum + invoice.conNo, 0),
    soKhachDangNo: new Set(debts.map((invoice) => invoice.khachHangId).filter(Boolean)).size,
    tongNoNhaCungCap: supplierDebts.reduce((sum, receipt) => sum + receipt.conNo, 0),
    noNhaCungCapQuaHan: supplierDebts.filter((receipt) => receipt.ngayNhap < overdueLimit).reduce((sum, receipt) => sum + receipt.conNo, 0),
    soNhaCungCapDangNo: new Set(supplierDebts.map((receipt) => receipt.nhaCungCapId)).size,
  };
}
