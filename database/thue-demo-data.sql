/* Demo-only data: creates one completed sale and its matching stock movement.
   It is idempotent through the fixed timestamp, and uses an active variant
   with at least two units in stock. */
DECLARE @DemoTime DATETIME = '2026-09-21T10:30:00';
DECLARE @UserId INT = (SELECT TOP 1 id FROM NguoiDung WHERE trangThai = 1 ORDER BY id);
DECLARE @BienTheId INT = (SELECT TOP 1 id FROM BienThe WHERE trangThai = 1 AND soLuongTon >= 2 ORDER BY soLuongTon DESC, id);

UPDATE CauHinhThue
SET nguongDoanhThu = 1
WHERE ten = N'Thuế khoán bán lẻ - dữ liệu minh họa';

IF @UserId IS NOT NULL AND @BienTheId IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM HoaDon WHERE ngayBan = @DemoTime AND nguoiBanId = @UserId)
BEGIN
  DECLARE @DonGia DECIMAL(12,2) = (SELECT giaBan FROM BienThe WHERE id = @BienTheId);
  DECLARE @TonTruoc INT = (SELECT soLuongTon FROM BienThe WHERE id = @BienTheId);
  DECLARE @HoaDonId INT;
  DECLARE @SoLuong INT = 2;

  BEGIN TRANSACTION;
  INSERT INTO HoaDon (nguoiBanId, ngayBan, tongTien, giamGia, hinhThucTT, trangThaiTT)
  VALUES (@UserId, @DemoTime, @DonGia * @SoLuong, 0, 'tienmat', 'daTT');
  SET @HoaDonId = SCOPE_IDENTITY();

  INSERT INTO ChiTietHoaDon (hoaDonId, bienTheId, soLuong, donGia, thanhTien)
  VALUES (@HoaDonId, @BienTheId, @SoLuong, @DonGia, @DonGia * @SoLuong);

  UPDATE BienThe SET soLuongTon = soLuongTon - @SoLuong WHERE id = @BienTheId;
  INSERT INTO GiaoDichKho (bienTheId, loaiGiaoDich, soLuongThayDoi, soLuongTruoc, soLuongSau, thamChieuLoai, thamChieuId, nguoiThucHienId, thoiGian, ghiChu)
  VALUES (@BienTheId, 'ban_hang', -@SoLuong, @TonTruoc, @TonTruoc - @SoLuong, 'HoaDon', @HoaDonId, @UserId, @DemoTime, N'Dữ liệu mẫu để kiểm tra module Thuế');
  COMMIT TRANSACTION;
END
