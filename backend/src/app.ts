import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import prisma from './config/database';

import authRoutes      from './routes/auth.routes';
import sanPhamRoutes   from './routes/sanpham.routes';
import bienTheRoutes   from './routes/bienthe.routes';
import nhaCungCapRoutes from './routes/nhacungcap.routes';
import khachHangRoutes  from './routes/khachhang.routes';
import hoaDonRoutes    from './routes/hoadon.routes';
import phieuNhapRoutes from './routes/phieunhap.routes';
import baoCaoRoutes    from './routes/baocao.routes';
import nguoiDungRoutes from './routes/nguoidung.routes';
import kiemKeRoutes from './routes/kiemke.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Backend đang hoạt động', data: { service: 'quan-ly-tap-hoa-api' } });
});

app.get('/health/db', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ success: true, message: 'Cơ sở dữ liệu đang hoạt động' });
  } catch (error) {
    console.error('Kiểm tra cơ sở dữ liệu thất bại:', error);
    res.status(503).json({ success: false, message: 'Không kết nối được cơ sở dữ liệu' });
  }
});

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

// 404 handler
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route không tồn tại' }));

const PORT = process.env.PORT ?? 8080;
app.listen(PORT, () => console.log(`✅  Server chạy tại http://localhost:${PORT}`));

export default app;
