import { Router } from 'express';
import * as ctrl from '../controllers/hoadon.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.createOne);

export default router;
