IF OBJECT_ID('dbo.NhatKyHeThong', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.NhatKyHeThong (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_NhatKyHeThong PRIMARY KEY,
    userId INT NULL,
    hanhDong NVARCHAR(80) NOT NULL,
    trangThai NVARCHAR(20) NOT NULL,
    doiTuong NVARCHAR(50) NULL,
    doiTuongId NVARCHAR(64) NULL,
    metadata NVARCHAR(1000) NULL,
    createdAt DATETIME NOT NULL CONSTRAINT DF_NhatKyHeThong_CreatedAt DEFAULT(GETDATE())
  );
  CREATE INDEX IX_NhatKyHeThong_CreatedAt ON dbo.NhatKyHeThong(createdAt DESC);
  CREATE INDEX IX_NhatKyHeThong_UserId ON dbo.NhatKyHeThong(userId);
END;
