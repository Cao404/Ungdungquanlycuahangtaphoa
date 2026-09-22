import { Router } from 'express';
import prisma from '../config/database';
import { crudFactory } from '../utils/crudFactory';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();
router.use(authenticate, requireRole('admin'));

const { getAll, getOne, createOne, updateOne, deleteOne } = crudFactory(prisma.nhaCungCap as any);
router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', createOne);
router.put('/:id', updateOne);
router.delete('/:id', deleteOne);

export default router;
