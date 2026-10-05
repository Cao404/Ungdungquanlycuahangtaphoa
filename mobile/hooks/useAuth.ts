import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth.service';
import { getApiErrorMessage } from '../services/api';

export function useAuth() {
  const token = useAuthStore((state) => state.token);
  const nguoiDung = useAuthStore((state) => state.nguoiDung);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearSession = useAuthStore((state) => state.logout);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (taiKhoan: string, matKhau: string) => {
    setLoading(true);
    setError(null);
    try {
      const { token, nguoiDung: nd } = await authService.login(taiKhoan, matKhau);
      await setAuth(token, nd);
      return true;
    } catch (e: any) {
      const raw = e?.response?.data?.message ?? getApiErrorMessage(e, 'Đăng nhập thất bại');
      const msg = /khóa|khoa|locked|inactive/i.test(raw)
        ? 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.'
        : raw;
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Đăng xuất cục bộ vẫn phải thành công khi backend mất kết nối.
    }
    await clearSession();
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
