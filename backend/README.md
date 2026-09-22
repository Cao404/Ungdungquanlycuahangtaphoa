# Backend demo app mobile nhân viên

## Chạy trên máy đã cấu hình

```bash
npm install
npm run prisma:generate
npm run dev
```

Server chạy tại `http://localhost:8080`.

Giữ file `.env` hiện có vì nó chứa thông tin SQL login riêng của ứng dụng. Không sao chép `.env.example` đè lên `.env`.

Trên máy có SQL Server Express, Prisma cần TCP/IP cho instance `SQLEXPRESS` ở `127.0.0.1:1433`. Chỉ bật địa chỉ loopback `127.0.0.1`, đặt cổng TCP `1433`, rồi khởi động lại dịch vụ SQL Server. Không cần mở cổng database ra Wi-Fi; ứng dụng mobile chỉ truy cập backend qua cổng `8080`.

Script `scripts/enable-local-sqlserver-tcp.ps1` thiết lập cấu hình này khi chạy bằng PowerShell với quyền Administrator.

`DATABASE_URL` cần SQL login có quyền trong `QuanLyTapHoa`. Tạo login riêng cho ứng dụng với hai vai trò `db_datareader` và `db_datawriter`, rồi cập nhật mật khẩu trong `backend/.env`; mật khẩu mẫu trong `.env.example` chỉ là chỗ giữ chỗ. Với database mới hoàn toàn, chạy `src/prisma/init.sql` rồi `src/prisma/add-kiemke.sql` bằng tài khoản SQL có quyền tạo bảng, sau đó chạy `npm run db:seed`. Trên database hiện tại, migration kiểm kê đã được áp dụng; không chạy lại các script SQL hoặc `prisma:migrate`.

Kiểm tra lần lượt:

- `http://localhost:8080/health`: backend đã chạy.
- `http://localhost:8080/health/db`: backend kết nối được SQL Server.
- `http://<IP-LAN-của-máy>:8080/health`: điện thoại truy cập được backend khi cùng Wi-Fi.

Expo chỉ chạy giao diện mobile; backend phải được chạy riêng bằng `npm run dev` trong thư mục `backend`.

Tài khoản demo:

- Nhân viên: `nhanvien` / `123456`
- Admin: `admin` / `123456`

## API mobile chính

- `GET /health`
- `GET /health/db`
- `POST /api/auth/login`
- `GET /api/sanpham?search=&danhMuc=`
- `GET /api/khachhang?search=`
- `POST /api/hoadon`
- `GET /api/hoadon`
- `GET /api/hoadon/:id`
- `GET /api/kiemke` (nhân viên xem phiếu của mình, admin xem tất cả)
- `GET /api/kiemke/:id`
- `POST /api/kiemke` (gửi phiếu chờ duyệt)
- `POST /api/kiemke/:id/duyet` (admin; cập nhật tồn kho khi tồn vẫn khớp lúc kiểm kê)
- `POST /api/kiemke/:id/tu-choi` (admin; body `{ "lyDoTuChoi": "..." }`)

Các API cần đăng nhập nhận header `Authorization: Bearer <token>`.

Nếu chạy mobile trên điện thoại thật, tạo `mobile/.env` với IP LAN của máy chạy backend:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:8080/api
```
