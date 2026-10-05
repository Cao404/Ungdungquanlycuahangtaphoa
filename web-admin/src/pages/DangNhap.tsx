import { Storefront } from '@phosphor-icons/react';
import { FormEvent, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import InputField from '../components/form/InputField';
import { useAuth } from '../hooks/useAuth';

export default function DangNhap() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, login, loading, error } = useAuth();
  const [taiKhoan, setTaiKhoan] = useState('');
  const [matKhau, setMatKhau] = useState('');

  const from = (location.state as { from?: string } | null)?.from ?? '/';
  if (token) return <Navigate to={from} replace />;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const ok = await login(taiKhoan.trim(), matKhau);
    if (ok) navigate(from, { replace: true });
  };

  return (
    <div className="login-page">
      <div className="login-shell">
        <aside className="login-brand">
          <div className="login-mark" aria-hidden="true">
            <Storefront size={22} weight="regular" />
          </div>
          <div>
            <h1>Tạp hóa trong tầm tay</h1>
            <p>Theo dõi hàng trên kệ, phiếu nhập và doanh thu ngay tại quầy.</p>
          </div>
        </aside>
        <form className="login-card" onSubmit={handleSubmit}>
          <div>
            <h1>Đăng nhập</h1>
            <p>Dùng tài khoản nhân viên hoặc quản trị.</p>
          </div>
          <InputField label="Tài khoản" value={taiKhoan} onChange={(e) => setTaiKhoan(e.target.value)} autoFocus />
          <InputField label="Mật khẩu" type="password" value={matKhau} onChange={(e) => setMatKhau(e.target.value)} />
          {error && <div className="alert danger">{error}</div>}
          <button className="btn primary" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Vào cửa hàng'}
          </button>
        </form>
      </div>
    </div>
  );
}
