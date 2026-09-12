import { Router } from 'express';
import * as ctrl from '../controllers/sanpham.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();
router.use(authenticate);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.createOne);
router.put('/:id', ctrl.updateOne);
// Chỉ admin mới được xoá sản phẩm
router.delete('/:id', requireRole('admin'), ctrl.deleteOne);

export default router;
