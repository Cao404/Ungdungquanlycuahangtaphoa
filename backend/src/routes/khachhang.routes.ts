import { Router } from 'express';
import prisma from '../config/database';
import { crudFactory } from '../utils/crudFactory';
import { authenticate } from '../middlewares/auth.middleware';
import { ok, serverError } from '../utils/response';
import { badRequest, notFound } from '../utils/response';
import { requireRole } from '../middlewares/role.middleware';
import { layChiTietCongNo, layDanhSachKhachHang, thuCongNo, thuNoSchema } from '../services/khachhang.service';

const router = Router();
router.use(authenticate);

const { getOne, createOne, updateOne, deleteOne } = crudFactory(prisma.khachHang as any);
router.get('/', async (req, res) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    ok(res, await layDanhSachKhachHang(q));
  } catch (e) { serverError(res, e); }
});
router.get('/:id/cong-no', requireRole('admin'), async (req, res) => {
  try { ok(res, await layChiTietCongNo(req.params.id)); }
  catch (e: any) { if (e.message === 'NOT_FOUND') return notFound(res, 'Khách hàng không tồn tại'); serverError(res, e); }
});
router.post('/:id/thu-no', requireRole('admin'), async (req, res) => {
  const parsed = thuNoSchema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, parsed.error.errors[0].message);
  try { ok(res, await thuCongNo(req.params.id, req.user!.id, parsed.data), 'Thu công nợ thành công'); }
  catch (e: any) { if (e.message === 'NOT_FOUND') return notFound(res, 'Khách hàng không tồn tại'); badRequest(res, e.message); }
});
router.get('/:id', getOne);
router.post('/', requireRole('admin'), createOne);
router.put('/:id', requireRole('admin'), updateOne);
router.delete('/:id', requireRole('admin'), deleteOne);

export default router;
