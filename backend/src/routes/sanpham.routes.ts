import { Router } from 'express';
import * as ctrl from '../controllers/sanpham.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * /api/sanpham:
 *   get:
 *     summary: Lấy danh sách tất cả sản phẩm
 *     tags: [Sản phẩm]
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm kèm biến thể
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SanPham'
 *       401:
 *         description: Chưa đăng nhập
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', ctrl.getAll);

/**
 * @swagger
 * /api/sanpham/kiemke-nguon:
 *   get:
 *     summary: Lấy danh sách sản phẩm cho kiểm kê
 *     tags: [Sản phẩm]
 *     description: Endpoint đặc biệt để lấy dữ liệu phục vụ kiểm kê kho
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm với thông tin kiểm kê
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SanPham'
 */
router.get('/kiemke-nguon', ctrl.getKiemKeSource);
router.get('/categories', ctrl.getCategories);
router.get('/barcode/:barcode', ctrl.getByBarcode);

/**
 * @swagger
 * /api/sanpham/{id}:
 *   get:
 *     summary: Lấy chi tiết một sản phẩm
 *     tags: [Sản phẩm]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của sản phẩm
 *     responses:
 *       200:
 *         description: Chi tiết sản phẩm
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SanPham'
 *       404:
 *         description: Không tìm thấy sản phẩm
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', ctrl.getOne);

/**
 * @swagger
 * /api/sanpham:
 *   post:
 *     summary: Tạo sản phẩm mới
 *     tags: [Sản phẩm]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SanPhamInput'
 *     responses:
 *       201:
 *         description: Tạo sản phẩm thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SanPham'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', requireRole('admin'), ctrl.createOne);

/**
 * @swagger
 * /api/sanpham/{id}:
 *   put:
 *     summary: Cập nhật sản phẩm
 *     tags: [Sản phẩm]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của sản phẩm
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SanPhamInput'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SanPham'
 *       404:
 *         description: Không tìm thấy sản phẩm
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', requireRole('admin'), ctrl.updateOne);

/**
 * @swagger
 * /api/sanpham/{id}:
 *   delete:
 *     summary: Xóa sản phẩm (Admin only)
 *     tags: [Sản phẩm]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của sản phẩm
 *     responses:
 *       200:
 *         description: Xóa thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Xóa sản phẩm thành công
 *       403:
 *         description: Không có quyền (chỉ admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Không tìm thấy sản phẩm
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Chỉ admin mới được xoá sản phẩm
router.delete('/:id', requireRole('admin'), ctrl.deleteOne);

export default router;
