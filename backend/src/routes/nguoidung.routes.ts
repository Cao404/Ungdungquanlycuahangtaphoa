import { Router } from 'express';
import * as ctrl from '../controllers/nguoidung.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();
// Toàn bộ /api/nguoidung chỉ dành cho admin
router.use(authenticate, requireRole('admin'));

router.get('/', ctrl.getAll);
router.post('/', ctrl.createOne);
router.put('/:id', ctrl.updateOne);
router.delete('/:id', ctrl.deleteOne);

export default router;
