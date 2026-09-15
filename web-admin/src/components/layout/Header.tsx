import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Header() {
  const navigate = useNavigate();
  const { nguoiDung, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/dang-nhap', { replace: true });
  };

  return (
    <header className="topbar">
      <div>
        <h1>Quản lý cửa hàng tạp hóa</h1>
        <p>Theo dõi sản phẩm, kho, nhập hàng và báo cáo bán hàng.</p>
      </div>
      <div className="user-box">
        <span>{nguoiDung?.hoTen}</span>
        <button className="btn ghost" onClick={handleLogout}>Đăng xuất</button>
      </div>
    </header>
  );
}
