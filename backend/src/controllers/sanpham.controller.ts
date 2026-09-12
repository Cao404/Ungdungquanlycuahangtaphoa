import { RequestHandler } from 'express';
import prisma from '../config/database';
import { crudFactory } from '../utils/crudFactory';
import { ok, serverError, notFound } from '../utils/response';

// CRUD cho SanPham (dùng crudFactory cho getOne, createOne, updateOne, deleteOne)
// Override getAll và getOne để include BienThe
export const getAll: RequestHandler = async (_req, res) => {
  try {
    const data = await prisma.sanPham.findMany({
      include: { bienThes: true },
      orderBy: { taoLuc: 'desc' },
    });
    ok(res, data);
  } catch (e) { serverError(res, e); }
};

export const getOne: RequestHandler = async (req, res) => {
  try {
    const data = await prisma.sanPham.findUnique({
      where: { id: req.params.id },
      include: { bienThes: true },
    });
    if (!data) return notFound(res, 'Sản phẩm không tồn tại');
    ok(res, data);
  } catch (e) { serverError(res, e); }
};

// Dùng crudFactory cho create, update, delete
const factory = crudFactory(prisma.sanPham as any);
export const { createOne, updateOne, deleteOne } = factory;
