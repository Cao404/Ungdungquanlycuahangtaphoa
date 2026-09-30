import { Router } from 'express';
import * as ctrl from '../controllers/phieunhap.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', ctrl.getAll);
router.post('/', ctrl.createOne);
router.get('/:id', ctrl.getOne);
router.put('/:id', ctrl.updateOne);
router.post('/:id/confirm', ctrl.confirm);
router.post('/:id/cancel', ctrl.cancel);

export default router;
