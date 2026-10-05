import { z } from 'zod';
import prisma from '../config/database';

export const taoKiemKeSchema = z.object({
  ghiChu: z.string().trim().max(1000).optional(),
  chiTiet: z
    .array(
      z.object({
        bienTheId: z.coerce.number().int().positive(),
        soLuongThucTe: z.number().int().min(0),
        nguyenNhanChenhLech: z.string().trim().max(255).optional(),
      })
    )
    .min(1, 'Cần ít nhất 1 biến thể để kiểm kê'),
});

export type TaoKiemKeInput = z.infer<typeof taoKiemKeSchema>;

async function dongBoLoSauKiemKe(tx: any, bienTheId: number, chenhLech: number, phieuId: number, giaNhap: number) {
  if (chenhLech === 0) return;
  if (chenhLech > 0) {
    await tx.loHang.create({ data: {
      bienTheId, maLo: `KIEM-KE-${phieuId}-${bienTheId}`, ngayNhap: new Date(),
      soLuongNhap: chenhLech, soLuongCon: chenhLech, giaNhap, trangThai: 'DANG_BAN',
    } });
    return;
  }

  const lots = await tx.loHang.findMany({ where: { bienTheId, soLuongCon: { gt: 0 } } });
  lots.sort((a: any, b: any) => {
    const expiryA = a.hanSuDung ? new Date(a.hanSuDung).valueOf() : Number.MAX_SAFE_INTEGER;
    const expiryB = b.hanSuDung ? new Date(b.hanSuDung).valueOf() : Number.MAX_SAFE_INTEGER;
    return expiryA - expiryB || new Date(a.ngayNhap).valueOf() - new Date(b.ngayNhap).valueOf();
  });
  let remaining = Math.abs(chenhLech);
  for (const lot of lots) {
    if (!remaining) break;
    const remove = Math.min(remaining, lot.soLuongCon);
    await tx.loHang.update({ where: { id: lot.id }, data: { soLuongCon: { decrement: remove } } });
    remaining -= remove;
  }
  if (remaining) throw new Error('Tồn theo lô không đủ để điều chỉnh; hãy kiểm tra lại dữ liệu kho');
}

export async function taoPhieuKiemKe(nguoiTaoId: number | string, data: TaoKiemKeInput) {
  const ids = data.chiTiet.map((item) => Number(item.bienTheId));
  if (new Set(ids).size !== ids.length) throw new Error('Không được lặp biến thể trong cùng một phiếu');

  return prisma.$transaction(async (tx) => {
    // 1. Tạo phiếu kiểm kê
    const phieuKiemKe = await tx.phieuKiemKe.create({
      data: {
        nguoiTaoId: Number(nguoiTaoId),
        ghiChu: data.ghiChu || null,
        trangThai: 'cho_duyet',
      },
    });

    // 2. Duyệt qua từng dòng kiểm kê
    for (const item of data.chiTiet) {
      const bienTheId = Number(item.bienTheId);
      const bt = await tx.bienThe.findUnique({ where: { id: bienTheId } });
      if (!bt) throw new Error(`Biến thể #${bienTheId} không tồn tại`);

      const soLuongHeThong = bt.soLuongTon;
      const soLuongThucTe = item.soLuongThucTe;
      const nguyenNhanChenhLech = item.nguyenNhanChenhLech?.trim() || null;
      if (soLuongThucTe !== soLuongHeThong && !nguyenNhanChenhLech) {
        throw new Error(`Cần nhập nguyên nhân chênh lệch cho biến thể #${bienTheId}`);
      }
      // Lưu chi tiết kiểm kê
      await tx.chiTietKiemKe.create({
        data: {
          phieuKiemKeId: phieuKiemKe.id,
          bienTheId,
          soLuongHeThong,
          soLuongThucTe,
          nguyenNhanChenhLech,
        },
      });

    }

    return tx.phieuKiemKe.findUnique({
      where: { id: phieuKiemKe.id },
      include: {
        nguoiTao: { select: { id: true, hoTen: true, taiKhoan: true } },
        nguoiDuyet: { select: { id: true, hoTen: true, taiKhoan: true } },
        chiTiets: {
          include: {
            bienThe: {
              include: { sanPham: { select: { id: true, ten: true, danhMuc: true } } },
            },
          },
        },
      },
    });
  });
}

export async function layDanhSachKiemKe(trangThai?: string) {
  const rows = await prisma.phieuKiemKe.findMany({
    where: trangThai ? { trangThai } : undefined,
    include: {
      nguoiTao: { select: { id: true, hoTen: true, taiKhoan: true } },
      nguoiDuyet: { select: { id: true, hoTen: true, taiKhoan: true } },
      chiTiets: {
        include: {
          bienThe: {
            include: { sanPham: { select: { id: true, ten: true, danhMuc: true } } },
          },
        },
      },
    },
    orderBy: { ngayKiemKe: 'desc' },
  });
  return rows.map((p) => ({
    ...p,
    tenNguoiTao: p.nguoiTao.hoTen,
    tongSoMatHang: p.chiTiets.length,
    soMatHangLech: p.chiTiets.filter((ct) => ct.soLuongThucTe !== ct.soLuongHeThong).length,
  }));
}

export async function layPhieuCuaToi(nguoiTaoId: number | string) {
  return prisma.phieuKiemKe.findMany({
    where: { nguoiTaoId: Number(nguoiTaoId) },
    select: { id: true, ngayKiemKe: true, ghiChu: true, trangThai: true, lyDoTuChoi: true,
      nguoiDuyet: { select: { id: true, hoTen: true, taiKhoan: true } },
      _count: { select: { chiTiets: true } } },
    orderBy: { ngayKiemKe: 'desc' },
  });
}

