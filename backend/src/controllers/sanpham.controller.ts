import { RequestHandler } from 'express';
import prisma from '../config/database';
import { crudFactory } from '../utils/crudFactory';
import { ok, created, serverError, notFound, badRequest } from '../utils/response';

// CRUD cho SanPham (dùng crudFactory cho createOne, updateOne)
// Override getAll và getOne để include BienThe
export const getAll: RequestHandler = async (_req, res) => {
  try {
    const data = await prisma.sanPham.findMany({
      include: { bienThes: true },
      orderBy: { createdAt: 'desc' },
    });
    ok(res, data);
  } catch (e) { serverError(res, e); }
};

export const getOne: RequestHandler = async (req, res) => {
  try {
    const data = await prisma.sanPham.findUnique({
      where: { id: Number(req.params.id) },
      include: { bienThes: true },
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
      return badRequest(
        res,
        'Không thể xóa sản phẩm này vì đã có lịch sử hóa đơn bán hàng hoặc phiếu nhập liên quan.'
      );
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
      bienTheCreate = {
        create: bienThes.map((bt: any) => ({
          giaTri: bt.giaTri !== undefined ? bt.giaTri : 0,
          donVi: bt.donVi || 'Cái',
          giaNhap: Number(bt.giaNhap) || 0,
          giaBan: Number(bt.giaBan) || 0,
          soLuongTon: 0, // BẮT BUỘC BỎ QUA, LUÔN = 0
          nguongCanhBao: Number(bt.nguongCanhBao) || 5,
          trangThai: bt.trangThai !== undefined ? Boolean(bt.trangThai) : true,
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
