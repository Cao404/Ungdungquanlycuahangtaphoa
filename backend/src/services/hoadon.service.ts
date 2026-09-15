import { z } from 'zod';
import prisma from '../config/database';
import { TaoHoaDonBody } from '../types/business.types';

export const chiTietSchema = z.object({
  bienTheId: z.string().min(1),
  soLuong: z.number().int().positive(),
  donGia: z.number().positive(),
});

export const taoHoaDonSchema = z.object({
  khachHangId: z.string().optional(),
  giamGia: z.number().min(0).optional(),
  hinhThucTT: z.enum(['tienmat', 'chuyenkhoan', 'congno']).optional(),
  trangThaiTT: z.enum(['daTT', 'chuaTT']).optional(),
  chiTiet: z.array(chiTietSchema).min(1, 'Phải có ít nhất 1 sản phẩm'),
});

/**
 * Tạo hoá đơn trong 1 transaction:
 * 1. Kiểm tra tồn kho từng biến thể
 * 2. Trừ tồn kho
 * 3. Tạo HoaDon + ChiTietHoaDon
 */
export async function taoHoaDon(nguoiBanId: string | number, body: TaoHoaDonBody) {
  return prisma.$transaction(async (tx) => {
    // Bước 1: Kiểm tra tồn kho và lưu snapshot số lượng trước/sau
    const snapshot: { btId: number; soLuong: number; donGia: number; soLuongTruoc: number; soLuongSau: number }[] = [];
    for (const dong of body.chiTiet) {
      const btId = Number(dong.bienTheId);
      const bt = await tx.bienThe.findUnique({ where: { id: btId } });
      if (!bt) throw new Error(`Biến thể #${dong.bienTheId} không tồn tại`);
      if (bt.soLuongTon < dong.soLuong) {
        const tenBT = `${bt.giaTri} ${bt.donVi}`;
        throw new Error(`"${tenBT}" chỉ còn ${bt.soLuongTon}, không đủ ${dong.soLuong}`);
      }
      snapshot.push({
        btId,
        soLuong: dong.soLuong,
        donGia: dong.donGia,
        soLuongTruoc: bt.soLuongTon,
        soLuongSau: bt.soLuongTon - dong.soLuong,
      });
    }

    // Bước 2: Trừ tồn kho
    for (const item of snapshot) {
      await tx.bienThe.update({
        where: { id: item.btId },
        data: { soLuongTon: item.soLuongSau },
      });
    }

    const tongTien = body.chiTiet.reduce((s, d) => s + d.soLuong * d.donGia, 0);

    // Bước 3: Tạo HoaDon và ChiTietHoaDon
    const hoaDon = await tx.hoaDon.create({
      data: {
        nguoiBanId: Number(nguoiBanId),
        khachHangId: body.khachHangId ? Number(body.khachHangId) : null,
        giamGia: body.giamGia ?? 0,
        hinhThucTT: body.hinhThucTT ?? 'tienmat',
        trangThaiTT: body.trangThaiTT ?? 'daTT',
        tongTien,
        chiTiets: {
          create: body.chiTiet.map((d) => ({
            bienTheId: Number(d.bienTheId),
            soLuong: d.soLuong,
            donGia: d.donGia,          // lưu cứng giá tại thời điểm bán
            thanhTien: d.soLuong * d.donGia,
          })),
        },
      },
      include: { chiTiets: true },
    });

    // Bước 4: Tạo bản ghi GiaoDichKho (loaiGiaoDich='ban_hang', soLuongThayDoi=-soLuong)
    for (const item of snapshot) {
      await tx.giaoDichKho.create({
        data: {
          bienTheId: item.btId,
          loaiGiaoDich: 'ban_hang',
          soLuongThayDoi: -item.soLuong,
          soLuongTruoc: item.soLuongTruoc,
          soLuongSau: item.soLuongSau,
          thamChieuLoai: 'HoaDon',
          thamChieuId: hoaDon.id,
          nguoiThucHienId: Number(nguoiBanId),
          ghiChu: `Bán hàng qua hoá đơn #${hoaDon.id}`,
        },
      });
    }

    return hoaDon;
  });
}

export async function layDanhSachHoaDon() {
  return prisma.hoaDon.findMany({
    include: { nguoiBan: { select: { hoTen: true } }, khachHang: true },
    orderBy: { ngayBan: 'desc' },
  });
}

export async function layHoaDonTheoId(id: string | number) {
  return prisma.hoaDon.findUnique({
    where: { id: Number(id) },
    include: {
      nguoiBan: { select: { hoTen: true } },
      khachHang: true,
      chiTiets: { include: { bienThe: { include: { sanPham: true } } } },
    },
  });
}
