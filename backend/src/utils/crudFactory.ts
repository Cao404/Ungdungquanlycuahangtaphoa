import { RequestHandler } from 'express';
import { ok, created, notFound, serverError } from './response';

type PrismaModelDelegate = {
  findMany: (args?: any) => Promise<any[]>;
  findUnique: (args: any) => Promise<any>;
  create: (args: any) => Promise<any>;
  update: (args: any) => Promise<any>;
  delete: (args: any) => Promise<any>;
};

/**
 * Factory tạo 5 handler CRUD dùng chung cho các bảng đơn giản
 * (NhaCungCap, KhachHang, NguoiDung…)
 */
export function crudFactory(model: PrismaModelDelegate) {
  const getAll: RequestHandler = async (_req, res) => {
    try {
      const data = await model.findMany({ orderBy: { taoLuc: 'desc' } });
      ok(res, data);
    } catch (e) { serverError(res, e); }
  };

  const getOne: RequestHandler = async (req, res) => {
    try {
      const data = await model.findUnique({ where: { id: req.params.id } });
      if (!data) return notFound(res);
      ok(res, data);
    } catch (e) { serverError(res, e); }
  };

  const createOne: RequestHandler = async (req, res) => {
    try {
      const data = await model.create({ data: req.body });
      created(res, data);
    } catch (e) { serverError(res, e); }
  };

  const updateOne: RequestHandler = async (req, res) => {
    try {
      const data = await model.update({ where: { id: req.params.id }, data: req.body });
      ok(res, data, 'Cập nhật thành công');
    } catch (e) { serverError(res, e); }
  };

  const deleteOne: RequestHandler = async (req, res) => {
    try {
      await model.delete({ where: { id: req.params.id } });
      ok(res, null, 'Xoá thành công');
    } catch (e) { serverError(res, e); }
  };

  return { getAll, getOne, createOne, updateOne, deleteOne };
}
