import { Router } from 'express';
import * as ctrl from '../controllers/bienthe.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();
router.use(authenticate);

router.get('/', ctrl.getAll);
router.get('/:id/lichsu-kho', ctrl.getLichSuKho);
router.get('/:id', ctrl.getOne);
router.post('/', requireRole('admin'), ctrl.createOne);
router.put('/:id', requireRole('admin'), ctrl.updateOne);
router.delete('/:id', requireRole('admin'), ctrl.deleteOne);

export default router;
