import { RequestHandler } from 'express';
import prisma from '../config/database';
import { ok, created, notFound, badRequest, serverError } from '../utils/response';

export const getAll: RequestHandler = async (_req, res) => {
  try {
    const data = await prisma.bienThe.findMany({
      include: {
        sanPham: { select: { id: true, ten: true, danhMuc: true } },
      },
      orderBy: { id: 'desc' },
    });
    ok(res, data);
  } catch (e) {
    serverError(res, e);
  }
};

export const getOne: RequestHandler = async (req, res) => {
  try {
    const data = await prisma.bienThe.findUnique({
      where: { id: Number(req.params.id) },
      include: { sanPham: true },
    });
    if (!data) return notFound(res, 'Biến thể không tồn tại');
    ok(res, data);
  } catch (e) {
    serverError(res, e);
  }
};

// POST /api/bienthe: Tạo mới biến thể, trường soLuongTon luôn set cứng = 0
export const createOne: RequestHandler = async (req, res) => {
  try {
    const { sanPhamId, giaTri, donVi, giaNhap, giaBan, nguongCanhBao, trangThai } = req.body;
    if (!sanPhamId) return badRequest(res, 'sanPhamId là bắt buộc');

    const data = await prisma.bienThe.create({
      data: {
        sanPhamId: Number(sanPhamId),
        giaTri: giaTri !== undefined ? giaTri : 0,
        donVi: donVi || 'Cái',
        giaNhap: Number(giaNhap) || 0,
        giaBan: Number(giaBan) || 0,
        soLuongTon: 0, // BẮT BUỘC BỎ QUA nếu gửi lên, luôn = 0
        nguongCanhBao: Number(nguongCanhBao) || 5,
        trangThai: trangThai !== undefined ? Boolean(trangThai) : true,
      },
    });

    created(res, data);
  } catch (e) {
    serverError(res, e);
  }
};

// PUT /api/bienthe/:id: KHÔNG cho phép sửa soLuongTon trực tiếp
export const updateOne: RequestHandler = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { giaNhap, giaBan, giaTri, donVi, nguongCanhBao, trangThai } = req.body;

    const data = await prisma.bienThe.update({
      where: { id },
      data: {
        ...(giaNhap !== undefined && { giaNhap: Number(giaNhap) }),
        ...(giaBan !== undefined && { giaBan: Number(giaBan) }),
        ...(giaTri !== undefined && { giaTri }),
        ...(donVi !== undefined && { donVi }),
        ...(nguongCanhBao !== undefined && { nguongCanhBao: Number(nguongCanhBao) }),
        ...(trangThai !== undefined && { trangThai: Boolean(trangThai) }),
        // soLuongTon BỊ BỎ QUA HOÀN TOÀN, không cho sửa tay
      },
    });

    ok(res, data, 'Cập nhật biến thể thành công');
  } catch (e) {
    serverError(res, e);
  }
};

export const deleteOne: RequestHandler = async (req, res) => {
  try {
    const id = Number(req.params.id);
    // Kiểm tra xem đã có giao dịch kho hoặc hóa đơn chưa
    const hasHistory = await prisma.giaoDichKho.findFirst({ where: { bienTheId: id } });
    if (hasHistory) {
      return badRequest(res, 'Không thể xóa biến thể đã có lịch sử giao dịch kho');
    }

    await prisma.bienThe.delete({ where: { id } });
    ok(res, null, 'Xoá biến thể thành công');
  } catch (e) {
    serverError(res, e);
  }
};

// GET /api/bienthe/:id/lichsu-kho: Lịch sử giao dịch kho của 1 biến thể
export const getLichSuKho: RequestHandler = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = await prisma.giaoDichKho.findMany({
      where: { bienTheId: id },
      include: {
        nguoiThucHien: {
          select: { id: true, hoTen: true, taiKhoan: true },
        },
      },
      orderBy: { thoiGian: 'desc' },
    });

    ok(res, data);
  } catch (e) {
    serverError(res, e);
  }
};
