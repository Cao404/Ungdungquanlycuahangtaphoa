import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import sanPhamRoutes from './sanpham.routes';
import bienTheRoutes from './bienthe.routes';
import nhaCungCapRoutes from './nhacungcap.routes';
import khachHangRoutes from './khachhang.routes';
import phieuNhapRoutes from './phieunhap.routes';
import kiemKeRoutes from './kiemke.routes';
import hoaDonRoutes from './hoadon.routes';
import nguoiDungRoutes from './nguoidung.routes';
import baoCaoRoutes from './baocao.routes';
import dashboardRoutes from './dashboard.routes';
import thueRoutes from './thue.routes';

/**
 * Admin API boundary.
 *
 * Mobile endpoints keep their existing paths under /api. Every route exposed
 * here is protected at the boundary as well as by the account-status check in
 * authenticate, so hiding an action in Web Admin is never the only guard.
 */
const router = Router();

router.use(authenticate, requireRole('admin'));
router.use('/products', sanPhamRoutes);
router.use('/variants', bienTheRoutes);
router.use('/suppliers', nhaCungCapRoutes);
router.use('/customers', khachHangRoutes);
router.use('/purchase-receipts', phieuNhapRoutes);
router.use('/stocktakes', kiemKeRoutes);
router.use('/invoices', hoaDonRoutes);
router.use('/employees', nguoiDungRoutes);
router.use('/reports', baoCaoRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/taxes', thueRoutes);

export default router;
