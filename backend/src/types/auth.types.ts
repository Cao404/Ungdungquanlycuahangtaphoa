export type VaiTro = 'admin' | 'nhanvien';

// Payload được lưu trong JWT
export interface JwtPayload {
  id: number;
  vaiTro: VaiTro;
}

// Extend Express Request để có user sau khi xác thực
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
