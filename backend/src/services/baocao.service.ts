import prisma from '../config/database';

// Báo cáo doanh thu theo khoảng thời gian
export async function doanhThu(tu: string, den: string) {
  const denNgay = new Date(`${den}T00:00:00`);
  denNgay.setDate(denNgay.getDate() + 1);
  const hoaDons = await prisma.hoaDon.findMany({
    where: {
      ngayBan: { gte: new Date(`${tu}T00:00:00`), lt: denNgay },
      trangThaiTT: 'daTT',
    },
    select: { tongTien: true, ngayBan: true },
  });

  // tongTien đã là tạm tính - giảm giá + thuế, không trừ giảm giá lần hai.
  const tong = hoaDons.reduce((s, h) => s + Number(h.tongTien), 0);
  return { tuNgay: tu, denNgay: den, soHoaDon: hoaDons.length, tongDoanhThu: tong };
}

// Top sản phẩm bán chạy theo khoảng thời gian
export async function banChay(tu: string, den: string) {
  const denNgay = new Date(`${den}T00:00:00`);
  denNgay.setDate(denNgay.getDate() + 1);
  const chiTiets = await prisma.chiTietHoaDon.groupBy({
    by: ['bienTheId'],
    where: { hoaDon: { ngayBan: { gte: new Date(`${tu}T00:00:00`), lt: denNgay } } },
    _sum: { soLuong: true, thanhTien: true },
    orderBy: { _sum: { soLuong: 'desc' } },
    take: 20,
  });

  // Lấy thông tin biến thể + sản phẩm để trả về tên
  const result = await Promise.all(
    chiTiets.map(async (item) => {
      const bt = await prisma.bienThe.findUnique({
        where: { id: item.bienTheId },
        include: { sanPham: { select: { ten: true } } },
      });
      return {
        bienTheId: item.bienTheId,
        tenSanPham: bt?.sanPham.ten,
        tenBienThe: bt ? `${bt.giaTri} ${bt.donVi}` : undefined,
        tongSoLuong: item._sum.soLuong,
        tongDoanhThu: item._sum.thanhTien,
      };
    })
  );

  return result;
}
