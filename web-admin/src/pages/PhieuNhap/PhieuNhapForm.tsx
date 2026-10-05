import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputField from '../../components/form/InputField';
import { useFetch } from '../../hooks/useFetch';
import { nhaCungCapService } from '../../services/nhacungcap.service';
import { phieuNhapService } from '../../services/phieunhap.service';
import { sanPhamService } from '../../services/sanpham.service';
import { PhieuNhapChiTiet } from '../../types/SanPham';

const blankLine: PhieuNhapChiTiet = { bienTheId: '', soLuong: 1, giaNhap: 0, maLo: '', ngaySanXuat: '', hanSuDung: '' };

export default function PhieuNhapForm() {
  const navigate = useNavigate();
  const { data: nhaCungCaps } = useFetch(nhaCungCapService.getAll);
  const { data: sanPhams } = useFetch(sanPhamService.getAll);
  const [nhaCungCapId, setNhaCungCapId] = useState('');
  const [ghiChu, setGhiChu] = useState('');
  const [hinhThucTT, setHinhThucTT] = useState<'tienmat' | 'chuyenkhoan' | 'congno'>('tienmat');
  const [soTienDaThanhToan, setSoTienDaThanhToan] = useState(0);
  const [chiTiet, setChiTiet] = useState<PhieuNhapChiTiet[]>([{ ...blankLine }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bienTheOptions = useMemo(() => {
    return (sanPhams ?? []).flatMap((sp) =>
      (sp.bienThes ?? []).map((bt) => ({
        id: bt.id ?? '',
        label: `${sp.ten} - ${bt.tenBienThe ?? bt.donVi ?? 'Loại'}`,
        giaNhap: Number(bt.giaNhap),
      }))
    );
  }, [sanPhams]);

  const total = chiTiet.reduce((sum, row) => sum + Number(row.soLuong) * Number(row.giaNhap), 0);

  const updateLine = (index: number, patch: Partial<PhieuNhapChiTiet>) => {
    setChiTiet((current) => current.map((row, idx) => idx === index ? { ...row, ...patch } : row));
  };

  const chooseBienThe = (index: number, bienTheId: string) => {
    const option = bienTheOptions.find((item) => item.id === bienTheId);
    updateLine(index, { bienTheId, giaNhap: option?.giaNhap ?? 0 });
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (hinhThucTT === 'congno' && soTienDaThanhToan > total) throw new Error('Số tiền trả trước không được vượt quá tổng phiếu nhập');
      await phieuNhapService.create({ nhaCungCapId, ghiChu, hinhThucTT, soTienDaThanhToan: hinhThucTT === 'congno' ? soTienDaThanhToan : total, chiTiet });
      navigate('/phieu-nhap');
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e.message ?? 'Không tạo được phiếu nhập');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="page narrow">
      <div className="page-head">
        <div>
          <h2>Tạo phiếu nhập</h2>
          <p>Phiếu được lưu ở trạng thái nháp. Tồn kho chỉ thay đổi sau khi xác nhận.</p>
        </div>

        <div className="grid two">
          <label className="field"><span>Thanh toán nhà cung cấp</span><select value={hinhThucTT} onChange={(e) => setHinhThucTT(e.target.value as typeof hinhThucTT)}><option value="tienmat">Trả ngay bằng tiền mặt</option><option value="chuyenkhoan">Trả ngay bằng chuyển khoản</option><option value="congno">Mua nợ / trả một phần</option></select></label>
          {hinhThucTT === 'congno' && <InputField label="Số tiền trả trước" type="number" min={0} max={total} value={soTienDaThanhToan} onChange={(e) => setSoTienDaThanhToan(Number(e.target.value))} />}
        </div>
      </div>
      <form className="card-form" onSubmit={submit}>
        <div className="grid two">
          <label className="field">
            <span>Nhà cung cấp</span>
            <select value={nhaCungCapId} onChange={(e) => setNhaCungCapId(e.target.value)} required>
              <option value="">Chọn nhà cung cấp</option>
              {(nhaCungCaps ?? []).map((ncc) => <option key={ncc.id} value={ncc.id}>{ncc.ten}</option>)}
            </select>
          </label>
          <InputField label="Ghi chú" value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} />
        </div>

        <div className="section-title">
          <div><h3>Chi tiết nhập</h3><p>Hạn sử dụng thuộc từng lô nhập. Hàng không có hạn sử dụng có thể để trống.</p></div>
          <button type="button" className="btn" onClick={() => setChiTiet((rows) => [...rows, { ...blankLine }])}>Thêm dòng</button>
        </div>

        <div className="import-lines">
          {chiTiet.map((line, index) => (
            <div className="import-row" key={index}>
              <label className="field">
                <span>Loại</span>
                <select value={line.bienTheId} onChange={(e) => chooseBienThe(index, e.target.value)} required>
                  <option value="">Chọn loại</option>
                  {bienTheOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                </select>
              </label>
              <InputField label="Số lượng" type="number" min={1} value={line.soLuong} onChange={(e) => updateLine(index, { soLuong: Number(e.target.value) })} required />
              <InputField label="Giá nhập" type="number" min={1} value={line.giaNhap} onChange={(e) => updateLine(index, { giaNhap: Number(e.target.value) })} required />
              <InputField label="Mã lô" placeholder="Nếu có" value={line.maLo ?? ''} onChange={(e) => updateLine(index, { maLo: e.target.value })} />
              <InputField label="Ngày sản xuất" type="date" value={line.ngaySanXuat ?? ''} onChange={(e) => updateLine(index, { ngaySanXuat: e.target.value })} />
              <InputField label="Hạn sử dụng" type="date" value={line.hanSuDung ?? ''} onChange={(e) => updateLine(index, { hanSuDung: e.target.value })} />
              <strong>{(line.soLuong * line.giaNhap).toLocaleString('vi-VN')}đ</strong>
              <button type="button" className="btn danger" disabled={chiTiet.length === 1} onClick={() => setChiTiet((rows) => rows.filter((_, idx) => idx !== index))}>Xóa</button>
            </div>
          ))}
        </div>

        <div className="summary-line">
          <span>Tổng tiền</span>
          <strong>{total.toLocaleString('vi-VN')}đ</strong>
        </div>
        {error && <div className="alert danger">{error}</div>}
        <div className="form-actions">
          <button type="button" className="btn ghost" onClick={() => navigate('/phieu-nhap')}>Hủy</button>
          <button className="btn primary" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu phiếu nháp'}</button>
        </div>
      </form>
    </section>
  );
}
