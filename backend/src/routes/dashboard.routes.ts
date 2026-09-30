import { Router } from 'express';
import { getOverview } from '../controllers/dashboard.controller';

const router = Router();
router.get('/', getOverview);

export default router;
