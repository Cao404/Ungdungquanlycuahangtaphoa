import { List, SignOut, X } from '@phosphor-icons/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const pageCopy: { match: string; title: string; subtitle: string }[] = [
  { match: '/dashboard', title: 'Dashboard', subtitle: 'Tổng quan hoạt động và tồn kho hôm nay.' },
  { match: '/san-pham/them', title: 'Thêm sản phẩm', subtitle: 'Tạo hàng hóa mới và các loại bán.' },
  { match: '/san-pham/', title: 'Sửa sản phẩm', subtitle: 'Cập nhật thông tin hàng và tồn kho.' },
  { match: '/san-pham', title: 'Sản phẩm', subtitle: 'Hàng hóa, loại bán và cảnh báo tồn kho.' },
  { match: '/nha-cung-cap', title: 'Nhà cung cấp', subtitle: 'Đối tác cung ứng hàng cho cửa hàng.' },
  { match: '/khach-hang', title: 'Khách hàng', subtitle: 'Danh bạ khách mua tại cửa hàng.' },
  { match: '/phieu-nhap/them', title: 'Phiếu nhập mới', subtitle: 'Ghi nhận lô hàng vừa nhập kho.' },
  { match: '/phieu-nhap', title: 'Phiếu nhập', subtitle: 'Lịch sử nhập hàng và nhà cung cấp.' },
  { match: '/kiem-ke', title: 'Kiểm kê kho', subtitle: 'Đối chiếu sổ sách với hàng thực tế.' },
  { match: '/thue', title: 'Thuế', subtitle: 'Cấu hình và tổng hợp nghĩa vụ thuế.' },
  { match: '/bao-cao', title: 'Báo cáo', subtitle: 'Doanh thu và sản phẩm bán chạy.' },
  { match: '/nguoi-dung', title: 'Nhân viên', subtitle: 'Tài khoản đăng nhập khu vực quản trị.' },
];

function copyForPath(pathname: string) {
  return pageCopy.find((item) => pathname.startsWith(item.match)) ?? {
    title: 'Quản lý cửa hàng',
    subtitle: 'Theo dõi hàng, kho, nhập hàng và báo cáo.',
  };
}

export default function Header({
  navOpen,
  onToggleNav,
}: {
  navOpen: boolean;
  onToggleNav: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { nguoiDung, logout } = useAuth();
  const copy = copyForPath(location.pathname);

  const handleLogout = () => {
    logout();
    navigate('/dang-nhap', { replace: true });
  };

  return (
    <header className="topbar">
      <div className="topbar-copy">
        <button
          type="button"
          className="btn ghost small sidebar-toggle"
          onClick={onToggleNav}
          aria-expanded={navOpen}
          aria-label={navOpen ? 'Đóng menu' : 'Mở menu'}
        >
          {navOpen ? <X size={18} /> : <List size={18} />}
        </button>
        <div>
          <p className="topbar-kicker">{copy.title}</p>
          <p>{copy.subtitle}</p>
        </div>
      </div>
      <div className="user-box">
        <div className="user-chip">
          <strong>{nguoiDung?.hoTen}</strong>
          <small>{nguoiDung?.vaiTro === 'owner' ? 'Chủ cửa hàng' : nguoiDung?.vaiTro === 'admin' ? 'Quản trị' : 'Nhân viên'}</small>
        </div>
        <button className="btn ghost" onClick={handleLogout}>
          <SignOut size={16} weight="regular" />
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
