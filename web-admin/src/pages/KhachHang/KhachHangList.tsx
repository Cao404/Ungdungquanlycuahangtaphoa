import { FormEvent, useState } from 'react';
import DataTable, { Column } from '../../components/table/DataTable';
import InputField from '../../components/form/InputField';
import { useFetch } from '../../hooks/useFetch';
import { ChiTietCongNo, khachHangService } from '../../services/khachhang.service';
import { KhachHang } from '../../types/SanPham';

export default function KhachHangList() {
  const { data, loading, error, refetch } = useFetch(khachHangService.getAll);
  const [editing, setEditing] = useState<KhachHang | null>(null);
  const [form, setForm] = useState({ ten: '', sdt: '', diaChi: '' });
  const [debt, setDebt] = useState<ChiTietCongNo | null>(null);
  const [debtLoading, setDebtLoading] = useState(false);
  const [debtError, setDebtError] = useState('');
  const [collecting, setCollecting] = useState(false);
  const [payment, setPayment] = useState({ soTien: '', hinhThucTT: 'tienmat' as 'tienmat' | 'chuyenkhoan', ghiChu: '' });

  const money = (value: number) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;

  const reset = () => {
    setEditing(null);
    setForm({ ten: '', sdt: '', diaChi: '' });
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (editing) await khachHangService.update(editing.id, form);
    else await khachHangService.create(form);
    reset();
    refetch();
  };

  const openDebt = async (customer: KhachHang) => {
    setDebtLoading(true); setDebtError('');
    try { setDebt(await khachHangService.getDebt(customer.id)); }
    catch (e: any) { setDebtError(e?.response?.data?.message ?? 'Không tải được công nợ khách hàng.'); }
    finally { setDebtLoading(false); }
  };

  const collectDebt = async (event: FormEvent) => {
    event.preventDefault();
    if (!debt) return;
    setCollecting(true); setDebtError('');
    try {
      const updated = await khachHangService.collectDebt(String(debt.khachHang.id), {
        soTien: Number(payment.soTien), hinhThucTT: payment.hinhThucTT, ghiChu: payment.ghiChu.trim() || undefined,
      });
      setDebt(updated); setPayment({ soTien: '', hinhThucTT: 'tienmat', ghiChu: '' }); refetch();
    } catch (e: any) { setDebtError(e?.response?.data?.message ?? 'Không thể ghi nhận thu nợ.'); }
    finally { setCollecting(false); }
  };

  const columns: Column<KhachHang>[] = [
    { key: 'ten', title: 'Tên khách hàng' },
    { key: 'sdt', title: 'Số điện thoại' },
    { key: 'diaChi', title: 'Địa chỉ' },
    { key: 'tongNo', title: 'Còn nợ', render: (row) => <strong className={Number(row.tongNo) > 0 ? 'debt-value' : ''}>{money(Number(row.tongNo))}</strong> },
    { key: 'noQuaHan', title: 'Quá 30 ngày', render: (row) => Number(row.noQuaHan) > 0 ? <span className="status danger">{money(Number(row.noQuaHan))}</span> : '—' },
    {
      key: 'actions',
      title: 'Thao tác',
      render: (row) => (
        <div className="actions">
          <button className="btn small primary" onClick={() => void openDebt(row)}>Công nợ</button>
          <button className="btn small" onClick={() => { setEditing(row); setForm({ ten: row.ten, sdt: row.sdt ?? '', diaChi: row.diaChi ?? '' }); }}>Sửa</button>
          <button className="btn small danger" onClick={async () => { if (window.confirm('Xóa khách hàng?')) { await khachHangService.remove(row.id); refetch(); } }}>Xóa</button>
        </div>
      ),
    },
  ];

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <h2>Khách hàng</h2>
          <p>Lưu thông tin khách quen (tên, số điện thoại, địa chỉ).</p>
        </div>
      </div>
      <form className="inline-form" onSubmit={submit}>
        <InputField label="Tên" value={form.ten} onChange={(e) => setForm({ ...form, ten: e.target.value })} required />
        <InputField label="SĐT" value={form.sdt} onChange={(e) => setForm({ ...form, sdt: e.target.value })} />
        <InputField label="Địa chỉ" value={form.diaChi} onChange={(e) => setForm({ ...form, diaChi: e.target.value })} />
        <button className="btn primary">{editing ? 'Cập nhật' : 'Thêm mới'}</button>
        {editing && <button type="button" className="btn ghost" onClick={reset}>Hủy</button>}
      </form>
      {error && <div className="alert danger">{error}</div>}
      <DataTable columns={columns} data={data ?? []} loading={loading} rowKey={(row) => row.id} />
      {(debtLoading || debt || debtError) && <section className="card-form customer-debt-panel">
        {debtLoading ? <div className="skeleton-table"><div className="skeleton-row" /></div> : debt ? <>
          <div className="section-title"><div><h3>Công nợ · {debt.khachHang.ten}</h3><p>{debt.khachHang.sdt || 'Chưa có số điện thoại'} · {debt.khachHang.diaChi || 'Chưa có địa chỉ'}</p></div><button className="btn ghost" onClick={() => { setDebt(null); setDebtError(''); }}>Đóng</button></div>
          <div className="debt-metrics"><div><span>Tổng còn nợ</span><strong>{money(debt.tongNo)}</strong></div><div className={debt.noQuaHan > 0 ? 'danger' : ''}><span>Nợ quá 30 ngày</span><strong>{money(debt.noQuaHan)}</strong></div></div>
          {debt.tongNo > 0 && <form className="debt-collect-form" onSubmit={collectDebt}>
            <InputField label="Số tiền khách trả" type="number" min={1} max={debt.tongNo} value={payment.soTien} onChange={(e) => setPayment({ ...payment, soTien: e.target.value })} required />
            <label className="field"><span>Hình thức</span><select value={payment.hinhThucTT} onChange={(e) => setPayment({ ...payment, hinhThucTT: e.target.value as 'tienmat' | 'chuyenkhoan' })}><option value="tienmat">Tiền mặt</option><option value="chuyenkhoan">Chuyển khoản</option></select></label>
            <InputField label="Ghi chú" value={payment.ghiChu} onChange={(e) => setPayment({ ...payment, ghiChu: e.target.value })} placeholder="Có thể để trống" />
            <button className="btn primary" disabled={collecting}>{collecting ? 'Đang ghi nhận...' : 'Xác nhận thu nợ'}</button>
          </form>}
          {debtError && <div className="alert danger">{debtError}</div>}
          <div className="debt-columns">
            <div><h4>Hóa đơn mua chịu</h4><div className="table-wrap"><table className="data-table"><thead><tr><th>Hóa đơn</th><th>Ngày mua</th><th>Tổng tiền</th><th>Đã trả</th><th>Còn nợ</th></tr></thead><tbody>{debt.hoaDons.length ? debt.hoaDons.map((invoice) => <tr key={invoice.id}><td>#{invoice.id}</td><td>{new Date(invoice.ngayBan).toLocaleString('vi-VN')}</td><td>{money(invoice.tongTien)}</td><td>{money(invoice.soTienDaThanhToan)}</td><td><strong className={invoice.quaHan ? 'debt-value' : ''}>{money(invoice.conNo)}</strong>{invoice.quaHan && <small className="overdue-note">Quá 30 ngày</small>}</td></tr>) : <tr><td colSpan={5}>Chưa có hóa đơn mua chịu.</td></tr>}</tbody></table></div></div>
            <div><h4>Lịch sử thu nợ</h4><div className="table-wrap"><table className="data-table"><thead><tr><th>Thời gian</th><th>Số tiền</th><th>Hình thức</th><th>Người thu</th></tr></thead><tbody>{debt.lichSuThu.length ? debt.lichSuThu.map((item) => <tr key={item.id}><td>{new Date(item.ngayThu).toLocaleString('vi-VN')}</td><td><strong>{money(item.soTien)}</strong></td><td>{item.hinhThucTT === 'tienmat' ? 'Tiền mặt' : 'Chuyển khoản'}</td><td>{item.nguoiThu.hoTen}</td></tr>) : <tr><td colSpan={4}>Chưa phát sinh lần thu nợ nào.</td></tr>}</tbody></table></div></div>
          </div>
        </> : <div className="alert danger">{debtError}</div>}
      </section>}
    </section>
  );
}
