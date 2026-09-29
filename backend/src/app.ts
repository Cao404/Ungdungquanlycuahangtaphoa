import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import http from 'http';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.config';

import authRoutes      from './routes/auth.routes';
import sanPhamRoutes   from './routes/sanpham.routes';
import bienTheRoutes   from './routes/bienthe.routes';
import nhaCungCapRoutes from './routes/nhacungcap.routes';
import khachHangRoutes  from './routes/khachhang.routes';
import hoaDonRoutes    from './routes/hoadon.routes';
import phieuNhapRoutes from './routes/phieunhap.routes';
import baoCaoRoutes    from './routes/baocao.routes';
import nguoiDungRoutes from './routes/nguoidung.routes';
import kiemKeRoutes    from './routes/kiemke.routes';
import uploadRoutes    from './routes/upload.routes';
import adminRoutes     from './routes/admin.routes';
import scannerRoutes   from './routes/scanner.routes';
import { setupScannerGateway } from './realtime/scanner.gateway';

const app = express();
const server = http.createServer(app);
setupScannerGateway(server);

app.use(cors());
app.use(express.json());

// Phục vụ thư mục ảnh tĩnh /uploads
const uploadsDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// ─── Swagger API Documentation ────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Docs - Quản Lý Tạp Hóa',
}));

// ─── Định nghĩa tất cả API ────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/sanpham',     sanPhamRoutes);
app.use('/api/bienthe',     bienTheRoutes);
app.use('/api/nhacungcap',  nhaCungCapRoutes);
app.use('/api/khachhang',   khachHangRoutes);
app.use('/api/hoadon',      hoaDonRoutes);
app.use('/api/phieunhap',   phieuNhapRoutes);
app.use('/api/baocao',      baoCaoRoutes);
app.use('/api/nguoidung',   nguoiDungRoutes);
app.use('/api/kiemke',      kiemKeRoutes);
app.use('/api/upload',      uploadRoutes);
app.use('/api/admin',       adminRoutes);
app.use('/api/scanner',     scannerRoutes);

// 404 handler
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route không tồn tại' }));

const PORT = process.env.PORT ?? 8080;
server.listen(PORT, () => {
  console.log(`✅  Server chạy tại http://localhost:${PORT}`);
  console.log(`📚  API Docs: http://localhost:${PORT}/api-docs`);
});

export default app;
