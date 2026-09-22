import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload, VaiTro } from '../types/auth.types';
import { serverError, unauthorized } from '../utils/response';

const isVaiTro = (value: unknown): value is VaiTro =>
  value === 'admin' || value === 'nhanvien';

const isJwtPayload = (value: unknown): value is JwtPayload => {
  if (!value || typeof value !== 'object') return false;
  const payload = value as Record<string, unknown>;
  return Number.isInteger(payload.id) && isVaiTro(payload.vaiTro);
};

// Xác thực JWT từ header Authorization: Bearer <token>
export const authenticate: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization;
  const [scheme, token] = header?.trim().split(/\s+/) ?? [];
  if (scheme !== 'Bearer' || !token) {
    return unauthorized(res, 'Vui lòng đăng nhập để tiếp tục');
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return serverError(res, new Error('JWT_SECRET chưa được cấu hình'));
  }

  try {
    const payload = jwt.verify(token, secret, { algorithms: ['HS256'] });
    if (!isJwtPayload(payload)) {
      return unauthorized(res, 'Token không hợp lệ hoặc đã hết hạn');
    }
    req.user = payload;
    next();
  } catch {
    unauthorized(res, 'Token không hợp lệ hoặc đã hết hạn');
  }
};
