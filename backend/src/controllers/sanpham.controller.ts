import { RequestHandler } from 'express';
import prisma from '../config/database';
import { crudFactory } from '../utils/crudFactory';
import { ok, created, serverError, notFound, badRequest, conflict } from '../utils/response';
import { layNguonKiemKe } from '../services/kiemke.service';
import { BarcodeValidationError, isUniqueConstraintError, normalizeBarcode } from '../utils/barcode';

export const getKiemKeSource: RequestHandler = async (_req, res) => {
  try { ok(res, await layNguonKiemKe()); } catch (e) { serverError(res, e); }
};

// CRUD cho SanPham (dùng crudFactory cho createOne, updateOne)
// Override getAll và getOne để include BienThe
export const getAll: RequestHandler = async (req, res) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const danhMuc = typeof req.query.danhMuc === 'string' ? req.query.danhMuc.trim() : '';
    const data = await prisma.sanPham.findMany({
      where: {
        bienThes: { some: { trangThai: true } },
        ...(q ? { OR: [{ ten: { contains: q } }, { thuongHieu: { contains: q } }, { bienThes: { some: { barcode: { contains: q }, trangThai: true } } }] } : {}),
        ...(danhMuc ? { danhMuc } : {}),
      },
      include: { bienThes: { where: { trangThai: true } } },
      orderBy: { createdAt: 'desc' },
    });
    ok(res, data);
  } catch (e) { serverError(res, e); }
};

export const getCategories: RequestHandler = async (_req, res) => {
  try {
    const rows = await prisma.sanPham.findMany({ distinct: ['danhMuc'], select: { danhMuc: true }, orderBy: { danhMuc: 'asc' } });
    ok(res, rows.map((row) => row.danhMuc));
  } catch (e) { serverError(res, e); }
};

export const getByBarcode: RequestHandler = async (req, res) => {
  try {
    const barcode = decodeURIComponent(req.params.barcode).trim();
    if (!barcode) return badRequest(res, 'Mã vạch không hợp lệ');
    const bienThe = await prisma.bienThe.findFirst({
      where: { barcode, trangThai: true }, include: { sanPham: true },
    });
    if (!bienThe) return notFound(res, 'Không tìm thấy sản phẩm theo mã vạch');
    ok(res, { ...bienThe, tenBienThe: `${bienThe.giaTri} ${bienThe.donVi}`, donViTinh: bienThe.donVi });
  } catch (e) { serverError(res, e); }
};

export const getOne: RequestHandler = async (req, res) => {
  try {
    const data = await prisma.sanPham.findUnique({
      where: { id: Number(req.params.id) },
      include: { bienThes: { where: { trangThai: true } } },
    });
    if (!data) return notFound(res, 'Sản phẩm không tồn tại');
    ok(res, data);
  } catch (e) { serverError(res, e); }
};

// Xóa sản phẩm: Xóa toàn bộ biến thể con trước (hoặc chặn nếu đã có hóa đơn/phiếu nhập)
export const deleteOne: RequestHandler = async (req, res) => {
  const id = Number(req.params.id);
  try {
    const sanPham = await prisma.sanPham.findUnique({
      where: { id },
      include: {
        bienThes: {
          select: {
            id: true,
            chiTietHoaDons: { select: { id: true }, take: 1 },
            chiTietPhieuNhaps: { select: { id: true }, take: 1 },
          },
        },
      },
    });

    if (!sanPham) return notFound(res, 'Sản phẩm không tồn tại');

    const hasHistory = sanPham.bienThes.some(
      (bt) => bt.chiTietHoaDons.length > 0 || bt.chiTietPhieuNhaps.length > 0
    );

    if (hasHistory) {
      await prisma.bienThe.updateMany({ where: { sanPhamId: id }, data: { trangThai: false } });
      return ok(res, null, 'Sản phẩm đã phát sinh giao dịch nên đã được chuyển sang trạng thái ngừng kinh doanh.');
    }

    await prisma.$transaction(async (tx) => {
      await tx.bienThe.deleteMany({ where: { sanPhamId: id } });
      await tx.sanPham.delete({ where: { id } });
    });

    ok(res, null, 'Xoá sản phẩm thành công');
  } catch (e) {
    serverError(res, e);
  }
};

