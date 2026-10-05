import { Warning } from '@phosphor-icons/react';
import React, { useEffect } from 'react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title = 'Xác nhận hành động',
  message,
  confirmLabel = 'Xóa',
  cancelLabel = 'Hủy',
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Đóng dialog khi nhấn phím Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={() => !loading && onCancel()}
      aria-modal="true"
      role="dialog"
    >
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          {danger && (
            <div className="modal-icon-danger" aria-hidden="true">
              <Warning size={22} weight="regular" />
            </div>
          )}
          <h3 className="modal-title">{title}</h3>
        </div>

        <div className="modal-body">
          <div className="modal-message">{message}</div>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn ghost"
            disabled={loading}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn ${danger ? 'danger' : 'primary'}`}
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? 'Đang xóa...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
