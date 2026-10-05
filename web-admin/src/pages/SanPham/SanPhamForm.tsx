import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Barcode } from '@phosphor-icons/react';
import { useNavigate, useParams } from 'react-router-dom';
import InputField from '../../components/form/InputField';
import ImageUpload from '../../components/form/ImageUpload';
import BarcodeScannerModal from '../../components/product/BarcodeScannerModal';
import { sanPhamService } from '../../services/sanpham.service';
import { BienThe } from '../../types/SanPham';

type EditableBienThe = Omit<BienThe, 'giaTri' | 'giaNhap' | 'giaBan' | 'nguongCanhBao'> & {
  giaTri: string;
  giaNhap: string;
  giaBan: string;
  nguongCanhBao: string;
};

const blankBienThe: EditableBienThe = {
  tenBienThe: '',
  giaTri: '',
  donVi: 'Cái',
  giaNhap: '',
  giaBan: '',
  soLuongTon: 0,
  nguongCanhBao: '5',
  barcode: '',
};

const toEditableBienThe = (bienThe: BienThe): EditableBienThe => ({
  ...bienThe,
  giaTri: bienThe.giaTri == null ? '' : String(bienThe.giaTri),
  giaNhap: bienThe.giaNhap == null ? '' : String(bienThe.giaNhap),
  giaBan: bienThe.giaBan == null ? '' : String(bienThe.giaBan),
  nguongCanhBao: bienThe.nguongCanhBao == null ? '5' : String(bienThe.nguongCanhBao),
});

const toBienThePayload = (bienThe: EditableBienThe): BienThe => ({
  ...bienThe,
  giaTri: Number(bienThe.giaTri || 0),
  giaNhap: Number(bienThe.giaNhap || 0),
  giaBan: Number(bienThe.giaBan || 0),
  nguongCanhBao: Number(bienThe.nguongCanhBao || 0),
});

