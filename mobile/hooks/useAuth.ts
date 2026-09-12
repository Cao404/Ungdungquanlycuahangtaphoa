import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth.service';

export function useAuth() {
  const { nguoiDung, setAuth, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (taiKhoan: string, matKhau: string) => {
    setLoading(true);
    setError(null);
    try {
      const { token, nguoiDung: nd } = await authService.login(taiKhoan, matKhau);
      setAuth(token, nd);
      return true;
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e.message ?? 'Đăng nhập thất bại';
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { nguoiDung, login, logout, loading, error };
}
