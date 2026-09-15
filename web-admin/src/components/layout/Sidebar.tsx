import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { to: '/san-pham', label: 'Sản phẩm', adminOnly: true },
  { to: '/nha-cung-cap', label: 'Nhà cung cấp' },
  { to: '/khach-hang', label: 'Khách hàng' },
  { to: '/phieu-nhap', label: 'Phiếu nhập' },
  { to: '/bao-cao', label: 'Báo cáo', adminOnly: true },
  { to: '/nguoi-dung', label: 'Nhân viên', adminOnly: true },
];

export default function Sidebar() {
  const { nguoiDung } = useAuth();
  const isAdmin = nguoiDung?.vaiTro === 'admin';

  return (
    <aside className="sidebar">
      <div className="brand">
        <strong>Tạp Hóa Admin</strong>
        <span>Quản trị cửa hàng</span>
      </div>
      <nav>
        {navItems
          .filter((item) => !item.adminOnly || isAdmin)
          .map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              {item.label}
            </NavLink>
          ))}
      </nav>
    </aside>
  );
}
