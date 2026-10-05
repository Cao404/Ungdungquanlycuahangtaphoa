import React from 'react';
import { BienThe } from '../../types/SanPham';

interface BienTheTooltipProps {
  bienThes?: BienThe[];
  onViewLichSu?: (bt: BienThe) => void;
}

export function formatBienTheName(bt: BienThe): string {
  if (bt.tenBienThe && bt.tenBienThe.trim()) return bt.tenBienThe.trim();
  const val = bt.giaTri !== undefined && bt.giaTri !== null ? String(bt.giaTri) : '';
  const unit = bt.donVi || bt.donViTinh || '';
  const combined = `${val} ${unit}`.trim();
  return combined || 'Mặc định';
}

export default function BienTheTooltip({ bienThes = [], onViewLichSu }: BienTheTooltipProps) {
  if (!bienThes || bienThes.length === 0) {
    return <span className="variant-tag empty">0 dòng</span>;
  }

  return (
    <div className="variant-tooltip-wrapper">
      <span className="variant-badge-btn" tabIndex={0}>
        <span>{bienThes.length} dòng</span>
        <svg
          className="variant-info-icon"
          viewBox="0 0 24 24"
          width="13"
          height="13"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      </span>

      <div className="variant-popover" role="tooltip">
        <div className="variant-popover-header">
          <strong>Chi tiết loại ({bienThes.length})</strong>
        </div>
        <ul className="variant-popover-list">
          {bienThes.map((bt, index) => {
            const name = formatBienTheName(bt);
            const price = Number(bt.giaBan).toLocaleString('vi-VN') + 'đ';
            const isLowStock = Number(bt.soLuongTon) <= Number(bt.nguongCanhBao);

            return (
              <li key={bt.id ?? index} className="variant-popover-item">
                <span className="variant-item-bullet">•</span>
                <span className="variant-item-name">{name}</span>
                <span className="variant-item-dash">-</span>
                <strong className="variant-item-price">{price}</strong>
                <span className={`variant-item-barcode ${bt.barcode ? '' : 'missing'}`}>
                  {bt.barcode ? `Mã: ${bt.barcode}` : 'Chưa có mã'}
                </span>
                {isLowStock && (
                  <span
                    className="variant-item-stock-warn"
                    title={`Tồn kho (${bt.soLuongTon}) <= Ngưỡng cảnh báo (${bt.nguongCanhBao})`}
                  >
                    (còn {bt.soLuongTon})
                  </span>
                )}
                {onViewLichSu && bt.id && (
                  <button
                    type="button"
                    className="variant-history-btn"
                    title="Xem lịch sử biến động kho"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewLichSu(bt);
                    }}
                  >
                    Lịch sử kho
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
