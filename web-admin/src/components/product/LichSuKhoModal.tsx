import React, { useEffect, useState } from 'react';
import { BienThe, GiaoDichKho } from '../../types/SanPham';
import { sanPhamService } from '../../services/sanpham.service';
import { formatBienTheName } from './BienTheTooltip';

interface LichSuKhoModalProps {
  isOpen: boolean;
  onClose: () => void;
  bienThe: BienThe | null;
  sanPhamTen?: string;
}

export default function LichSuKhoModal({
  isOpen,
  onClose,
  bienThe,
  sanPhamTen,
}: LichSuKhoModalProps) {
  const [logs, setLogs] = useState<GiaoDichKho[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !bienThe?.id) {
      setLogs([]);
      return;
    }

    setLoading(true);
    setError(null);
    sanPhamService
      .getLichSuKho(bienThe.id)
      .then((data) => setLogs(data ?? []))
      .catch((err: any) => {
        setError(err?.response?.data?.message ?? err.message ?? 'Không thể tải lịch sử kho');
      })
      .finally(() => setLoading(false));
  }, [isOpen, bienThe?.id]);

  if (!isOpen || !bienThe) return null;

  const renderLoaiGiaoDich = (loai: string) => {
    switch (loai) {
      case 'nhap_hang':
        return <span className="stock-tx-badge tx-nhap">Nhập hàng</span>;
      case 'ban_hang':
        return <span className="stock-tx-badge tx-ban">Bán hàng</span>;
      case 'kiem_ke':
        return <span className="stock-tx-badge tx-kiemke">Kiểm kê kho</span>;
      case 'tra_hang':
        return <span className="stock-tx-badge tx-trahang">Trả hàng</span>;
      default:
        return <span className="stock-tx-badge tx-other">{loai}</span>;
    }
  };

  const variantDisplayName = formatBienTheName(bienThe);

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-box modal-box-large"
        onClick={(e) => e.stopPropagation()}
        style={{ width: 'min(860px, 95vw)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        <div className="modal-header" style={{ justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0' }}>
          <div>
            <h3 className="modal-title" style={{ fontSize: '18px' }}>
              Lịch sử biến động kho
            </h3>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>
              Sản phẩm: <strong>{sanPhamTen || 'Sản phẩm'}</strong> | Loại: <strong>{variantDisplayName}</strong> | Tồn hiện tại: <strong style={{ color: '#0f766e' }}>{Number(bienThe.soLuongTon).toLocaleString('vi-VN')}</strong>
            </p>
          </div>
          <button
            type="button"
            className="btn ghost small"
            onClick={onClose}
            style={{ fontSize: '18px', lineHeight: 1, padding: '4px 10px' }}
          >
            ✕
          </button>
        </div>

        <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
              Đang tải lịch sử kho...
            </div>
          )}

          {error && (
            <div className="alert danger" style={{ margin: '12px 0' }}>
              {error}
            </div>
          )}

          {!loading && !error && logs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: '#94a3b8' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 12px', display: 'block' }}>
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Loại này chưa có giao dịch kho nào được ghi nhận.
            </div>
          )}

          {!loading && !error && logs.length > 0 && (
            <div className="table-responsive" style={{ maxHeight: '420px', overflowY: 'auto' }}>
              <table className="data-table" style={{ fontSize: '13px', width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ width: '150px' }}>Thời gian</th>
                    <th style={{ width: '120px' }}>Loại giao dịch</th>
                    <th style={{ width: '90px', textAlign: 'right' }}>Thay đổi</th>
                    <th style={{ width: '130px', textAlign: 'center' }}>Tồn trước → sau</th>
                    <th style={{ width: '140px' }}>Người thực hiện</th>
                    <th>Ghi chú / Tham chiếu</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const isPositive = log.soLuongThayDoi > 0;
                    const isNegative = log.soLuongThayDoi < 0;

                    return (
                      <tr key={log.id}>
                        <td style={{ color: '#475569' }}>
                          {new Date(log.thoiGian).toLocaleString('vi-VN')}
                        </td>
                        <td>{renderLoaiGiaoDich(log.loaiGiaoDich)}</td>
                        <td
                          style={{
                            textAlign: 'right',
                            fontWeight: 700,
                            color: isPositive ? '#16a34a' : isNegative ? '#dc2626' : '#64748b',
                          }}
                        >
                          {isPositive ? `+${log.soLuongThayDoi}` : log.soLuongThayDoi}
                        </td>
                        <td style={{ textAlign: 'center', color: '#334155' }}>
                          <span style={{ color: '#64748b' }}>{log.soLuongTruoc}</span>
                          {' → '}
                          <strong style={{ color: '#0f172a' }}>{log.soLuongSau}</strong>
                        </td>
                        <td style={{ color: '#334155' }}>
                          {log.nguoiThucHien?.hoTen || log.nguoiThucHien?.taiKhoan || 'Hệ thống'}
                        </td>
                        <td style={{ color: '#64748b', fontSize: '12px' }}>
                          {log.ghiChu || (log.thamChieuLoai ? `${log.thamChieuLoai} #${log.thamChieuId}` : '—')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="modal-actions" style={{ borderTop: '1px solid #e2e8f0', padding: '12px 24px' }}>
          <button type="button" className="btn ghost" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
