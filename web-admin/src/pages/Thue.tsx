import { useEffect, useState } from 'react';
import { Calculator, CurrencyCircleDollar, FileText, WarningCircle } from '@phosphor-icons/react';
import { thueService, TongQuanThue } from '../services/thue.service';

const today = new Date().toISOString().slice(0, 10);
const money = (value: number) => `${value.toLocaleString('vi-VN')}đ`;

export default function Thue() {
  const [tu, setTu] = useState('2026-01-01'); const [den, setDen] = useState(today);
  const [data, setData] = useState<TongQuanThue | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = async () => { setLoading(true); setError(''); try { setData(await thueService.overview(tu, den)); } catch (e: any) { setError(e?.response?.data?.message ?? 'Không thể tổng hợp thuế.'); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);
  return <section className="page"><div className="page-head"><div><h2>Thuế</h2><p>Tổng hợp doanh thu và ước tính nghĩa vụ thuế từ cấu hình đang hiệu lực.</p></div></div>
    <div className="dashboard-filters"><div className="date-range"><label>Từ ngày <input type="date" value={tu} onChange={(e) => setTu(e.target.value)} /></label><label>Đến ngày <input type="date" value={den} onChange={(e) => setDen(e.target.value)} /></label><button className="btn primary" disabled={loading} onClick={() => void load()}><Calculator size={18} />Tính thuế</button></div></div>
    {error && <div className="alert danger"><WarningCircle size={20} />{error}</div>}
    {loading ? <div className="skeleton-table"><div className="skeleton-row" /><div className="skeleton-row" /></div> : data && <><div className="metrics"><article className="metric-card accent"><CurrencyCircleDollar size={22} weight="duotone" /><span>Doanh thu đã thanh toán</span><strong>{money(data.doanhThu)}</strong></article><article className="metric-card neutral"><FileText size={22} weight="duotone" /><span>Hóa đơn trong kỳ</span><strong>{data.soHoaDon}</strong></article><article className="metric-card neutral"><Calculator size={22} weight="duotone" /><span>Thuế ước tính phải nộp</span><strong>{money(data.thuePhaiNop)}</strong></article></div>
      <div className="dashboard-grid"><article className="card-form"><h3>Cấu hình đang áp dụng</h3>{data.cauHinhApDung ? <dl className="tax-details"><div><dt>Tên cấu hình</dt><dd>{data.cauHinhApDung.ten}</dd></div><div><dt>Loại thuế</dt><dd>{data.cauHinhApDung.loaiThue}</dd></div><div><dt>Phương pháp</dt><dd>{data.cauHinhApDung.phuongPhapTinh}</dd></div><div><dt>Ngưỡng doanh thu</dt><dd>{money(Number(data.cauHinhApDung.nguongDoanhThu))}</dd></div><div><dt>Thuế suất</dt><dd>{Number(data.cauHinhApDung.tyLe)}%</dd></div><div><dt>Doanh thu tính thuế</dt><dd>{money(data.doanhThuTinhThue)}</dd></div></dl> : <p>Chưa có cấu hình áp dụng.</p>}</article><aside className="card-form inventory-summary"><h3>Kết quả</h3><p className="tax-notice">{data.thongBao}</p><div className="inventory-row"><span>Thuế phải nộp</span><strong>{money(data.thuePhaiNop)}</strong></div></aside></div>
      <section className="card-form"><h3>Cấu hình thuế</h3><div className="table-responsive"><table className="data-table"><thead><tr><th>Tên</th><th>Loại thuế</th><th>Ngưỡng</th><th>Thuế suất</th><th>Hiệu lực từ</th><th>Trạng thái</th></tr></thead><tbody>{data.cauHinhs.map((item) => <tr key={item.id}><td>{item.ten}</td><td>{item.loaiThue}</td><td>{money(Number(item.nguongDoanhThu))}</td><td>{Number(item.tyLe)}%</td><td>{new Date(item.hieuLucTu).toLocaleDateString('vi-VN')}</td><td><span className="badge-tag">{item.trangThai ? 'Đang áp dụng' : 'Ngừng áp dụng'}</span></td></tr>)}</tbody></table></div></section></>}</section>;
}
