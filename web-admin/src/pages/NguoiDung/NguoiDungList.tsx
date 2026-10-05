import { FormEvent, useState } from 'react';
import DataTable, { Column } from '../../components/table/DataTable';
import InputField from '../../components/form/InputField';
import { useFetch } from '../../hooks/useFetch';
import { nguoiDungService } from '../../services/nguoidung.service';
import { NguoiDung, VaiTro } from '../../types/NguoiDung';

export default function NguoiDungList() {
  const { data, loading, error, refetch } = useFetch(nguoiDungService.getAll);
  const [editing, setEditing] = useState<NguoiDung | null>(null);
  const [form, setForm] = useState({ hoTen: '', taiKhoan: '', matKhau: '', vaiTro: 'nhanvien' as VaiTro, trangThai: true });

  const reset = () => {
    setEditing(null);
    setForm({ hoTen: '', taiKhoan: '', matKhau: '', vaiTro: 'nhanvien', trangThai: true });
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (editing) await nguoiDungService.update(editing.id, { hoTen: form.hoTen, vaiTro: form.vaiTro, trangThai: form.trangThai });
    else await nguoiDungService.create(form);
    reset();
    refetch();
  };

  const columns: Column<NguoiDung>[] = [
    { key: 'hoTen', title: 'Họ tên' },
    { key: 'taiKhoan', title: 'Tài khoản' },
    { key: 'vaiTro', title: 'Vai trò', render: (row) => row.vaiTro === 'owner' ? 'Chủ cửa hàng' : row.vaiTro === 'admin' ? 'Admin' : 'Nhân viên' },
    { key: 'trangThai', title: 'Trạng thái', render: (row) => row.trangThai === false ? 'Khóa' : 'Hoạt động' },
    {
      key: 'actions',
      title: 'Thao tác',
      render: (row) => (
        <div className="actions">
          <button className="btn small" onClick={() => { setEditing(row); setForm({ hoTen: row.hoTen, taiKhoan: row.taiKhoan, matKhau: '', vaiTro: row.vaiTro, trangThai: row.trangThai ?? true }); }}>Sửa</button>
          <button className="btn small danger" onClick={async () => { if (window.confirm('Xóa người dùng?')) { await nguoiDungService.remove(row.id); refetch(); } }}>Xóa</button>
        </div>
      ),
    },
  ];

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <h2>Nhân viên</h2>
          <p>Chỉ tài khoản admin được vào trang này.</p>
        </div>
      </div>
      <form className="inline-form" onSubmit={submit}>
        <InputField label="Họ tên" value={form.hoTen} onChange={(e) => setForm({ ...form, hoTen: e.target.value })} required />
        <InputField label="Tài khoản" value={form.taiKhoan} onChange={(e) => setForm({ ...form, taiKhoan: e.target.value })} required disabled={!!editing} />
        {!editing && <InputField label="Mật khẩu" type="password" value={form.matKhau} onChange={(e) => setForm({ ...form, matKhau: e.target.value })} required />}
        <label className="field">
          <span>Vai trò</span>
          <select value={form.vaiTro} onChange={(e) => setForm({ ...form, vaiTro: e.target.value as VaiTro })}>
            <option value="nhanvien">Nhân viên</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        {editing && (
          <label className="check-field">
            <input type="checkbox" checked={form.trangThai} onChange={(e) => setForm({ ...form, trangThai: e.target.checked })} />
            Hoạt động
          </label>
        )}
        <button className="btn primary">{editing ? 'Cập nhật' : 'Thêm mới'}</button>
        {editing && <button type="button" className="btn ghost" onClick={reset}>Hủy</button>}
      </form>
      {error && <div className="alert danger">{error}</div>}
      <DataTable columns={columns} data={data ?? []} loading={loading} rowKey={(row) => row.id} />
    </section>
  );
}
