/* Công nợ khách hàng: trả một phần và cấn vào hóa đơn cũ nhất. */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF COL_LENGTH('dbo.HoaDon', 'soTienDaThanhToan') IS NULL
BEGIN
  EXEC(N'ALTER TABLE dbo.HoaDon ADD soTienDaThanhToan DECIMAL(14,2) NOT NULL
    CONSTRAINT DF_HoaDon_SoTienDaThanhToan DEFAULT 0');
  EXEC(N'UPDATE dbo.HoaDon
    SET soTienDaThanhToan = CASE WHEN trangThaiTT = N''daTT'' THEN tongTien ELSE 0 END');
END;
GO

IF OBJECT_ID(N'dbo.ThuCongNo', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.ThuCongNo (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ThuCongNo PRIMARY KEY,
    khachHangId INT NOT NULL,
    nguoiThuId INT NOT NULL,
    soTien DECIMAL(14,2) NOT NULL,
    hinhThucTT NVARCHAR(20) NOT NULL,
    ghiChu NVARCHAR(500) NULL,
    ngayThu DATETIME NOT NULL CONSTRAINT DF_ThuCongNo_NgayThu DEFAULT GETDATE(),
    CONSTRAINT CK_ThuCongNo_SoTien CHECK (soTien > 0),
    CONSTRAINT CK_ThuCongNo_HinhThuc CHECK (hinhThucTT IN (N'tienmat', N'chuyenkhoan')),
    CONSTRAINT FK_ThuCongNo_KhachHang FOREIGN KEY (khachHangId) REFERENCES dbo.KhachHang(id),
    CONSTRAINT FK_ThuCongNo_NguoiDung FOREIGN KEY (nguoiThuId) REFERENCES dbo.NguoiDung(id)
  );
  CREATE INDEX IX_ThuCongNo_KhachHang_NgayThu ON dbo.ThuCongNo(khachHangId, ngayThu DESC);
END;
GO

IF OBJECT_ID(N'dbo.PhanBoThuCongNo', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.PhanBoThuCongNo (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_PhanBoThuCongNo PRIMARY KEY,
    thuCongNoId INT NOT NULL,
    hoaDonId INT NOT NULL,
    soTien DECIMAL(14,2) NOT NULL,
    CONSTRAINT CK_PhanBoThuCongNo_SoTien CHECK (soTien > 0),
    CONSTRAINT FK_PhanBoThuCongNo_ThuCongNo FOREIGN KEY (thuCongNoId) REFERENCES dbo.ThuCongNo(id),
    CONSTRAINT FK_PhanBoThuCongNo_HoaDon FOREIGN KEY (hoaDonId) REFERENCES dbo.HoaDon(id),
    CONSTRAINT UQ_PhanBoThuCongNo_Thu_HoaDon UNIQUE (thuCongNoId, hoaDonId)
  );
  CREATE INDEX IX_PhanBoThuCongNo_HoaDon ON dbo.PhanBoThuCongNo(hoaDonId);
END;
GO
