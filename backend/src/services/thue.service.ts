import prisma from '../config/database';

const start = (value: string) => new Date(`${value}T00:00:00`);
const end = (value: string) => { const date = start(value); date.setDate(date.getDate() + 1); return date; };

export async function layTongQuanThue(tu: string, den: string) {
  const tuNgay = start(tu); const denNgay = end(den);
  if (Number.isNaN(tuNgay.valueOf()) || Number.isNaN(denNgay.valueOf()) || tuNgay >= denNgay) throw new Error('Khoảng thời gian không hợp lệ');
  const [configs, invoices] = await prisma.$transaction([
    prisma.cauHinhThue.findMany({ orderBy: { hieuLucTu: 'desc' } }),
    prisma.hoaDon.findMany({ where: { ngayBan: { gte: tuNgay, lt: denNgay }, trangThaiTT: 'daTT' }, select: { tongTien: true } }),
  ]);
  const active = configs.find((config) => config.trangThai && config.hieuLucTu <= denNgay && (!config.hieuLucDen || config.hieuLucDen >= tuNgay)) ?? null;
  const doanhThu = invoices.reduce((sum, invoice) => sum + Number(invoice.tongTien), 0);
  const duDieuKien = Boolean(active && doanhThu >= Number(active.nguongDoanhThu));
  return { tu, den, doanhThu, soHoaDon: invoices.length, cauHinhApDung: active, doanhThuTinhThue: duDieuKien ? doanhThu : 0, thuePhaiNop: duDieuKien && active ? doanhThu * Number(active.tyLe) / 100 : 0, thongBao: !active ? 'Chưa có cấu hình thuế hiệu lực cho kỳ đã chọn.' : duDieuKien ? 'Doanh thu đạt ngưỡng, hệ thống đã tính nghĩa vụ thuế theo cấu hình hiệu lực.' : `Doanh thu chưa đạt ngưỡng ${Number(active.nguongDoanhThu).toLocaleString('vi-VN')}đ.` , cauHinhs: configs };
}
