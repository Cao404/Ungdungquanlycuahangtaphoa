import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/auth.types';
import { unauthorized } from '../utils/response';

// Xác thực JWT từ header Authorization: Bearer <token>
export const authenticate: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return unauthorized(res);

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    unauthorized(res, 'Token không hợp lệ hoặc đã hết hạn');
  }
};
