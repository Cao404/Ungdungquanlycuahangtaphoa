import { Router } from 'express';
import * as ctrl from '../controllers/kiemke.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();
router.use(authenticate);

router.get('/', ctrl.getAll);
router.get('/cua-toi', ctrl.getMine);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.createOne);
router.post('/:id/duyet', requireRole('admin'), ctrl.approve);
router.post('/:id/tu-choi', requireRole('admin'), ctrl.reject);

export default router;
