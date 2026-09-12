import { Router } from 'express';
import * as ctrl from '../controllers/phieunhap.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', ctrl.getAll);
router.post('/', ctrl.createOne);

export default router;
