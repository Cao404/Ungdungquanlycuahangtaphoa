-
IF COL_LENGTH('dbo.PhieuKiemKe', 'trangThai') IS NULL
    EXEC(N'ALTER TABLE dbo.PhieuKiemKe ADD trangThai VARCHAR(20) NOT NULL CONSTRAINT DF_PhieuKiemKe_TrangThai DEFAULT ''cho_duyet''');

IF COL_LENGTH('dbo.PhieuKiemKe', 'nguoiDuyetId') IS NULL
    EXEC(N'ALTER TABLE dbo.PhieuKiemKe ADD nguoiDuyetId INT NULL');

IF COL_LENGTH('dbo.PhieuKiemKe', 'ngayDuyet') IS NULL
    EXEC(N'ALTER TABLE dbo.PhieuKiemKe ADD ngayDuyet DATETIME NULL');

IF COL_LENGTH('dbo.PhieuKiemKe', 'lyDoTuChoi') IS NULL
    EXEC(N'ALTER TABLE dbo.PhieuKiemKe ADD lyDoTuChoi NVARCHAR(255) NULL');

IF NOT EXISTS (
    SELECT 1 FROM sys.check_constraints
    WHERE name = 'CK_PhieuKiemKe_TrangThai'
      AND parent_object_id = OBJECT_ID('dbo.PhieuKiemKe')
)
    EXEC(N'ALTER TABLE dbo.PhieuKiemKe ADD CONSTRAINT CK_PhieuKiemKe_TrangThai CHECK (trangThai IN (''cho_duyet'', ''da_duyet'', ''tu_choi''))');

IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys
    WHERE name = 'FK_PhieuKiemKe_NguoiDuyet'
      AND parent_object_id = OBJECT_ID('dbo.PhieuKiemKe')
)
    EXEC(N'ALTER TABLE dbo.PhieuKiemKe ADD CONSTRAINT FK_PhieuKiemKe_NguoiDuyet FOREIGN KEY (nguoiDuyetId) REFERENCES dbo.NguoiDung(id)');
