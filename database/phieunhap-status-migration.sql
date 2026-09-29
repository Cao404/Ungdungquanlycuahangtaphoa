/* Run once for existing SQL Server databases before deploying the receipt workflow. */
IF COL_LENGTH('PhieuNhap', 'trangThai') IS NULL
  ALTER TABLE PhieuNhap ADD trangThai VARCHAR(20) NOT NULL CONSTRAINT DF_PhieuNhap_TrangThai DEFAULT 'DRAFT';
IF COL_LENGTH('PhieuNhap', 'nguoiXacNhanId') IS NULL
  ALTER TABLE PhieuNhap ADD nguoiXacNhanId INT NULL;
IF COL_LENGTH('PhieuNhap', 'ngayXacNhan') IS NULL
  ALTER TABLE PhieuNhap ADD ngayXacNhan DATETIME NULL;
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_PhieuNhap_TrangThai' AND object_id = OBJECT_ID('PhieuNhap'))
  CREATE INDEX IX_PhieuNhap_TrangThai ON PhieuNhap(trangThai);
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_PhieuNhap_NguoiXacNhan')
  ALTER TABLE PhieuNhap ADD CONSTRAINT FK_PhieuNhap_NguoiXacNhan FOREIGN KEY (nguoiXacNhanId) REFERENCES NguoiDung(id);