export default function SanPhamForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ten, setTen] = useState('');
  const [thuongHieu, setThuongHieu] = useState('');
  const [danhMuc, setDanhMuc] = useState('');
  const [hinhAnh, setHinhAnh] = useState('');
  const [moTa, setMoTa] = useState('');
  const [bienThes, setBienThes] = useState<EditableBienThe[]>([{ ...blankBienThe }]);
  const [scanningIndex, setScanningIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    sanPhamService.getById(id).then((sanPham) => {
      setTen(sanPham.ten);
      setThuongHieu(sanPham.thuongHieu ?? '');
      setDanhMuc(sanPham.danhMuc);
      setHinhAnh(sanPham.hinhAnh ?? '');
      setMoTa(sanPham.moTa ?? '');
      setBienThes(sanPham.bienThes?.length ? sanPham.bienThes.map(toEditableBienThe) : [{ ...blankBienThe }]);
    });
  }, [id]);

  const updateBienThe = (index: number, patch: Partial<EditableBienThe>) => {
    setBienThes((current) => current.map((item, idx) => idx === index ? { ...item, ...patch } : item));
  };

  const addBienThe = () => setBienThes((current) => [...current, { ...blankBienThe }]);

  const handleBarcodeDetected = useCallback((barcode: string) => {
    setBienThes((current) => current.map((item, index) => (
      index === scanningIndex ? { ...item, barcode } : item
    )));
    setScanningIndex(null);
  }, [scanningIndex]);

  const removeBienThe = async (index: number) => {
    const target = bienThes[index];
    if (target.id && window.confirm('Xóa loại này khỏi hệ thống?')) {
      await sanPhamService.removeBienThe(target.id);
    }
    setBienThes((current) => current.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    const barcodes = bienThes.map((item) => item.barcode?.trim()).filter((value): value is string => Boolean(value));
    const duplicateBarcode = barcodes.find((barcode, index) => barcodes.indexOf(barcode) !== index);
    if (duplicateBarcode) {
      setError(`Mã vạch ${duplicateBarcode} đang được dùng cho nhiều loại. Mỗi mã chỉ được gán cho một loại bán hàng.`);
      return;
    }

    setLoading(true);
    try {
      const payload = { ten, thuongHieu, danhMuc, hinhAnh, moTa, bienThes: bienThes.map(toBienThePayload) };
      if (id) await sanPhamService.update(id, payload);
      else await sanPhamService.create(payload);
      navigate('/san-pham');
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e.message ?? 'Không lưu được sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page narrow">
      <div className="page-head">
        <div>
          <h2>{id ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h2>
          <p>Thông tin sản phẩm và danh sách loại bán hàng.</p>
        </div>
      </div>
      <form className="card-form" onSubmit={handleSubmit}>
        <div className="grid two">
          <InputField label="Tên sản phẩm" value={ten} onChange={(e) => setTen(e.target.value)} required />
          <InputField label="Thương hiệu" value={thuongHieu} onChange={(e) => setThuongHieu(e.target.value)} />
          <InputField label="Danh mục" value={danhMuc} onChange={(e) => setDanhMuc(e.target.value)} required />
          <ImageUpload label="Hình ảnh sản phẩm" value={hinhAnh} onChange={setHinhAnh} />
        </div>
        <label className="field">
          <span>Mô tả</span>
          <textarea value={moTa} onChange={(e) => setMoTa(e.target.value)} rows={3} />
        </label>

        <div className="section-title">
          <div>
            <h3>Loại</h3>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>
              Mỗi lon, chai, gói hoặc quy cách bán dùng một mã vạch riêng. Hàng rời không có mã có thể để trống.
            </p>
          </div>
          <button type="button" className="btn" onClick={addBienThe}>Thêm dòng</button>
        </div>

        <div className="variant-list">
          {bienThes.map((bienThe, index) => (
            <div className="variant-row" key={bienThe.id ?? index}>
              <InputField label="Tên loại" value={bienThe.tenBienThe ?? ''} onChange={(e) => updateBienThe(index, { tenBienThe: e.target.value })} placeholder="VD: 1 Lít" />
              <InputField label="Giá trị" type="number" min="0" value={bienThe.giaTri} onFocus={(e) => e.currentTarget.select()} onChange={(e) => updateBienThe(index, { giaTri: e.target.value })} placeholder="0" />
              <InputField label="Đơn vị" value={bienThe.donVi ?? ''} onChange={(e) => updateBienThe(index, { donVi: e.target.value })} />
              <div className="barcode-input-group">
                <InputField
                  label="Mã vạch"
                  value={bienThe.barcode ?? ''}
                  onChange={(e) => updateBienThe(index, { barcode: e.target.value })}
                  placeholder="Quét hoặc nhập mã"
                  maxLength={64}
                  autoComplete="off"
                  inputMode="numeric"
                />
                <button type="button" className="btn barcode-scan-button" onClick={() => setScanningIndex(index)} title="Quét mã bằng camera">
                  <Barcode size={20} />
                  <span>Quét</span>
                </button>
              </div>
              <InputField label="Giá nhập" type="number" min="0" value={bienThe.giaNhap} onFocus={(e) => e.currentTarget.select()} onChange={(e) => updateBienThe(index, { giaNhap: e.target.value })} placeholder="0" />
              <InputField label="Giá bán" type="number" min="0" value={bienThe.giaBan} onFocus={(e) => e.currentTarget.select()} onChange={(e) => updateBienThe(index, { giaBan: e.target.value })} placeholder="0" />
              <div className="field">
                <span>Tồn kho</span>
                <input
                  type={id ? 'number' : 'text'}
                  value={id ? bienThe.soLuongTon : '0 (Khởi tạo)'}
                  disabled
                  readOnly
                  style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#475569', fontWeight: 600 }}
                />
                <small style={{ color: id ? '#64748b' : '#059669', fontSize: '11px', marginTop: '4px', lineHeight: 1.3, display: 'block' }}>
                  {id ? 'Chỉ cập nhật qua Nhập hàng / Kiểm kê' : 'Tồn kho ban đầu = 0, sẽ được cập nhật qua Nhập hàng'}
                </small>
              </div>
              <InputField label="Cảnh báo" type="number" min="0" value={bienThe.nguongCanhBao} onFocus={(e) => e.currentTarget.select()} onChange={(e) => updateBienThe(index, { nguongCanhBao: e.target.value })} placeholder="5" />
              <button type="button" className="btn danger" onClick={() => removeBienThe(index)} disabled={bienThes.length === 1}>Xóa</button>
            </div>
          ))}
        </div>

        {error && <div className="alert danger">{error}</div>}
        <div className="form-actions">
          <button type="button" className="btn ghost" onClick={() => navigate('/san-pham')}>Hủy</button>
          <button className="btn primary" disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu sản phẩm'}</button>
        </div>
      </form>
      {scanningIndex !== null && (
        <BarcodeScannerModal onDetected={handleBarcodeDetected} onClose={() => setScanningIndex(null)} />
      )}
    </section>
  );
}
