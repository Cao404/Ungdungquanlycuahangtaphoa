import React, { useRef, useState } from 'react';
import { uploadHinhAnh } from '../../services/upload.service';
import { resolveAssetUrl } from '../../services/api';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  error?: string;
}

export default function ImageUpload({
  value = '',
  onChange,
  label = 'Hình ảnh sản phẩm',
  error,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFileChange = async (file?: File) => {
    if (!file) return;

    // Kiểm tra định dạng ảnh
    if (!file.type.startsWith('image/')) {
      setUploadError('Vui lòng chọn file hình ảnh (JPG, PNG, WEBP, GIF)');
      return;
    }

    // Kiểm tra kích thước <= 10MB
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Kích thước ảnh tối đa là 10MB');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const result = await uploadHinhAnh(file);
      onChange(result.url);
    } catch (err: any) {
      setUploadError(
        err?.response?.data?.message ?? err.message ?? 'Không thể upload hình ảnh lên server'
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="field image-upload-field">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontWeight: 500, fontSize: '14px', color: '#334155' }}>{label}</span>
        <button
          type="button"
          className="btn-text-link"
          style={{ fontSize: '12px', color: '#0f766e', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          onClick={() => setShowUrlInput(!showUrlInput)}
        >
          {showUrlInput ? '← Ẩn ô nhập URL' : 'Hoặc nhập link URL ảnh'}
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileChange(e.target.files[0]);
          }
        }}
      />

      {/* Preview when image exists */}
      {value ? (
        <div className="image-preview-card">
          <div className="image-preview-wrapper">
            <img
              src={resolveAssetUrl(value)}
              alt="Ảnh sản phẩm"
              className="image-preview-thumb"
              onError={(e) => {
                // Fallback nếu link ảnh lỗi
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="1.5"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
              }}
            />
          </div>
          <div className="image-preview-info">
            <span className="image-preview-url" title={value}>
              {value.length > 55 ? `${value.substring(0, 52)}...` : value}
            </span>
            <div className="image-preview-actions">
              <button
                type="button"
                className="btn small"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? 'Đang tải...' : '📁 Đổi ảnh từ thư mục'}
              </button>
              <button
                type="button"
                className="btn small danger ghost"
                onClick={() => onChange('')}
              >
                Xóa ảnh
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Dropzone / Click to choose from folder */
        <div
          className={`image-dropzone ${isDragging ? 'dragging' : ''} ${uploading ? 'uploading' : ''}`}
          onClick={() => !uploading && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {uploading ? (
            <div className="dropzone-content">
              <div className="upload-spinner" />
              <p style={{ margin: '8px 0 0', fontWeight: 600, color: '#0f766e' }}>
                Đang tải ảnh lên server...
              </p>
            </div>
          ) : (
            <div className="dropzone-content">
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: '#0f766e', marginBottom: '8px' }}
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
              <p style={{ margin: 0, fontWeight: 600, color: '#1e293b' }}>
                Bấm để chọn ảnh từ thư mục máy tính
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                hoặc kéo thả file ảnh vào đây (JPG, PNG, WEBP tối đa 10MB)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Optional URL input toggle */}
      {showUrlInput && (
        <div style={{ marginTop: '8px' }}>
          <input
            type="text"
            placeholder="Dán link ảnh trực tiếp (VD: https://example.com/anh.jpg)..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{ width: '100%', fontSize: '13px', padding: '7px 10px' }}
          />
        </div>
      )}

      {(uploadError || error) && (
        <small className="field-error" style={{ color: '#dc2626', marginTop: '4px', display: 'block' }}>
          {uploadError || error}
        </small>
      )}
    </div>
  );
}
