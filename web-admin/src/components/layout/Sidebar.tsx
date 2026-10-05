import {
  ChartLineUp,
  ClipboardText,
  House,
  IdentificationCard,
  Package,
  Scales,
  Calculator,
  Truck,
  Users,
  X,
} from '@phosphor-icons/react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', adminOnly: true, icon: House },
  { to: '/san-pham', label: 'Sản phẩm', adminOnly: true, icon: Package },
  { to: '/nha-cung-cap', label: 'Nhà cung cấp', icon: Truck },
  { to: '/khach-hang', label: 'Khách hàng', icon: Users },
  { to: '/phieu-nhap', label: 'Phiếu nhập', icon: ClipboardText },
  { to: '/kiem-ke', label: 'Kiểm kê kho', icon: Scales },
  { to: '/thue', label: 'Thuế', adminOnly: true, icon: Calculator },
  { to: '/bao-cao', label: 'Báo cáo', adminOnly: true, icon: ChartLineUp },
  { to: '/nguoi-dung', label: 'Nhân viên', adminOnly: true, icon: IdentificationCard },
];

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { nguoiDung } = useAuth();
  const isAdmin = nguoiDung?.vaiTro === 'admin' || nguoiDung?.vaiTro === 'owner';

  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <div className="brand">
          <strong>Tạp hóa</strong>
          <span>Quản trị cửa hàng</span>
        </div>
        <button
          type="button"
          className="sidebar-close"
          onClick={onNavigate}
          aria-label="Đóng menu"
        >
          <X size={20} />
        </button>
      </div>
      <nav aria-label="Điều hướng chính">
        {navItems
          .filter((item) => !item.adminOnly || isAdmin)
          .map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                <Icon size={18} weight="regular" />
                {item.label}
              </NavLink>
            );
          })}
      </nav>
    </aside>
  );
}
