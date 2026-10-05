import { ImageSquare, MagnifyingGlass, Warning } from '@phosphor-icons/react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DataTable, { Column } from '../../components/table/DataTable';
import ConfirmDialog from '../../components/modal/ConfirmDialog';
import BienTheTooltip from '../../components/product/BienTheTooltip';
import LichSuKhoModal from '../../components/product/LichSuKhoModal';
import { useFetch } from '../../hooks/useFetch';
import { sanPhamService } from '../../services/sanpham.service';
import { resolveAssetUrl } from '../../services/api';
import { BienThe, SanPham } from '../../types/SanPham';

export default function SanPhamList() {
  const { data, loading, error, refetch } = useFetch(sanPhamService.getAll);
  const [deletingItem, setDeletingItem] = useState<SanPham | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<{ variant: BienThe; sanPhamTen: string } | null>(null);
  const [query, setQuery] = useState('');

  const filteredProducts = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase('vi-VN');
    if (!keyword) return data ?? [];
    return (data ?? []).filter((product) => [
      product.ten,
      product.thuongHieu,
      product.danhMuc,
      ...(product.bienThes ?? []).flatMap((variant) => [variant.barcode, variant.tenBienThe, variant.donVi]),
    ].some((value) => String(value ?? '').toLocaleLowerCase('vi-VN').includes(keyword)));
  }, [data, query]);

  // Xử lý xác nhận xóa sản phẩm qua modal dialog
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    setActionError(null);
    try {
      await sanPhamService.remove(deletingItem.id);
      setDeletingItem(null);
      refetch();
    } catch (err: any) {
      setActionError(err?.response?.data?.message ?? err.message ?? 'Không thể xóa sản phẩm');
    } finally {
      setIsDeleting(false);
    }
  };

  // Render cột tồn kho: cảnh báo màu sắc và icon nếu có biến thể <= ngưỡng cảnh báo
  const renderTonKho = (row: SanPham) => {
    const bienThes = row.bienThes ?? [];
    const tongTonKho = bienThes.reduce((sum, item) => sum + Number(item.soLuongTon), 0);

    // Kiểm tra nếu có ít nhất 1 biến thể có soLuongTon <= nguongCanhBao
    const lowStockVariants = bienThes.filter(
      (bt) => Number(bt.soLuongTon) <= Number(bt.nguongCanhBao)
    );
    const hasWarning = lowStockVariants.length > 0;
    const isOutOfStock = bienThes.length > 0 && bienThes.some((bt) => Number(bt.soLuongTon) <= 0);

    if (!hasWarning) {
      return <span className="stock-normal">{tongTonKho.toLocaleString('vi-VN')}</span>;
    }

    const warningDetails = lowStockVariants
      .map((bt) => {
        const name = bt.tenBienThe || `${bt.giaTri ?? ''} ${bt.donVi ?? ''}`.trim() || 'Loại';
        return `• ${name}: còn ${bt.soLuongTon} (ngưỡng: ${bt.nguongCanhBao})`;
      })
      .join('\n');

    return (
      <span
        className={`stock-badge ${isOutOfStock ? 'stock-danger' : 'stock-warning'}`}
        title={`Cảnh báo tồn kho thấp:\n${warningDetails}`}
      >
        <Warning className="stock-warning-icon" size={14} weight="bold" aria-hidden="true" />
        <span>{tongTonKho.toLocaleString('vi-VN')}</span>
      </span>
    );
  };

  const columns: Column<SanPham>[] = [
    {
      key: 'ten',
      title: 'Tên sản phẩm',
      render: (row) => (
        <div className="product-cell">
          {row.hinhAnh ? (
            <img src={resolveAssetUrl(row.hinhAnh)} alt={row.ten} className="product-thumb" onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }} />
          ) : (
            <div className="product-thumb-placeholder">
              <ImageSquare size={18} weight="regular" />
            </div>
          )}
          <span>{row.ten}</span>
        </div>
      ),
    },
    { key: 'thuongHieu', title: 'Thương hiệu' },
    { key: 'danhMuc', title: 'Danh mục' },
    {
      key: 'bienThes',
      title: 'Loại',
      render: (row) => (
        <BienTheTooltip
          bienThes={row.bienThes}
          onViewLichSu={(bt) => setSelectedVariant({ variant: bt, sanPhamTen: row.ten })}
        />
      ),
    },
    {
      key: 'tonKho',
      title: 'Tồn kho',
      render: (row) => renderTonKho(row),
    },
    {
      key: 'actions',
      title: 'Thao tác',
      render: (row) => (
        <div className="actions">
          {row.bienThes?.length === 1 && (
            <button
              type="button"
              className="btn small ghost"
              title="Xem lịch sử biến động kho"
              onClick={() => setSelectedVariant({ variant: row.bienThes[0], sanPhamTen: row.ten })}
            >
              Lịch sử kho
            </button>
          )}
          <Link className="btn small" to={`/san-pham/${row.id}/sua`}>
            Sửa
          </Link>
          <button
            type="button"
            className="btn small danger"
            onClick={() => {
              setActionError(null);
              setDeletingItem(row);
            }}
          >
            Xóa
          </button>
        </div>
      ),
    },
  ];

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <h2>Sản phẩm</h2>
          <p>Quản lý hàng hóa và các loại bán theo đơn vị.</p>
        </div>
        <Link className="btn primary" to="/san-pham/them">
          Thêm sản phẩm
        </Link>
      </div>

      {(error || actionError) && (
        <div
          className="alert danger"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <span>{error || actionError}</span>
          <button
            type="button"
            className="btn ghost small"
            style={{ padding: '2px 8px', color: '#b91c1c', fontWeight: 700 }}
            onClick={() => setActionError(null)}
          >
            ✕
          </button>
        </div>
      )}

      <div className="audit-controls-bar">
        <div className="search-filter-group">
          <MagnifyingGlass size={18} aria-hidden="true" />
          <input
            className="audit-search-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm tên, thương hiệu hoặc mã vạch"
            aria-label="Tìm sản phẩm"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredProducts}
        loading={loading}
        emptyText={query.trim() ? 'Không tìm thấy sản phẩm phù hợp' : 'Chưa có sản phẩm'}
        rowKey={(row) => row.id}
      />

      {/* Modal xác nhận xóa sản phẩm */}
      <ConfirmDialog
        isOpen={!!deletingItem}
        title="Xác nhận xóa sản phẩm"
        message={
          <>
            Bạn có chắc muốn xóa sản phẩm <strong>"{deletingItem?.ten}"</strong>? Hành
            động này sẽ xóa toàn bộ loại liên quan và không thể hoàn tác.
          </>
        }
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        danger
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => !isDeleting && setDeletingItem(null)}
      />

      {/* Modal xem lịch sử giao dịch kho của biến thể */}
      <LichSuKhoModal
        isOpen={!!selectedVariant}
        bienThe={selectedVariant?.variant ?? null}
        sanPhamTen={selectedVariant?.sanPhamTen}
        onClose={() => setSelectedVariant(null)}
      />
    </section>
  );
}
