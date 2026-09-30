import { Router } from 'express';
import prisma from '../config/database';
import { crudFactory } from '../utils/crudFactory';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { badRequest, notFound, ok, serverError } from '../utils/response';
import { layChiTietCongNoNhaCungCap, layDanhSachNhaCungCap, traCongNoNhaCungCap, traNoNhaCungCapSchema } from '../services/nhacungcap.service';

const router = Router();
router.use(authenticate);

const { getOne, createOne, updateOne } = crudFactory(prisma.nhaCungCap as any);
router.get('/', async (req, res) => { try { ok(res, await layDanhSachNhaCungCap(typeof req.query.q === 'string' ? req.query.q.trim() : '')); } catch (e) { serverError(res, e); } });
router.get('/:id/cong-no', requireRole('admin'), async (req, res) => { try { ok(res, await layChiTietCongNoNhaCungCap(req.params.id)); } catch (e: any) { if (e.message === 'NOT_FOUND') return notFound(res, 'Nhà cung cấp không tồn tại'); serverError(res, e); } });
router.post('/:id/tra-no', requireRole('admin'), async (req, res) => { const parsed = traNoNhaCungCapSchema.safeParse(req.body); if (!parsed.success) return badRequest(res, parsed.error.errors[0].message); try { ok(res, await traCongNoNhaCungCap(req.params.id, req.user!.id, parsed.data), 'Trả công nợ thành công'); } catch (e: any) { if (e.message === 'NOT_FOUND') return notFound(res, 'Nhà cung cấp không tồn tại'); badRequest(res, e.message); } });
router.get('/:id', getOne);
router.post('/', createOne);
router.put('/:id', updateOne);
router.delete('/:id', requireRole('admin'), async (req, res) => {
  const id = Number(req.params.id);
  try {
    if (await prisma.phieuNhap.count({ where: { nhaCungCapId: id } })) return badRequest(res, 'Không thể xóa nhà cung cấp đã có lịch sử nhập hàng. Bạn vẫn có thể sửa thông tin liên hệ.');
    await prisma.nhaCungCap.delete({ where: { id } });
    ok(res, null, 'Xóa nhà cung cấp thành công');
  } catch (e: any) { if (e.code === 'P2025') return notFound(res, 'Nhà cung cấp không tồn tại'); serverError(res, e); }
});

export default router;
