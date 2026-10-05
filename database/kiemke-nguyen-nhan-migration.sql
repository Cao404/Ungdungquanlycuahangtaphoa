
IF COL_LENGTH('dbo.ChiTietKiemKe', 'nguyenNhanChenhLech') IS NULL
    EXEC(N'ALTER TABLE dbo.ChiTietKiemKe ADD nguyenNhanChenhLech NVARCHAR(255) NULL');
