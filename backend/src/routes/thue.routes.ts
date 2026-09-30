import { Router } from 'express';
import { overview } from '../controllers/thue.controller';

const router = Router();
router.get('/overview', overview);
export default router;
