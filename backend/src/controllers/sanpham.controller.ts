import { RequestHandler } from 'express';
import prisma from '../config/database';
import { crudFactory } from '../utils/crudFactory';
import { badRequest, ok, serverError, notFound } from '../utils/response';
import { layDanhMucSanPham, layNguonKiemKe, sanPhamQuerySchema, timSanPham } from '../services/sanpham.service';

// CRUD cho SanPham (dùng crudFactory cho getOne, createOne, updateOne, deleteOne)
// Override getAll và getOne để include BienThe
export const getAll: RequestHandler = async (req, res) => {
  const parsed = sanPhamQuerySchema.safeParse(req.query);
  if (!parsed.success) return badRequest(res, parsed.error.errors[0].message);

  try {
    ok(res, await timSanPham(parsed.data));
  } catch (error) {
    serverError(res, error);
  }
};

export const getDanhMuc: RequestHandler = async (_req, res) => {
  try {
    ok(res, await layDanhMucSanPham());
  } catch (error) {
    serverError(res, error);
  }
};

export const getKiemKeNguon: RequestHandler = async (_req, res) => {
  try { ok(res, await layNguonKiemKe()); }
  catch (error) { serverError(res, error); }
};

export const getOne: RequestHandler = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return badRequest(res, 'Mã sản phẩm không hợp lệ');

  try {
    const data = await prisma.sanPham.findUnique({
      where: { id },
      select: {
        id: true, ten: true, thuongHieu: true, danhMuc: true, hinhAnh: true,
        bienThes: {
          where: { trangThai: true },
          select: { id: true, sanPhamId: true, giaTri: true, donVi: true, giaBan: true, soLuongTon: true },
        },
      },
    });
    if (!data) return notFound(res, 'Sản phẩm không tồn tại');
    ok(res, data);
  } catch (e) { serverError(res, e); }
};

// Dùng crudFactory cho create, update, delete
const factory = crudFactory(prisma.sanPham as any);
export const { createOne, updateOne, deleteOne } = factory;
