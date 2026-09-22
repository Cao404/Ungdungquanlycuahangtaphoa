import { Response } from 'express';
import { Prisma } from '@prisma/client';

// Helper chuẩn hoá response JSON trả về client
// Kiểu trả về là void để dùng được với `return ok(res, ...)` trong RequestHandler
export const ok = (res: Response, data: unknown, message = 'Thành công'): void => {
  res.json({ success: true, message, data });
};

export const created = (res: Response, data: unknown, message = 'Tạo thành công'): void => {
  res.status(201).json({ success: true, message, data });
};

export const badRequest = (res: Response, message: string): void => {
  res.status(400).json({ success: false, message });
};

export const unauthorized = (res: Response, message = 'Chưa xác thực'): void => {
  res.status(401).json({ success: false, message });
};

export const forbidden = (res: Response, message = 'Không có quyền'): void => {
  res.status(403).json({ success: false, message });
};

export const notFound = (res: Response, message = 'Không tìm thấy'): void => {
  res.status(404).json({ success: false, message });
};

export const serverError = (res: Response, error: unknown): void => {
  console.error(error);
  if (
    error instanceof Prisma.PrismaClientInitializationError ||
    (error instanceof Prisma.PrismaClientKnownRequestError && ['P1001', 'P1002'].includes(error.code))
  ) {
    res.status(503).json({
      success: false,
      message: 'Không kết nối được cơ sở dữ liệu. Hãy kiểm tra SQL Server và cấu hình DATABASE_URL trên máy chạy backend.',
    });
    return;
  }
  const detail = process.env.NODE_ENV === 'development' && error instanceof Error
    ? error.message
    : undefined;
  res.status(500).json({
    success: false,
    message: detail ?? 'Có lỗi xảy ra trên máy chủ, vui lòng thử lại',
  });
};

