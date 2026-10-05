import { useEffect, useState } from 'react';
import {
  ArrowClockwise,
  ClipboardText,
  CurrencyCircleDollar,
  Package,
  Receipt,
  TrendDown,
  TrendUp,
  User,
  Users,
  WarningCircle,
} from '@phosphor-icons/react';
import { DashboardOverview, dashboardService } from '../services/dashboard.service';

const formatMoney = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);

const formatDay = (value: string) =>
  new Intl.DateTimeFormat('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(`${value}T00:00:00`));

export default function Dashboard() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'custom'>('today');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const load = async (rangeFrom?: string, rangeTo?: string) => {
    setLoading(true);
    setError('');
    try {
      setData(
        await dashboardService.getOverview(
          (rangeFrom ?? from) || undefined,
          (rangeTo ?? to) || undefined
        )
      );
    } catch {
      setError('Không thể tải số liệu tổng quan. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const choosePeriod = (value: 'today' | 'week' | 'month') => {
    const today = new Date();
    const date = (input: Date) => input.toISOString().slice(0, 10);
    const end = date(today);
    const start = new Date(today);
    if (value === 'week') start.setDate(start.getDate() - 6);
    if (value === 'month') start.setDate(start.getDate() - 29);
    setPeriod(value);
    setFrom(date(start));
    setTo(end);
    void load(date(start), end);
  };

  if (loading) {
    return (
      <div className="page">
        <div className="skeleton-table">
          <div className="skeleton-row" />
          <div className="skeleton-row" />
          <div className="skeleton-row" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page">
        <div className="empty-state">
          <WarningCircle size={48} weight="duotone" />
          <h3>Chưa thể tải dashboard</h3>
          <p>{error}</p>
          <button className="btn primary" onClick={() => void load()}>
            <ArrowClockwise size={17} />
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const maxTotal = Math.max(...data.doanhThuTheoNgay.map((item) => item.total), 1);
  const metrics = [
    { label: 'Doanh thu', value: formatMoney(data.doanhThu), icon: CurrencyCircleDollar, tone: 'accent' },
    { label: 'Hóa đơn', value: data.soHoaDon.toLocaleString('vi-VN'), icon: Receipt, tone: 'neutral' },
    { label: 'Giá trị tồn kho', value: formatMoney(data.giaTriTonKho), icon: Package, tone: 'neutral' },
    { label: 'Phiếu nhập đã xác nhận', value: data.soPhieuNhap.toLocaleString('vi-VN'), icon: ClipboardText, tone: 'neutral' },
    { label: 'Khách hàng', value: data.soKhachHang.toLocaleString('vi-VN'), icon: Users, tone: 'neutral' },
    { label: 'Nhân viên đang hoạt động', value: data.soNhanVien.toLocaleString('vi-VN'), icon: User, tone: 'neutral' },
    { label: 'Khách đang nợ', value: `${data.soKhachDangNo} · ${formatMoney(data.tongCongNo)}`, icon: Users, tone: data.noQuaHan > 0 ? 'accent' : 'neutral' },
    { label: 'Phải trả nhà cung cấp', value: `${data.soNhaCungCapDangNo} · ${formatMoney(data.tongNoNhaCungCap)}`, icon: ClipboardText, tone: data.noNhaCungCapQuaHan > 0 ? 'accent' : 'neutral' },
  ];

  return (
    <div className="page dashboard-page">
      <div className="page-head dashboard-head">
        <div>
          <h2>Tổng quan cửa hàng</h2>
          <p>
            Số liệu từ {new Date(`${data.tuNgay}T00:00:00`).toLocaleDateString('vi-VN')} đến{' '}
            {new Date(`${data.denNgay}T00:00:00`).toLocaleDateString('vi-VN')}.
          </p>
        </div>
        <button className="btn ghost" onClick={() => void load()}>
          <ArrowClockwise size={17} />
          Làm mới
        </button>
      </div>

      <div className="dashboard-filters">
        <div className="period-buttons">
          <button
            className={`btn small ${period === 'today' ? 'primary' : 'ghost'}`}
            onClick={() => choosePeriod('today')}
          >
            Hôm nay
          </button>
          <button
            className={`btn small ${period === 'week' ? 'primary' : 'ghost'}`}
            onClick={() => choosePeriod('week')}
          >
            7 ngày
          </button>
          <button
            className={`btn small ${period === 'month' ? 'primary' : 'ghost'}`}
            onClick={() => choosePeriod('month')}
          >
            30 ngày
          </button>
        </div>
        <div className="date-range">
          <input
            type="date"
            value={from}
            onChange={(e) => {
              setPeriod('custom');
              setFrom(e.target.value);
            }}
          />
          <input
            type="date"
            value={to}
            onChange={(e) => {
              setPeriod('custom');
              setTo(e.target.value);
            }}
          />
          <button className="btn small" disabled={!from || !to} onClick={() => void load()}>
            Áp dụng
          </button>
        </div>
      </div>

      <section className="metrics">
        {metrics.map(({ label, value, icon: Icon, tone }) => (
          <article className={`metric-card ${tone}`} key={label}>
            <Icon size={22} weight="duotone" />
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="card-form chart-card">
          <div className="section-title">
            <div>
              <h3>Doanh thu theo ngày</h3>
              <p>Đơn vị: đồng</p>
            </div>
          </div>
          <div className="revenue-bars" aria-label="Biểu đồ doanh thu theo ngày">
            {data.doanhThuTheoNgay.map((item) => (
              <div className="revenue-bar" key={item.date}>
                <div className="revenue-bar-track">
                  <div
                    className="revenue-bar-fill"
                    style={{
                      height: `${Math.max((item.total / maxTotal) * 100, item.total ? 4 : 0)}%`,
                    }}
                    title={formatMoney(item.total)}
                  />
                </div>
                <strong>{formatDay(item.date)}</strong>
                <span>{item.total ? formatMoney(item.total) : '0 đ'}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="card-form inventory-summary">
          <h3>Tình trạng tồn kho</h3>
          <div className="inventory-row">
            <span>
              <TrendDown size={19} weight="bold" />
              Sắp hết hàng
            </span>
            <strong>{data.sapHetHang}</strong>
          </div>
          <div className="inventory-row danger">
            <span>
              <WarningCircle size={19} weight="bold" />
              Đã hết hàng
            </span>
            <strong>{data.hetHang}</strong>
          </div>
          <div className="inventory-row warning">
            <span><WarningCircle size={19} weight="bold" />Lô sắp hết hạn</span>
            <strong>{data.loSapHetHan}</strong>
          </div>
          <div className="inventory-row danger">
            <span><WarningCircle size={19} weight="bold" />Lô đã hết hạn</span>
            <strong>{data.loHetHan}</strong>
          </div>
          <div className={`inventory-row ${data.noQuaHan > 0 ? 'danger' : ''}`}>
            <span><WarningCircle size={19} weight="bold" />Khách nợ quá 30 ngày</span>
            <strong>{formatMoney(data.noQuaHan)}</strong>
          </div>
          <div className={`inventory-row ${data.noNhaCungCapQuaHan > 0 ? 'danger' : ''}`}>
            <span><WarningCircle size={19} weight="bold" />Nợ NCC quá 30 ngày</span>
            <strong>{formatMoney(data.noNhaCungCapQuaHan)}</strong>
          </div>
          <div className="inventory-row">
            <span>
              <TrendUp size={19} weight="bold" />
              Tiền nhập
            </span>
            <strong>{formatMoney(data.tienNhap)}</strong>
          </div>
          <div className="inventory-row">
            <span>
              <Package size={19} weight="bold" />
              Sản phẩm
            </span>
            <strong>{data.soSanPham}</strong>
          </div>
        </article>
      </section>

      <section className="card-form expiry-card">
        <div className="section-title"><div><h3>Hàng cần xử lý theo hạn sử dụng</h3><p>Ưu tiên giảm giá, trả nhà cung cấp hoặc loại khỏi quầy. Hàng hết hạn đã bị chặn bán.</p></div></div>
        {data.hangCanXuLy.length ? <div className="table-wrap"><table className="data-table"><thead><tr><th>Sản phẩm</th><th>Lô</th><th>Hạn sử dụng</th><th>Còn lại</th><th>Trạng thái</th></tr></thead><tbody>
          {data.hangCanXuLy.map((item) => <tr key={item.loHangId}><td><strong>{item.tenSanPham}</strong><small>{item.quyCach}</small></td><td>{item.maLo || 'Không có mã lô'}</td><td>{new Date(`${item.hanSuDung}T00:00:00`).toLocaleDateString('vi-VN')}</td><td>{item.soLuongCon}</td><td><span className={`status ${item.daHetHan ? 'danger' : 'warning'}`}>{item.daHetHan ? 'Đã hết hạn' : 'Sắp hết hạn'}</span></td></tr>)}
        </tbody></table></div> : <div className="empty-state compact"><Package size={34} weight="duotone" /><p>Không có lô hàng nào hết hạn trong 30 ngày tới.</p></div>}
      </section>
    </div>
  );
}
