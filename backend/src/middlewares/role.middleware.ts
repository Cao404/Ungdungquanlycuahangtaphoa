import { RequestHandler } from 'express';
import { VaiTro } from '@prisma/client';
import { forbidden } from '../utils/response';

// Kiểm tra vai trò sau khi đã authenticate
// VD: requireRole('admin') chỉ cho admin đi tiếp
export const requireRole = (...roles: VaiTro[]): RequestHandler =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.vaiTro)) {
      return forbidden(res, `Chỉ ${roles.join('/')} mới có quyền thực hiện`);
    }
    next();
  };
