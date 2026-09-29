/* Idempotent checkout and server-calculated totals for Mobile POS. */
IF COL_LENGTH('dbo.HoaDon', 'requestId') IS NULL
  EXEC(N'ALTER TABLE dbo.HoaDon ADD requestId NVARCHAR(64) NULL;');
IF COL_LENGTH('dbo.HoaDon', 'tamTinh') IS NULL
  EXEC(N'ALTER TABLE dbo.HoaDon ADD tamTinh DECIMAL(14,2) NOT NULL CONSTRAINT DF_HoaDon_TamTinh DEFAULT(0);');
IF COL_LENGTH('dbo.HoaDon', 'thue') IS NULL
  EXEC(N'ALTER TABLE dbo.HoaDon ADD thue DECIMAL(12,2) NOT NULL CONSTRAINT DF_HoaDon_Thue DEFAULT(0);');
IF COL_LENGTH('dbo.HoaDon', 'tienKhachDua') IS NULL
  EXEC(N'ALTER TABLE dbo.HoaDon ADD tienKhachDua DECIMAL(14,2) NULL;');
IF COL_LENGTH('dbo.HoaDon', 'tienThua') IS NULL
  EXEC(N'ALTER TABLE dbo.HoaDon ADD tienThua DECIMAL(14,2) NULL;');
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_HoaDon_RequestId' AND object_id = OBJECT_ID('dbo.HoaDon'))
  EXEC(N'CREATE UNIQUE INDEX UX_HoaDon_RequestId ON dbo.HoaDon(requestId) WHERE requestId IS NOT NULL;');
EXEC(N'UPDATE dbo.HoaDon SET tamTinh = tongTien WHERE tamTinh = 0;');
