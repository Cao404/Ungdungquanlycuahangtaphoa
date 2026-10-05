import { 
  Sparkle, 
  Lightning, 
  Heart, 
  CheckCircle,
  Warning,
  X,
  Info
} from '@phosphor-icons/react';
import { useState } from 'react';

export default function DesignShowcase() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="content">
      <div className="page">
        <div className="page-head">
          <div>
            <h2 className="text-balance">Design Showcase</h2>
            <p>Premium UI components với taste skill enhancements</p>
          </div>
        </div>

        {/* Buttons Section */}
        <section className="card-form stagger-in">
          <h3 className="section-title">
            <span>Buttons với Spring Physics</span>
          </h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="btn primary">
              <Sparkle size={18} weight="fill" />
              Primary Action
            </button>
            <button className="btn">
              <Lightning size={18} />
              Secondary
            </button>
            <button className="btn ghost">
              Ghost Button
            </button>
            <button className="btn danger">
              <X size={18} weight="bold" />
              Delete
            </button>
            <button className="btn small">
              Small Size
            </button>
          </div>
        </section>

        {/* Badges Section */}
        <section className="card-form stagger-in">
          <h3 className="section-title">
            <span>Status Badges</span>
          </h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="badge badge-success">
              <CheckCircle size={14} weight="fill" />
              Thành công
            </span>
            <span className="badge badge-warning">
              <Warning size={14} weight="fill" />
              Cảnh báo
            </span>
            <span className="badge badge-danger">
              <X size={14} weight="bold" />
              Lỗi
            </span>
            <span className="badge badge-info">
              <Info size={14} weight="fill" />
              Thông tin
            </span>
          </div>
        </section>

        {/* Stock Badges */}
        <section className="card-form stagger-in">
          <h3 className="section-title">
            <span>Stock Alerts với Animation</span>
          </h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="stock-normal">2,547</span>
            <span className="stock-badge stock-warning">
              <Warning className="stock-warning-icon" size={14} weight="bold" />
              <span>47</span>
            </span>
            <span className="stock-badge stock-danger">
              <Warning className="stock-warning-icon" size={14} weight="bold" />
              <span>3</span>
            </span>
          </div>
        </section>

        {/* Alerts */}
        <section className="card-form stagger-in">
          <h3 className="section-title">
            <span>Alert Messages</span>
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div className="alert success">
              <CheckCircle size={20} weight="fill" />
              <div>
                <strong>Thành công!</strong>
                <p style={{ margin: '4px 0 0' }}>Sản phẩm đã được cập nhật thành công.</p>
              </div>
            </div>
            <div className="alert warning">
              <Warning size={20} weight="fill" />
              <div>
                <strong>Cảnh báo</strong>
                <p style={{ margin: '4px 0 0' }}>Một số biến thể sắp hết hàng.</p>
              </div>
            </div>
            <div className="alert danger">
              <X size={20} weight="bold" />
              <div>
                <strong>Lỗi kết nối</strong>
                <p style={{ margin: '4px 0 0' }}>Không thể kết nối đến máy chủ. Vui lòng thử lại.</p>
              </div>
            </div>
            <div className="alert info">
              <Info size={20} weight="fill" />
              <div>
                <strong>Thông tin</strong>
                <p style={{ margin: '4px 0 0' }}>Hệ thống sẽ bảo trì vào 2h sáng mai.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Metric Cards */}
        <section className="stagger-in">
          <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
            Metric Cards với Hover Effect
          </h3>
          <div className="metrics">
            <div className="metric-card spotlight-card">
              <span>Tổng doanh thu</span>
              <strong>47.2M</strong>
            </div>
            <div className="metric-card spotlight-card">
              <span>Đơn hàng</span>
              <strong>1,847</strong>
            </div>
            <div className="metric-card spotlight-card">
              <span>Sản phẩm</span>
              <strong>342</strong>
            </div>
            <div className="metric-card spotlight-card">
              <span>Khách hàng</span>
              <strong>28.4K</strong>
            </div>
          </div>
        </section>

        {/* Form Fields */}
        <section className="card-form stagger-in">
          <h3 className="section-title">
            <span>Form Inputs với Enhanced Focus</span>
          </h3>
          <div className="grid two">
            <div className="field">
              <label>Tên sản phẩm</label>
              <input type="text" placeholder="Nhập tên sản phẩm..." />
            </div>
            <div className="field">
              <label>Giá bán</label>
              <input type="number" placeholder="0" />
            </div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label>Mô tả</label>
              <textarea rows={3} placeholder="Mô tả chi tiết sản phẩm..."></textarea>
            </div>
          </div>
        </section>

        {/* Modal Demo */}
        <section className="card-form stagger-in">
          <h3 className="section-title">
            <span>Modal với Glassmorphism</span>
          </h3>
          <button className="btn primary" onClick={() => setShowModal(true)}>
            <Sparkle size={18} weight="fill" />
            Mở Modal Demo
          </button>
        </section>

        {/* Empty State */}
        <section className="card-form stagger-in">
          <div className="empty-state">
            <Heart size={64} weight="duotone" />
            <h3>Empty State Example</h3>
            <p>Đây là giao diện hiển thị khi không có dữ liệu. Thiết kế giúp người dùng hiểu tình huống và biết cách tiếp tục.</p>
            <button className="btn primary">
              Thêm dữ liệu đầu tiên
            </button>
          </div>
        </section>

        {/* Loading Skeleton */}
        <section className="card-form stagger-in">
          <h3 className="section-title">
            <span>Loading Skeleton</span>
          </h3>
          <div className="skeleton-table">
            <div className="skeleton-row" style={{ width: '100%' }}></div>
            <div className="skeleton-row" style={{ width: '85%' }}></div>
            <div className="skeleton-row" style={{ width: '92%' }}></div>
            <div className="skeleton-row" style={{ width: '78%' }}></div>
          </div>
        </section>

      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon-danger">
                <Warning size={24} weight="fill" />
              </div>
              <h3 className="modal-title">Xác nhận xóa sản phẩm</h3>
            </div>
            <div className="modal-body">
              <p className="modal-message">
                Bạn có chắc chắn muốn xóa sản phẩm <strong>"Sữa tươi Vinamilk 1L"</strong>? 
                Hành động này không thể hoàn tác.
              </p>
              <div className="modal-actions">
                <button className="btn" onClick={() => setShowModal(false)}>
                  Hủy
                </button>
                <button className="btn danger" onClick={() => setShowModal(false)}>
                  <X size={18} weight="bold" />
                  Xóa sản phẩm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
