import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/auth.types';
import { unauthorized } from '../utils/response';
import prisma from '../config/database';

// Xác thực JWT từ header Authorization: Bearer <token>
export const authenticate: RequestHandler = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return unauthorized(res);

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // Do not trust a role or an ACTIVE flag that was issued days ago in a JWT.
    // This makes a locked account lose access immediately, including to mobile
    // transaction endpoints.
    const nguoiDung = await prisma.nguoiDung.findUnique({
      where: { id: Number(payload.id) },
      select: { id: true, vaiTro: true, trangThai: true },
    });

    if (!nguoiDung || !nguoiDung.trangThai) {
      return unauthorized(res, 'Tài khoản không tồn tại hoặc đã bị khóa', 'ACCOUNT_INACTIVE');
    }

    req.user = { id: String(nguoiDung.id), vaiTro: nguoiDung.vaiTro as JwtPayload['vaiTro'] };
    next();
  } catch {
    unauthorized(res, 'Token không hợp lệ hoặc đã hết hạn');
  }
};
