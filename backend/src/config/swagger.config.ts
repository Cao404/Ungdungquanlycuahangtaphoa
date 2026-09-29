import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Quản Lý Cửa Hàng Tạp Hóa',
      version: '1.0.0',
      description: 'API Documentation cho hệ thống quản lý cửa hàng tạp hóa - POS System',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Nhập JWT token (không cần thêm "Bearer " ở đầu)',
        },
      },
      schemas: {
        // Auth
        LoginRequest: {
          type: 'object',
          required: ['tenDangNhap', 'matKhau'],
          properties: {
            tenDangNhap: {
              type: 'string',
              example: 'admin',
            },
            matKhau: {
              type: 'string',
              format: 'password',
              example: 'admin123',
            },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            nguoiDung: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                tenDangNhap: { type: 'string', example: 'admin' },
                hoTen: { type: 'string', example: 'Quản trị viên' },
                vaiTro: { type: 'string', example: 'admin' },
              },
            },
          },
        },
        
        // Sản phẩm
        SanPham: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            ten: { type: 'string', example: 'Sữa tươi Vinamilk 1L' },
            moTa: { type: 'string', example: 'Sữa tươi nguyên chất không đường' },
            hinhAnh: { type: 'string', example: 'http://localhost:8080/uploads/image.jpg' },
            createdAt: { type: 'string', format: 'date-time' },
            bienThes: {
              type: 'array',
              items: { $ref: '#/components/schemas/BienThe' },
            },
          },
        },
        SanPhamInput: {
          type: 'object',
          required: ['ten'],
          properties: {
            ten: { type: 'string', example: 'Sữa tươi Vinamilk 1L' },
            moTa: { type: 'string', example: 'Sữa tươi nguyên chất không đường' },
            hinhAnh: { type: 'string', example: 'http://localhost:8080/uploads/image.jpg' },
          },
        },
        
        // Biến thể
        BienThe: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            sanPhamId: { type: 'integer', example: 1 },
            tenBienThe: { type: 'string', example: 'Hộp 1L' },
            giaTri: { type: 'string', example: '1' },
            donVi: { type: 'string', example: 'Lít' },
            giaNhap: { type: 'number', format: 'decimal', example: 18000 },
            giaBan: { type: 'number', format: 'decimal', example: 22000 },
            soLuongTon: { type: 'integer', example: 150 },
            nguongCanhBao: { type: 'integer', example: 20 },
            barcode: { type: 'string', example: '8934680103114' },
          },
        },
        BienTheInput: {
          type: 'object',
          required: ['sanPhamId', 'giaNhap', 'giaBan', 'soLuongTon'],
          properties: {
            sanPhamId: { type: 'integer', example: 1 },
            tenBienThe: { type: 'string', example: 'Hộp 1L' },
            giaTri: { type: 'string', example: '1' },
            donVi: { type: 'string', example: 'Lít' },
            giaNhap: { type: 'number', example: 18000 },
            giaBan: { type: 'number', example: 22000 },
            soLuongTon: { type: 'integer', example: 150 },
            nguongCanhBao: { type: 'integer', example: 20 },
            barcode: { type: 'string', example: '8934680103114' },
          },
        },
        
        // Nhà cung cấp
        NhaCungCap: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            ten: { type: 'string', example: 'Công ty TNHH Vinamilk' },
            soDienThoai: { type: 'string', example: '0283.8961530' },
            diaChi: { type: 'string', example: 'TP. Hồ Chí Minh' },
            email: { type: 'string', example: 'info@vinamilk.com.vn' },
          },
        },
        
        // Khách hàng
        KhachHang: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            ten: { type: 'string', example: 'Nguyễn Văn A' },
            soDienThoai: { type: 'string', example: '0901234567' },
            diaChi: { type: 'string', example: 'Quận 1, TP.HCM' },
            diemTichLuy: { type: 'integer', example: 250 },
          },
        },
        
        // Hóa đơn
        HoaDon: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            khachHangId: { type: 'integer', example: 1 },
            nguoiDungId: { type: 'integer', example: 1 },
            tongTien: { type: 'number', format: 'decimal', example: 150000 },
            trangThai: { type: 'string', example: 'hoan_thanh' },
            createdAt: { type: 'string', format: 'date-time' },
            chiTietHoaDons: {
              type: 'array',
              items: { $ref: '#/components/schemas/ChiTietHoaDon' },
            },
          },
        },
        ChiTietHoaDon: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            hoaDonId: { type: 'integer', example: 1 },
            bienTheId: { type: 'integer', example: 1 },
            soLuong: { type: 'integer', example: 5 },
            donGia: { type: 'number', format: 'decimal', example: 22000 },
            thanhTien: { type: 'number', format: 'decimal', example: 110000 },
          },
        },
        
        // Phiếu nhập
        PhieuNhap: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nhaCungCapId: { type: 'integer', example: 1 },
            nguoiDungId: { type: 'integer', example: 1 },
            tongTien: { type: 'number', format: 'decimal', example: 5000000 },
            ghiChu: { type: 'string', example: 'Nhập hàng tháng 9' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        
        // Kiểm kê
        KiemKe: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            bienTheId: { type: 'integer', example: 1 },
            soLuongHeThong: { type: 'integer', example: 100 },
            soLuongThucTe: { type: 'integer', example: 98 },
            chenhLech: { type: 'integer', example: -2 },
            nguoiDungId: { type: 'integer', example: 1 },
            ghiChu: { type: 'string', example: 'Hao hụt tự nhiên' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        
        // Error response
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Lỗi xảy ra' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/routes/*.js'], // Đường dẫn tới file routes
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