export async function layNguonKiemKe() {
  const rows = await prisma.bienThe.findMany({
    where: { trangThai: true },
    select: { id: true, giaTri: true, donVi: true, soLuongTon: true,
      sanPham: { select: { id: true, ten: true, danhMuc: true } } },
    orderBy: [{ sanPham: { ten: 'asc' } }, { giaTri: 'asc' }],
  });
  return rows.map((bt) => ({ id: bt.id, tenSanPham: bt.sanPham.ten, giaTri: bt.giaTri, donVi: bt.donVi, danhMuc: bt.sanPham.danhMuc, soLuongTon: bt.soLuongTon }));
}

export async function duyetPhieu(id: number | string, nguoiDuyetId: number | string) {
  return prisma.$transaction(async (tx) => {
    const phieu = await tx.phieuKiemKe.findUnique({ where: { id: Number(id) }, include: { chiTiets: true } });
    if (!phieu) throw new Error('NOT_FOUND');
    if (phieu.trangThai !== 'cho_duyet') throw new Error('Phiếu đã được xử lý, không thể duyệt lại');
    const unexplained = phieu.chiTiets.find((ct) =>
      ct.soLuongThucTe !== ct.soLuongHeThong && !ct.nguyenNhanChenhLech?.trim()
    );
    if (unexplained) {
      throw new Error(`Mặt hàng #${unexplained.bienTheId} có chênh lệch nhưng chưa ghi nguyên nhân; hãy từ chối và tạo lại phiếu.`);
    }
    const claimed = await tx.phieuKiemKe.updateMany({ where: { id: phieu.id, trangThai: 'cho_duyet' }, data: { trangThai: 'da_duyet' } });
    if (claimed.count !== 1) throw new Error('Phiếu đã được xử lý, không thể duyệt lại');
    for (const ct of phieu.chiTiets) {
      const bt = await tx.bienThe.findUnique({ where: { id: ct.bienTheId } });
      if (!bt) throw new Error(`Biến thể #${ct.bienTheId} không tồn tại`);
      const truoc = bt.soLuongTon;
      await dongBoLoSauKiemKe(tx, bt.id, ct.soLuongThucTe - truoc, phieu.id, Number(bt.giaNhap));
      await tx.bienThe.update({ where: { id: bt.id }, data: { soLuongTon: ct.soLuongThucTe } });
      await tx.giaoDichKho.create({ data: { bienTheId: bt.id, loaiGiaoDich: 'kiem_ke', soLuongThayDoi: ct.soLuongThucTe - truoc,
        soLuongTruoc: truoc, soLuongSau: ct.soLuongThucTe, thamChieuLoai: 'PhieuKiemKe', thamChieuId: phieu.id,
        nguoiThucHienId: Number(nguoiDuyetId), ghiChu: ct.nguyenNhanChenhLech
          ? `Duyệt kiểm kê #${phieu.id}: ${ct.nguyenNhanChenhLech}`
          : `Duyệt kiểm kê #${phieu.id}` } });
    }
    return tx.phieuKiemKe.update({ where: { id: phieu.id }, data: { nguoiDuyetId: Number(nguoiDuyetId), ngayDuyet: new Date() }, include: { nguoiTao: { select: { id: true, hoTen: true, taiKhoan: true } }, nguoiDuyet: { select: { id: true, hoTen: true, taiKhoan: true } }, chiTiets: { include: { bienThe: { include: { sanPham: true } } } } } });
  });
}

export async function tuChoiPhieu(id: number | string, nguoiDuyetId: number | string, lyDoTuChoi: string) {
  const phieu = await prisma.phieuKiemKe.findUnique({ where: { id: Number(id) } });
  if (!phieu) throw new Error('NOT_FOUND');
  if (phieu.trangThai !== 'cho_duyet') throw new Error('Phiếu đã được xử lý, không thể từ chối lại');
  const claimed = await prisma.phieuKiemKe.updateMany({ where: { id: phieu.id, trangThai: 'cho_duyet' }, data: { trangThai: 'tu_choi', nguoiDuyetId: Number(nguoiDuyetId), ngayDuyet: new Date(), lyDoTuChoi } });
  if (claimed.count !== 1) throw new Error('Phiếu đã được xử lý, không thể từ chối lại');
  return prisma.phieuKiemKe.findUnique({ where: { id: phieu.id }, include: { nguoiTao: { select: { id: true, hoTen: true, taiKhoan: true } }, nguoiDuyet: { select: { id: true, hoTen: true, taiKhoan: true } }, chiTiets: { include: { bienThe: { include: { sanPham: true } } } } } });
}

export async function layChiTietKiemKe(id: number | string) {
  const phieu = await prisma.phieuKiemKe.findUnique({
    where: { id: Number(id) },
    include: {
      nguoiTao: { select: { id: true, hoTen: true, taiKhoan: true } },
      nguoiDuyet: { select: { id: true, hoTen: true, taiKhoan: true } },
      chiTiets: {
        include: {
          bienThe: {
            include: { sanPham: { select: { id: true, ten: true, danhMuc: true } } },
          },
        },
      },
    },
  });
  if (!phieu) return null;
  return { ...phieu, chiTiets: phieu.chiTiets.map((ct) => ({ ...ct,
    tenSanPham: ct.bienThe.sanPham.ten, giaTri: ct.bienThe.giaTri, donVi: ct.bienThe.donVi,
    danhMuc: ct.bienThe.sanPham.danhMuc, chenhLech: ct.soLuongThucTe - ct.soLuongHeThong })) };
}
