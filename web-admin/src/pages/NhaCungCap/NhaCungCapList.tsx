import { FormEvent, useState } from 'react';
import DataTable, { Column } from '../../components/table/DataTable';
import InputField from '../../components/form/InputField';
import { useFetch } from '../../hooks/useFetch';
import { ChiTietCongNoNhaCungCap, nhaCungCapService } from '../../services/nhacungcap.service';
import { NhaCungCap } from '../../types/SanPham';

const money = (value: number) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;

export default function NhaCungCapList() {
  const { data, loading, error, refetch } = useFetch(nhaCungCapService.getAll);
  const [editing, setEditing] = useState<NhaCungCap | null>(null);
  const [form, setForm] = useState({ ten: '', sdt: '', diaChi: '' });
  const [debt, setDebt] = useState<ChiTietCongNoNhaCungCap | null>(null);
  const [debtLoading, setDebtLoading] = useState(false);
  const [debtError, setDebtError] = useState('');
  const [paying, setPaying] = useState(false);
  const [payment, setPayment] = useState({ soTien: '', hinhThucTT: 'tienmat' as 'tienmat' | 'chuyenkhoan', ghiChu: '' });

  const reset = () => { setEditing(null); setForm({ ten: '', sdt: '', diaChi: '' }); };
  const submit = async (event: FormEvent) => { event.preventDefault(); if (editing) await nhaCungCapService.update(editing.id, form); else await nhaCungCapService.create(form); reset(); refetch(); };
  const openDebt = async (supplier: NhaCungCap) => { setDebtLoading(true); setDebtError(''); try { setDebt(await nhaCungCapService.getDebt(supplier.id)); } catch (e: any) { setDebtError(e?.response?.data?.message ?? 'Không tải được công nợ nhà cung cấp.'); } finally { setDebtLoading(false); } };
  const payDebt = async (event: FormEvent) => { event.preventDefault(); if (!debt) return; setPaying(true); setDebtError(''); try { setDebt(await nhaCungCapService.payDebt(String(debt.nhaCungCap.id), { soTien: Number(payment.soTien), hinhThucTT: payment.hinhThucTT, ghiChu: payment.ghiChu.trim() || undefined })); setPayment({ soTien: '', hinhThucTT: 'tienmat', ghiChu: '' }); refetch(); } catch (e: any) { setDebtError(e?.response?.data?.message ?? 'Không thể ghi nhận trả nợ.'); } finally { setPaying(false); } };

  const columns: Column<NhaCungCap>[] = [
    { key: 'ten', title: 'Tên nhà cung cấp' }, { key: 'sdt', title: 'Số điện thoại' }, { key: 'diaChi', title: 'Địa chỉ' },
    { key: 'tongDaNhap', title: 'Tổng đã nhập', render: (row) => money(Number(row.tongDaNhap)) },
    { key: 'tongNo', title: 'Còn phải trả', render: (row) => <strong className={Number(row.tongNo) > 0 ? 'debt-value' : ''}>{money(Number(row.tongNo))}</strong> },
    { key: 'noQuaHan', title: 'Quá 30 ngày', render: (row) => Number(row.noQuaHan) > 0 ? <span className="status danger">{money(Number(row.noQuaHan))}</span> : '—' },
    { key: 'actions', title: 'Thao tác', render: (row) => <div className="actions"><button className="btn small primary" onClick={() => void openDebt(row)}>Công nợ</button><button className="btn small" onClick={() => { setEditing(row); setForm({ ten: row.ten, sdt: row.sdt ?? '', diaChi: row.diaChi ?? '' }); }}>Sửa</button><button className="btn small danger" disabled={Number(row.tongDaNhap) > 0} title={Number(row.tongDaNhap) > 0 ? 'Không thể xóa nhà cung cấp đã có lịch sử nhập hàng' : ''} onClick={async () => { if (window.confirm('Xóa nhà cung cấp?')) { await nhaCungCapService.remove(row.id); refetch(); } }}>Xóa</button></div> },
  ];

  return <section className="page"><div className="page-head"><div><h2>Nhà cung cấp</h2><p>Quản lý đối tác, lịch sử nhập hàng và số tiền cửa hàng còn phải trả.</p></div></div>
    <form className="inline-form" onSubmit={submit}><InputField label="Tên" value={form.ten} onChange={(e) => setForm({ ...form, ten: e.target.value })} required /><InputField label="SĐT" value={form.sdt} onChange={(e) => setForm({ ...form, sdt: e.target.value })} /><InputField label="Địa chỉ" value={form.diaChi} onChange={(e) => setForm({ ...form, diaChi: e.target.value })} /><button className="btn primary">{editing ? 'Cập nhật' : 'Thêm mới'}</button>{editing && <button type="button" className="btn ghost" onClick={reset}>Hủy</button>}</form>
    {error && <div className="alert danger">{error}</div>}<DataTable columns={columns} data={data ?? []} loading={loading} rowKey={(row) => row.id} />
    {(debtLoading || debt || debtError) && <section className="card-form customer-debt-panel">{debtLoading ? <div>Đang tải công nợ...</div> : debt ? <>
      <div className="section-title"><div><h3>Công nợ phải trả · {debt.nhaCungCap.ten}</h3><p>{debt.nhaCungCap.sdt || 'Chưa có SĐT'} · {debt.nhaCungCap.diaChi || 'Chưa có địa chỉ'}</p></div><button className="btn ghost" onClick={() => { setDebt(null); setDebtError(''); }}>Đóng</button></div>
      <div className="debt-metrics"><div><span>Tổng còn phải trả</span><strong>{money(debt.tongNo)}</strong></div><div className={debt.noQuaHan > 0 ? 'danger' : ''}><span>Nợ quá 30 ngày</span><strong>{money(debt.noQuaHan)}</strong></div></div>
      {debt.tongNo > 0 && <form className="debt-collect-form" onSubmit={payDebt}><InputField label="Số tiền trả" type="number" min={1} max={debt.tongNo} value={payment.soTien} onChange={(e) => setPayment({ ...payment, soTien: e.target.value })} required /><label className="field"><span>Hình thức</span><select value={payment.hinhThucTT} onChange={(e) => setPayment({ ...payment, hinhThucTT: e.target.value as 'tienmat' | 'chuyenkhoan' })}><option value="tienmat">Tiền mặt</option><option value="chuyenkhoan">Chuyển khoản</option></select></label><InputField label="Ghi chú" value={payment.ghiChu} onChange={(e) => setPayment({ ...payment, ghiChu: e.target.value })} /><button className="btn primary" disabled={paying}>{paying ? 'Đang ghi nhận...' : 'Xác nhận trả nợ'}</button></form>}
      {debtError && <div className="alert danger">{debtError}</div>}
      <div className="debt-columns"><div><h4>Phiếu nhập đã xác nhận</h4><div className="table-wrap"><table className="data-table"><thead><tr><th>Phiếu</th><th>Ngày nhập</th><th>Tổng</th><th>Đã trả</th><th>Còn nợ</th></tr></thead><tbody>{debt.phieuNhaps.length ? debt.phieuNhaps.map((row) => <tr key={row.id}><td>#{row.id}</td><td>{new Date(row.ngayNhap).toLocaleString('vi-VN')}</td><td>{money(row.tongTien)}</td><td>{money(row.soTienDaThanhToan)}</td><td><strong className={row.quaHan ? 'debt-value' : ''}>{money(row.conNo)}</strong>{row.quaHan && <small className="overdue-note">Quá 30 ngày</small>}</td></tr>) : <tr><td colSpan={5}>Chưa có phiếu nhập.</td></tr>}</tbody></table></div></div>
      <div><h4>Lịch sử thanh toán</h4><div className="table-wrap"><table className="data-table"><thead><tr><th>Thời gian</th><th>Số tiền</th><th>Hình thức</th><th>Người trả</th></tr></thead><tbody>{debt.lichSuTra.length ? debt.lichSuTra.map((item) => <tr key={item.id}><td>{new Date(item.ngayTra).toLocaleString('vi-VN')}</td><td><strong>{money(item.soTien)}</strong></td><td>{item.hinhThucTT === 'tienmat' ? 'Tiền mặt' : 'Chuyển khoản'}</td><td>{item.nguoiTra.hoTen}</td></tr>) : <tr><td colSpan={4}>Chưa có thanh toán.</td></tr>}</tbody></table></div></div></div>
    </> : <div className="alert danger">{debtError}</div>}</section>}
  </section>;
}
