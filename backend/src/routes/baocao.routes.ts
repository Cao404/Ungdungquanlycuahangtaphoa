import { Router } from 'express';
import * as ctrl from '../controllers/baocao.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();
router.use(authenticate, requireRole('admin'));

router.get('/doanhthu', ctrl.doanhThu);
router.get('/banchay', ctrl.banChay);

export default router;
