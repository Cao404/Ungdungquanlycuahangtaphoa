IF OBJECT_ID('CauHinhThue', 'U') IS NULL
BEGIN
  CREATE TABLE CauHinhThue (
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    ten NVARCHAR(150) NOT NULL,
    loaiThue NVARCHAR(50) NOT NULL,
    phuongPhapTinh NVARCHAR(50) NOT NULL,
    nguongDoanhThu DECIMAL(14,2) NOT NULL CONSTRAINT DF_CauHinhThue_Nguong DEFAULT 0,
    tyLe DECIMAL(5,2) NOT NULL,
    hieuLucTu DATE NOT NULL,
    hieuLucDen DATE NULL,
    trangThai BIT NOT NULL CONSTRAINT DF_CauHinhThue_TrangThai DEFAULT 1,
    ghiChu NVARCHAR(500) NULL,
    createdById INT NULL,
    createdAt DATETIME NOT NULL CONSTRAINT DF_CauHinhThue_CreatedAt DEFAULT GETDATE()
  );
  CREATE INDEX IX_CauHinhThue_HieuLuc ON CauHinhThue(trangThai, hieuLucTu);
END

IF NOT EXISTS (SELECT 1 FROM CauHinhThue WHERE ten = N'Thuế khoán bán lẻ - dữ liệu minh họa')
INSERT INTO CauHinhThue (ten, loaiThue, phuongPhapTinh, nguongDoanhThu, tyLe, hieuLucTu, trangThai, ghiChu, createdById)
SELECT N'Thuế khoán bán lẻ - dữ liệu minh họa', N'Thuế GTGT', N'Tỷ lệ trên doanh thu', 1000000, 2.00, '2026-01-01', 1, N'Dữ liệu mẫu dùng để kiểm tra màn hình thuế.', MIN(id)
FROM NguoiDung;