// Tạo sản phẩm: trường soLuongTon của biến thể PHẢI BỊ BỎ QUA, luôn set cứng = 0
export const createOne: RequestHandler = async (req, res) => {
  try {
    const { bienThes, ten, thuongHieu, danhMuc, moTa, hinhAnh } = req.body;

    let bienTheCreate = undefined;
    if (Array.isArray(bienThes) && bienThes.length > 0) {
      const normalizedBarcodes = bienThes
        .map((bt: any) => normalizeBarcode(bt.barcode))
        .filter((barcode: string | null): barcode is string => Boolean(barcode));
      const duplicateInRequest = normalizedBarcodes.find((barcode, index) => normalizedBarcodes.indexOf(barcode) !== index);
      if (duplicateInRequest) {
        return conflict(res, `Mã vạch ${duplicateInRequest} đang được nhập cho nhiều loại trong cùng sản phẩm.`, 'BARCODE_ALREADY_EXISTS');
      }
      if (normalizedBarcodes.length) {
        const owner = await prisma.bienThe.findFirst({
          where: { barcode: { in: normalizedBarcodes } },
          include: { sanPham: { select: { ten: true } } },
        });
        if (owner?.barcode) {
          return conflict(res, `Mã vạch ${owner.barcode} đã được gán cho sản phẩm ${owner.sanPham.ten} (${owner.giaTri} ${owner.donVi}).`, 'BARCODE_ALREADY_EXISTS');
        }
      }

      bienTheCreate = {
        create: bienThes.map((bt: any) => ({
          giaTri: bt.giaTri !== undefined ? bt.giaTri : 0,
          donVi: bt.donVi || 'Cái',
          giaNhap: Number(bt.giaNhap) || 0,
          giaBan: Number(bt.giaBan) || 0,
          soLuongTon: 0, // BẮT BUỘC BỎ QUA, LUÔN = 0
          nguongCanhBao: Number(bt.nguongCanhBao) || 5,
          trangThai: bt.trangThai !== undefined ? Boolean(bt.trangThai) : true,
          barcode: normalizeBarcode(bt.barcode),
        })),
      };
    }

    const data = await prisma.sanPham.create({
      data: {
        ten,
        thuongHieu: thuongHieu || null,
        danhMuc,
        moTa: moTa || null,
        hinhAnh: hinhAnh || null,
        ...(bienTheCreate ? { bienThes: bienTheCreate } : {}),
      },
      include: { bienThes: true },
    });

    created(res, data);
  } catch (e) {
    if (e instanceof BarcodeValidationError) return badRequest(res, e.message, 'INVALID_BARCODE');
    if (isUniqueConstraintError(e)) return conflict(res, 'Mã vạch đã được sử dụng cho một loại sản phẩm khác.', 'BARCODE_ALREADY_EXISTS');
    serverError(res, e);
  }
};

// Cập nhật thông tin chung của sản phẩm (biến thể cập nhật qua /api/bienthe)
export const updateOne: RequestHandler = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { ten, thuongHieu, danhMuc, moTa, hinhAnh } = req.body;

    const data = await prisma.sanPham.update({
      where: { id },
      data: {
        ...(ten !== undefined && { ten }),
        ...(thuongHieu !== undefined && { thuongHieu }),
        ...(danhMuc !== undefined && { danhMuc }),
        ...(moTa !== undefined && { moTa }),
        ...(hinhAnh !== undefined && { hinhAnh }),
      },
      include: { bienThes: true },
    });

    ok(res, data, 'Cập nhật sản phẩm thành công');
  } catch (e) {
    serverError(res, e);
  }
};
