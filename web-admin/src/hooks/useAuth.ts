import { useState } from 'react';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const { token, nguoiDung, setAuth, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (taiKhoan: string, matKhau: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.login(taiKhoan, matKhau);
      setAuth(res.token, res.nguoiDung);
      return true;
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e.message ?? 'Đăng nhập thất bại');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { token, nguoiDung, login, logout, loading, error };
}
