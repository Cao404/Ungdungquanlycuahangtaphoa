import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useGioHangStore } from '../store/gioHangStore';
import { authService } from '../services/auth.service';
import { getApiErrorMessage } from '../services/api';

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

  const logout = async () => {
    try { await authService.logout(); } catch { /* Local logout must still succeed offline. */ }
    await clearSession();
  };

  const logout = () => {
    clearAuth();
  };

  return { token, nguoiDung, login, logout, loading, error };
}

export function useLoginForm() {
  const [taiKhoan, setTaiKhoan] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const auth = useAuth();

  const submit = async () => {
    const username = taiKhoan.trim();
    if (!username || !matKhau) {
      setValidationError('Vui lòng nhập tài khoản và mật khẩu');
      return false;
    }
    setValidationError(null);
    return auth.login(username, matKhau);
  };

  return {
    taiKhoan,
    setTaiKhoan,
    matKhau,
    setMatKhau,
    submit,
    loading: auth.loading,
    error: validationError ?? auth.error,
  };
}
