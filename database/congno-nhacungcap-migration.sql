SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRANSACTION;

IF COL_LENGTH('dbo.PhieuNhap', 'hinhThucTT') IS NULL
BEGIN
  ALTER TABLE dbo.PhieuNhap ADD hinhThucTT NVARCHAR(20) NOT NULL CONSTRAINT DF_PhieuNhap_HinhThucTT DEFAULT N'tienmat';
END;

IF COL_LENGTH('dbo.PhieuNhap', 'trangThaiTT') IS NULL
BEGIN
  ALTER TABLE dbo.PhieuNhap ADD trangThaiTT NVARCHAR(10) NOT NULL CONSTRAINT DF_PhieuNhap_TrangThaiTT DEFAULT N'chuaTT';
END;

IF COL_LENGTH('dbo.PhieuNhap', 'soTienDaThanhToan') IS NULL
BEGIN
  ALTER TABLE dbo.PhieuNhap ADD soTienDaThanhToan DECIMAL(14,2) NOT NULL CONSTRAINT DF_PhieuNhap_SoTienDaThanhToan DEFAULT 0;
  EXEC(N'UPDATE dbo.PhieuNhap SET soTienDaThanhToan = tongTien, trangThaiTT = N''daTT'' WHERE trangThai = ''CONFIRMED'';');
END;

IF OBJECT_ID('dbo.TraCongNoNhaCungCap', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.TraCongNoNhaCungCap (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_TraCongNoNhaCungCap PRIMARY KEY,
    nhaCungCapId INT NOT NULL,
    nguoiTraId INT NOT NULL,
    soTien DECIMAL(14,2) NOT NULL,
    hinhThucTT NVARCHAR(20) NOT NULL,
    ghiChu NVARCHAR(500) NULL,
    ngayTra DATETIME NOT NULL CONSTRAINT DF_TraCongNoNCC_NgayTra DEFAULT GETDATE(),
    CONSTRAINT FK_TraCongNoNCC_NhaCungCap FOREIGN KEY (nhaCungCapId) REFERENCES dbo.NhaCungCap(id),
    CONSTRAINT FK_TraCongNoNCC_NguoiDung FOREIGN KEY (nguoiTraId) REFERENCES dbo.NguoiDung(id),
    CONSTRAINT CK_TraCongNoNCC_SoTien CHECK (soTien > 0)
  );
  CREATE INDEX IX_TraCongNoNCC_NhaCungCap_NgayTra ON dbo.TraCongNoNhaCungCap(nhaCungCapId, ngayTra DESC);
END;

IF OBJECT_ID('dbo.PhanBoTraCongNoNhaCungCap', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.PhanBoTraCongNoNhaCungCap (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_PhanBoTraCongNoNhaCungCap PRIMARY KEY,
    traCongNoId INT NOT NULL,
    phieuNhapId INT NOT NULL,
    soTien DECIMAL(14,2) NOT NULL,
    CONSTRAINT FK_PhanBoTraCongNoNCC_TraCongNo FOREIGN KEY (traCongNoId) REFERENCES dbo.TraCongNoNhaCungCap(id),
    CONSTRAINT FK_PhanBoTraCongNoNCC_PhieuNhap FOREIGN KEY (phieuNhapId) REFERENCES dbo.PhieuNhap(id),
    CONSTRAINT UQ_PhanBoTraCongNoNCC_Tra_Phieu UNIQUE (traCongNoId, phieuNhapId),
    CONSTRAINT CK_PhanBoTraCongNoNCC_SoTien CHECK (soTien > 0)
  );
  CREATE INDEX IX_PhanBoTraCongNoNCC_PhieuNhap ON dbo.PhanBoTraCongNoNhaCungCap(phieuNhapId);
END;

COMMIT TRANSACTION;
