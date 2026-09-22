import { Router } from 'express';
import * as ctrl from '../controllers/phieunhap.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();
router.use(authenticate, requireRole('admin'));

router.get('/', ctrl.getAll);
router.post('/', ctrl.createOne);

export default router;
