import { Router } from 'express';
import * as ctrl from '../controllers/sanpham.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();
router.use(authenticate);

router.get('/', ctrl.getAll);
router.get('/danhmuc', ctrl.getDanhMuc);
router.get('/kiemke-nguon', ctrl.getKiemKeNguon);
router.get('/:id', ctrl.getOne);

// Các API bên dưới chỉ phục vụ quản trị, nhân viên bán hàng không được gọi.
router.use(requireRole('admin'));
router.post('/', ctrl.createOne);
router.put('/:id', ctrl.updateOne);
router.delete('/:id', ctrl.deleteOne);

export default router;
