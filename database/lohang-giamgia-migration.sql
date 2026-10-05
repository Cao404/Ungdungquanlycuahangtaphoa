/* Quản lý lô/HSD và lý do giảm giá cho cửa hàng nhỏ.
   Script có thể chạy lại an toàn trên SQL Server. */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF COL_LENGTH('dbo.HoaDon', 'lyDoGiamGia') IS NULL
  ALTER TABLE dbo.HoaDon ADD lyDoGiamGia NVARCHAR(255) NULL;
GO

IF COL_LENGTH('dbo.ChiTietPhieuNhap', 'maLo') IS NULL
  ALTER TABLE dbo.ChiTietPhieuNhap ADD maLo NVARCHAR(100) NULL;
IF COL_LENGTH('dbo.ChiTietPhieuNhap', 'ngaySanXuat') IS NULL
  ALTER TABLE dbo.ChiTietPhieuNhap ADD ngaySanXuat DATE NULL;
IF COL_LENGTH('dbo.ChiTietPhieuNhap', 'hanSuDung') IS NULL
  ALTER TABLE dbo.ChiTietPhieuNhap ADD hanSuDung DATE NULL;
GO

IF OBJECT_ID(N'dbo.LoHang', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.LoHang (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_LoHang PRIMARY KEY,
    bienTheId INT NOT NULL,
    chiTietPhieuNhapId INT NULL,
    maLo NVARCHAR(100) NULL,
    ngaySanXuat DATE NULL,
    hanSuDung DATE NULL,
    ngayNhap DATETIME NOT NULL CONSTRAINT DF_LoHang_NgayNhap DEFAULT GETDATE(),
    soLuongNhap INT NOT NULL,
    soLuongCon INT NOT NULL,
    giaNhap DECIMAL(12,2) NOT NULL,
    trangThai VARCHAR(20) NOT NULL CONSTRAINT DF_LoHang_TrangThai DEFAULT 'DANG_BAN',
    CONSTRAINT CK_LoHang_SoLuong CHECK (soLuongNhap >= 0 AND soLuongCon >= 0 AND soLuongCon <= soLuongNhap),
    CONSTRAINT CK_LoHang_Ngay CHECK (ngaySanXuat IS NULL OR hanSuDung IS NULL OR ngaySanXuat <= hanSuDung),
    CONSTRAINT FK_LoHang_BienThe FOREIGN KEY (bienTheId) REFERENCES dbo.BienThe(id),
    CONSTRAINT FK_LoHang_ChiTietPhieuNhap FOREIGN KEY (chiTietPhieuNhapId) REFERENCES dbo.ChiTietPhieuNhap(id)
  );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.LoHang') AND name = N'UX_LoHang_ChiTietPhieuNhap')
  CREATE UNIQUE INDEX UX_LoHang_ChiTietPhieuNhap ON dbo.LoHang(chiTietPhieuNhapId) WHERE chiTietPhieuNhapId IS NOT NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.LoHang') AND name = N'IX_LoHang_BienThe_HanSuDung')
  CREATE INDEX IX_LoHang_BienThe_HanSuDung ON dbo.LoHang(bienTheId, hanSuDung);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.LoHang') AND name = N'IX_LoHang_HanSuDung_SoLuongCon')
  CREATE INDEX IX_LoHang_HanSuDung_SoLuongCon ON dbo.LoHang(hanSuDung, soLuongCon);
GO

IF OBJECT_ID(N'dbo.PhanBoLoHoaDon', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.PhanBoLoHoaDon (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_PhanBoLoHoaDon PRIMARY KEY,
    chiTietHoaDonId INT NOT NULL,
    loHangId INT NOT NULL,
    soLuong INT NOT NULL,
    CONSTRAINT CK_PhanBoLoHoaDon_SoLuong CHECK (soLuong > 0),
    CONSTRAINT FK_PhanBoLoHoaDon_ChiTietHoaDon FOREIGN KEY (chiTietHoaDonId) REFERENCES dbo.ChiTietHoaDon(id),
    CONSTRAINT FK_PhanBoLoHoaDon_LoHang FOREIGN KEY (loHangId) REFERENCES dbo.LoHang(id),
    CONSTRAINT UQ_PhanBoLoHoaDon_ChiTiet_Lo UNIQUE (chiTietHoaDonId, loHangId)
  );
  CREATE INDEX IX_PhanBoLoHoaDon_LoHang ON dbo.PhanBoLoHoaDon(loHangId);
END;
GO

/* Gom tồn hiện tại vào một lô đầu kỳ để hàng cũ vẫn bán được sau khi bật FEFO. */
INSERT INTO dbo.LoHang (bienTheId, maLo, ngayNhap, soLuongNhap, soLuongCon, giaNhap, trangThai)
SELECT bt.id, CONCAT(N'TỒN-ĐẦU-', bt.id), GETDATE(), bt.soLuongTon, bt.soLuongTon, bt.giaNhap, 'DANG_BAN'
FROM dbo.BienThe bt
WHERE bt.soLuongTon > 0
  AND NOT EXISTS (SELECT 1 FROM dbo.LoHang lh WHERE lh.bienTheId = bt.id);
GO
