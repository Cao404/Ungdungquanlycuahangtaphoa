import { useEffect, useMemo, useState } from 'react';
import { Check, MagnifyingGlass, Plus, WarningCircle, X } from '@phosphor-icons/react';
import { useFetch } from '../../hooks/useFetch';
import { kiemKeService } from '../../services/kiemke.service';
import type { KiemKeNguon, PhieuKiemKe } from '../../types/SanPham';

const statusLabel: Record<string, string> = {
  cho_duyet: 'Chờ duyệt',
  da_duyet: 'Đã duyệt',
  tu_choi: 'Từ chối',
};

const discrepancyReasons = [
  'Hàng hỏng hoặc hết hạn',
  'Mất mát hoặc thất thoát',
  'Bán hàng chưa ghi nhận',
  'Nhập hàng chưa ghi nhận',
  'Sai đơn vị hoặc quy cách',
  'Sai lệch từ lần kiểm kê trước',
  'Đếm nhầm và đã kiểm tra lại',
  'Nguyên nhân khác',
];

export default function KiemKeKho() {
  const [tab, setTab] = useState<'create' | 'pending' | 'history'>('create');
  const [actuals, setActuals] = useState<Record<number, number>>({});
  const [reasons, setReasons] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [query, setQuery] = useState('');
  const [note, setNote] = useState('');
  const [selected, setSelected] = useState<PhieuKiemKe | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const source = useFetch(() => kiemKeService.getSource(), []);
  const pending = useFetch(() => kiemKeService.getAll('cho_duyet'), []);
  const history = useFetch(() => kiemKeService.getAll(), []);

  useEffect(() => {
    if (tab === 'history') history.refetch();
  }, [tab]);

  const refresh = () => {
    pending.refetch();
    history.refetch();
    source.refetch();
  };

  const products = useMemo(
    () => (source.data ?? []).filter((item) =>
      `${item.tenSanPham} ${item.danhMuc}`.toLocaleLowerCase().includes(query.toLocaleLowerCase())
    ),
    [source.data, query]
  );

  const sourceById = useMemo(
    () => new Map((source.data ?? []).map((item) => [item.id, item])),
    [source.data]
  );

  const missingReasonIds = useMemo(
    () => Array.from(checked).filter((id) => {
      const item = sourceById.get(id);
      if (!item) return false;
      const actual = actuals[id] ?? item.soLuongTon;
      return actual !== item.soLuongTon && !reasons[id]?.trim();
    }),
    [actuals, checked, reasons, sourceById]
  );

  const updateSelected = (item: KiemKeNguon) => {
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(item.id)) {
        next.delete(item.id);
      } else {
        next.add(item.id);
        setActuals((values) => ({ ...values, [item.id]: values[item.id] ?? item.soLuongTon }));
      }
      return next;
    });
  };

  const selectAll = () => {
    setChecked(new Set(products.map((item) => item.id)));
    setActuals((current) => Object.fromEntries(
      products.map((item) => [item.id, current[item.id] ?? item.soLuongTon])
    ));
  };

  const create = async () => {
    if (!checked.size) {
      setError('Chọn ít nhất một loại hàng để tạo phiếu kiểm kê.');
      return;
    }
    if (missingReasonIds.length) {
      setError(`Cần nhập nguyên nhân cho ${missingReasonIds.length} mặt hàng đang có chênh lệch.`);
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const created = await kiemKeService.create({
        ghiChu: note.trim() || undefined,
        chiTiet: Array.from(checked).map((id) => {
          const item = sourceById.get(id)!;
          const soLuongThucTe = actuals[id] ?? item.soLuongTon;
          return {
            bienTheId: id,
            soLuongThucTe,
            nguyenNhanChenhLech: soLuongThucTe === item.soLuongTon
              ? undefined
              : reasons[id]?.trim(),
          };
        }),
      });
      setChecked(new Set());
      setActuals({});
      setReasons({});
      setNote('');
      setTab(created.trangThai === 'da_duyet' ? 'history' : 'pending');
      refresh();
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message ?? 'Không thể tạo phiếu kiểm kê.');
    } finally {
      setSubmitting(false);
    }
  };

  const open = async (item: PhieuKiemKe) => {
    try {
      setSelected(await kiemKeService.getById(item.id));
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message ?? 'Không thể tải phiếu kiểm kê.');
    }
  };

  const approve = async () => {
    if (!selected || !window.confirm(`Xác nhận phiếu #${selected.id}? Tồn kho sẽ được điều chỉnh.`)) return;
    try {
      await kiemKeService.approve(selected.id);
      setSelected(null);
      refresh();
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message ?? 'Không thể xác nhận phiếu.');
    }
  };

  const reject = async () => {
    if (!selected) return;
    const rejectionReason = window.prompt(`Nhập lý do từ chối phiếu #${selected.id}:`);
    if (rejectionReason === null) return;
    if (!rejectionReason.trim()) {
      setError('Lý do từ chối không được để trống.');
      return;
    }
    try {
      await kiemKeService.reject(selected.id, rejectionReason.trim());
      setSelected(null);
      refresh();
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message ?? 'Không thể từ chối phiếu.');
    }
  };

  const rows = tab === 'pending' ? pending.data : history.data;

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <h2>Kiểm kê kho</h2>
          <p>Đối chiếu tồn thực tế, ghi nhận nguyên nhân chênh lệch và chờ xác nhận điều chỉnh kho.</p>
        </div>
      </div>

      <div className="inventory-tabs">
        <button className={`tab-btn ${tab === 'create' ? 'active' : ''}`} onClick={() => setTab('create')}>
          <Plus size={17} /> Tạo phiếu kiểm kê
        </button>
        <button className={`tab-btn ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>
          Chờ duyệt {pending.data ? `(${pending.data.length})` : ''}
        </button>
        <button className={`tab-btn ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>
          Lịch sử
        </button>
      </div>

      {error && (
        <div className="alert danger">
          <WarningCircle size={20} /> {error}
          <button className="btn ghost small" onClick={() => setError('')}>Đóng</button>
        </div>
      )}

      {tab === 'create' && (
        <>
          <div className="audit-controls-bar">
            <div className="search-filter-group">
              <MagnifyingGlass size={18} />
              <input
                className="audit-search-input"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm sản phẩm hoặc danh mục"
              />
            </div>
            <button className="btn ghost small" onClick={selectAll}>Chọn tất cả</button>
          </div>

          <datalist id="inventory-discrepancy-reasons">
            {discrepancyReasons.map((reason) => <option value={reason} key={reason} />)}
          </datalist>

          {source.loading ? (
            <div className="skeleton-table"><div className="skeleton-row" /><div className="skeleton-row" /></div>
          ) : !products.length ? (
            <div className="empty-state">
              <WarningCircle size={48} weight="duotone" />
              <h3>Không có hàng để kiểm kê</h3>
              <p>Chưa có biến thể sản phẩm đang hoạt động.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table inventory-create-table">
                <thead>
                  <tr>
                    <th></th><th>Sản phẩm</th><th>Loại</th><th>Danh mục</th>
                    <th>Tồn hệ thống</th><th>Tồn thực tế</th><th>Chênh lệch</th><th>Nguyên nhân</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((item) => {
                    const selectedRow = checked.has(item.id);
                    const actual = actuals[item.id] ?? item.soLuongTon;
                    const diff = actual - item.soLuongTon;
                    const needsReason = selectedRow && diff !== 0;
                    return (
                      <tr key={item.id} className={needsReason ? 'row-diff' : ''}>
                        <td>
                          <input type="checkbox" aria-label={`Chọn ${item.tenSanPham}`} checked={selectedRow} onChange={() => updateSelected(item)} />
                        </td>
                        <td><strong>{item.tenSanPham}</strong></td>
                        <td>{item.giaTri} {item.donVi}</td>
                        <td>{item.danhMuc}</td>
                        <td>{item.soLuongTon}</td>
                        <td>
                          <input
                            className="actual-stock-input"
                            type="number"
                            min="0"
                            disabled={!selectedRow}
                            value={actual}
                            onFocus={(event) => event.currentTarget.select()}
                            onChange={(event) => setActuals((values) => ({
                              ...values,
                              [item.id]: Math.max(0, Number(event.target.value)),
                            }))}
                          />
                        </td>
                        <td>
                          {selectedRow
                            ? <span className={`diff-badge ${diff === 0 ? 'diff-zero' : diff > 0 ? 'diff-positive' : 'diff-negative'}`}>{diff > 0 ? `+${diff}` : diff}</span>
                            : 'Chưa chọn'}
                        </td>
                        <td>
                          {needsReason ? (
                            <input
                              className={`inventory-reason-input ${!reasons[item.id]?.trim() ? 'invalid' : ''}`}
                              list="inventory-discrepancy-reasons"
                              value={reasons[item.id] ?? ''}
                              onChange={(event) => setReasons((values) => ({ ...values, [item.id]: event.target.value }))}
                              placeholder={diff < 0 ? 'Vì sao bị thiếu?' : 'Vì sao bị dư?'}
                              maxLength={255}
                            />
                          ) : (
                            <span className="inventory-reason-empty">{selectedRow ? 'Không chênh lệch' : '—'}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="audit-submit-card">
            <label className="field" style={{ flex: 1 }}>
              <span>Ghi chú kiểm kê</span>
              <textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ví dụ: kiểm kê cuối ngày" />
            </label>
            <div>
              <strong>{checked.size} loại hàng đã chọn</strong>
              {missingReasonIds.length > 0 && <small className="inventory-missing-reason">Còn {missingReasonIds.length} mặt hàng chưa có nguyên nhân</small>}
              <button className="btn primary" disabled={!checked.size || submitting || missingReasonIds.length > 0} onClick={() => void create()}>
                <Check size={18} /> {submitting ? 'Đang tạo...' : 'Tạo phiếu kiểm kê'}
              </button>
            </div>
          </div>
        </>
      )}

      {tab !== 'create' && (
        (tab === 'pending' ? pending.loading : history.loading) ? (
          <div className="skeleton-table"><div className="skeleton-row" /></div>
        ) : !rows?.length ? (
          <div className="empty-state">
            <WarningCircle size={48} weight="duotone" />
            <h3>Chưa có phiếu kiểm kê</h3>
            <p>Hãy tạo phiếu mới để đối chiếu tồn kho thực tế.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead><tr><th>Mã phiếu</th><th>Ngày</th><th>Người tạo</th><th>Mặt hàng</th><th>Chênh lệch</th><th>Trạng thái</th><th></th></tr></thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id}>
                    <td><strong>#{item.id}</strong></td>
                    <td>{new Date(item.ngayKiemKe).toLocaleString('vi-VN')}</td>
                    <td>{item.nguoiTao?.hoTen || item.nguoiTao?.taiKhoan}</td>
                    <td>{item.tongSoMatHang ?? item.chiTiets?.length ?? 0}</td>
                    <td>{item.soMatHangLech ?? 'Chưa xử lý'}</td>
                    <td><span className="badge-tag">{statusLabel[item.trangThai]}</span></td>
                    <td><button className="btn small" onClick={() => void open(item)}>Xem</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal-box modal-box-large inventory-detail-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Phiếu kiểm kê #{selected.id}</h3>
                {selected.lyDoTuChoi && <p className="inventory-rejection-reason">Lý do từ chối: {selected.lyDoTuChoi}</p>}
              </div>
              <button className="btn ghost small" onClick={() => setSelected(null)} aria-label="Đóng"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="table-responsive">
                <table className="data-table">
                  <thead><tr><th>Sản phẩm</th><th>Loại</th><th>Tồn hệ thống</th><th>Tồn thực tế</th><th>Chênh lệch</th><th>Nguyên nhân</th></tr></thead>
                  <tbody>
                    {selected.chiTiets?.map((detail) => {
                      const variant = detail.bienThe;
                      const diff = detail.chenhLech ?? detail.soLuongThucTe - detail.soLuongHeThong;
                      return (
                        <tr key={detail.id}>
                          <td>{variant?.sanPham?.ten}</td>
                          <td>{variant?.giaTri} {variant?.donVi}</td>
                          <td>{detail.soLuongHeThong}</td>
                          <td><strong>{detail.soLuongThucTe}</strong></td>
                          <td><span className={`diff-badge ${diff === 0 ? 'diff-zero' : diff > 0 ? 'diff-positive' : 'diff-negative'}`}>{diff > 0 ? `+${diff}` : diff}</span></td>
                          <td>{detail.nguyenNhanChenhLech || (diff === 0 ? 'Không chênh lệch' : 'Chưa ghi nhận (phiếu cũ)')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-actions inventory-modal-actions">
              <button className="btn ghost" onClick={() => setSelected(null)}>Đóng</button>
              {selected.trangThai === 'cho_duyet' && (
                <>
                  <button className="btn danger" onClick={() => void reject()}>Từ chối phiếu</button>
                  <button className="btn primary" onClick={() => void approve()}>Xác nhận điều chỉnh kho</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
