import { Router } from 'express';
import * as ctrl from '../controllers/kiemke.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();
router.use(authenticate);

router.get('/cua-toi', ctrl.getMine);
router.get('/nguon', requireRole('admin'), ctrl.getSource);
router.get('/', requireRole('admin'), ctrl.getAll);
router.put('/:id/duyet', requireRole('admin'), ctrl.approve);
router.put('/:id/tu-choi', requireRole('admin'), ctrl.reject);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.createOne);

export default router;
