import { Response } from 'express';

// Helper chuẩn hoá response JSON trả về client
// Kiểu trả về là void để dùng được với `return ok(res, ...)` trong RequestHandler
export const ok = (res: Response, data: unknown, message = 'Thành công'): void => {
  res.json({ success: true, message, data });
};

export const created = (res: Response, data: unknown, message = 'Tạo thành công'): void => {
  res.status(201).json({ success: true, message, data });
};

export const badRequest = (res: Response, message: string, errorCode = 'VALIDATION_ERROR'): void => {
  res.status(400).json({ success: false, message, errorCode });
};

export const unauthorized = (res: Response, message = 'Chưa xác thực', errorCode = 'UNAUTHORIZED'): void => {
  res.status(401).json({ success: false, message, errorCode });
};

export const forbidden = (res: Response, message = 'Không có quyền', errorCode = 'FORBIDDEN'): void => {
  res.status(403).json({ success: false, message, errorCode });
};

export const notFound = (res: Response, message = 'Không tìm thấy', errorCode = 'NOT_FOUND'): void => {
  res.status(404).json({ success: false, message, errorCode });
};

export const conflict = (res: Response, message: string, errorCode = 'CONFLICT'): void => {
  res.status(409).json({ success: false, message, errorCode });
};

export const serverError = (res: Response, error: unknown): void => {
  console.error(error);
  const message = error instanceof Error ? error.message : 'Lỗi server';
  res.status(500).json({ success: false, message, errorCode: 'INTERNAL_ERROR' });
};
