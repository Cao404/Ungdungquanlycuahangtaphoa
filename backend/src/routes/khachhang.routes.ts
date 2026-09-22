import { Router } from 'express';
import prisma from '../config/database';
import { crudFactory } from '../utils/crudFactory';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import * as ctrl from '../controllers/khachhang.controller';

const router = Router();
router.use(authenticate);

const { getOne, createOne, updateOne, deleteOne } = crudFactory(prisma.khachHang as any);
router.get('/', ctrl.getAll);

// Giữ nguyên CRUD cho Web Admin, đồng thời chặn tài khoản nhân viên.
router.use(requireRole('admin'));
router.get('/:id', getOne);
router.post('/', createOne);
router.put('/:id', updateOne);
router.delete('/:id', deleteOne);

export default router;
