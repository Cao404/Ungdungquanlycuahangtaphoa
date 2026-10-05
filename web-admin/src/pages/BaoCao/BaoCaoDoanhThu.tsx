import { FormEvent, useState } from 'react';
import DataTable, { Column } from '../../components/table/DataTable';
import InputField from '../../components/form/InputField';
import { baoCaoService } from '../../services/baocao.service';
import { DoanhThuBaoCao, SanPhamBanChay } from '../../types/HoaDon';

const today = new Date().toISOString().slice(0, 10);

export default function BaoCaoDoanhThu() {
  const [tuNgay, setTuNgay] = useState(today);
  const [denNgay, setDenNgay] = useState(today);
  const [doanhThu, setDoanhThu] = useState<DoanhThuBaoCao | null>(null);
  const [banChay, setBanChay] = useState<SanPhamBanChay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReport = async (event?: FormEvent) => {
    event?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const [revenue, top] = await Promise.all([
        baoCaoService.doanhThu(tuNgay, denNgay),
        baoCaoService.banChay(tuNgay, denNgay),
      ]);
      setDoanhThu(revenue);
      setBanChay(top);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e.message ?? 'Không tải được báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<SanPhamBanChay>[] = [
    { key: 'tenSanPham', title: 'Sản phẩm' },
    { key: 'tenBienThe', title: 'Loại' },
    { key: 'tongSoLuong', title: 'Số lượng bán' },
    { key: 'tongDoanhThu', title: 'Doanh thu', render: (row) => `${Number(row.tongDoanhThu).toLocaleString('vi-VN')}đ` },
  ];

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <h2>Báo cáo doanh thu</h2>
          <p>Chọn khoảng ngày để xem doanh thu và top sản phẩm bán chạy.</p>
        </div>
      </div>
      <form className="inline-form" onSubmit={loadReport}>
        <InputField label="Từ ngày" type="date" value={tuNgay} onChange={(e) => setTuNgay(e.target.value)} required />
        <InputField label="Đến ngày" type="date" value={denNgay} onChange={(e) => setDenNgay(e.target.value)} required />
        <button className="btn primary" disabled={loading}>{loading ? 'Đang tải...' : 'Xem báo cáo'}</button>
      </form>
      {error && <div className="alert danger">{error}</div>}
      {doanhThu && (
        <div className="metrics">
          <div className="metric-card">
            <span>Số hóa đơn</span>
            <strong>{doanhThu.soHoaDon}</strong>
          </div>
          <div className="metric-card">
            <span>Tổng doanh thu</span>
            <strong>{Number(doanhThu.tongDoanhThu).toLocaleString('vi-VN')}đ</strong>
          </div>
        </div>
      )}
      <h3>Top bán chạy</h3>
      <DataTable columns={columns} data={banChay} loading={loading} rowKey={(row) => row.bienTheId} />
    </section>
  );
}
