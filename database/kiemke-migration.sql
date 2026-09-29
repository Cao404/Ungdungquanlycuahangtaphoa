-- Chạy một lần trên database hiện hữu (SQL Server).
ALTER TABLE PhieuKiemKe ADD
    trangThai VARCHAR(20) NOT NULL CONSTRAINT DF_PhieuKiemKe_TrangThai DEFAULT 'cho_duyet',
    nguoiDuyetId INT NULL,
    ngayDuyet DATETIME NULL,
    lyDoTuChoi NVARCHAR(255) NULL;

ALTER TABLE PhieuKiemKe ADD CONSTRAINT CK_PhieuKiemKe_TrangThai
    CHECK (trangThai IN ('cho_duyet', 'da_duyet', 'tu_choi'));

ALTER TABLE PhieuKiemKe ADD CONSTRAINT FK_PhieuKiemKe_NguoiDuyet
    FOREIGN KEY (nguoiDuyetId) REFERENCES NguoiDung(id);
