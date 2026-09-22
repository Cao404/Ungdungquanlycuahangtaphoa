BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[NguoiDung] (
    [id] INT NOT NULL IDENTITY(1,1),
    [hoTen] NVARCHAR(100) NOT NULL,
    [taiKhoan] NVARCHAR(50) NOT NULL,
    [matKhau] NVARCHAR(255) NOT NULL,
    [vaiTro] NVARCHAR(20) NOT NULL CONSTRAINT [NguoiDung_vaiTro_df] DEFAULT 'nhanvien',
    [trangThai] BIT NOT NULL CONSTRAINT [NguoiDung_trangThai_df] DEFAULT 1,
    [createdAt] DATETIME NOT NULL CONSTRAINT [NguoiDung_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [NguoiDung_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [NguoiDung_taiKhoan_key] UNIQUE NONCLUSTERED ([taiKhoan])
);

-- CreateTable
CREATE TABLE [dbo].[SanPham] (
    [id] INT NOT NULL IDENTITY(1,1),
    [ten] NVARCHAR(200) NOT NULL,
    [thuongHieu] NVARCHAR(100),
    [danhMuc] NVARCHAR(100) NOT NULL,
    [moTa] NVARCHAR(max),
    [hinhAnh] NVARCHAR(500),
    [createdAt] DATETIME NOT NULL CONSTRAINT [SanPham_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [SanPham_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[BienThe] (
    [id] INT NOT NULL IDENTITY(1,1),
    [sanPhamId] INT NOT NULL,
    [giaTri] DECIMAL(10,2) NOT NULL,
    [donVi] NVARCHAR(20) NOT NULL,
    [giaNhap] DECIMAL(12,2) NOT NULL CONSTRAINT [BienThe_giaNhap_df] DEFAULT 0,
    [giaBan] DECIMAL(12,2) NOT NULL,
    [soLuongTon] INT NOT NULL CONSTRAINT [BienThe_soLuongTon_df] DEFAULT 0,
    [nguongCanhBao] INT NOT NULL CONSTRAINT [BienThe_nguongCanhBao_df] DEFAULT 5,
    [trangThai] BIT NOT NULL CONSTRAINT [BienThe_trangThai_df] DEFAULT 1,
    CONSTRAINT [BienThe_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[NhaCungCap] (
    [id] INT NOT NULL IDENTITY(1,1),
    [ten] NVARCHAR(200) NOT NULL,
    [sdt] NVARCHAR(20),
    [diaChi] NVARCHAR(300),
    [createdAt] DATETIME NOT NULL CONSTRAINT [NhaCungCap_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [NhaCungCap_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[PhieuNhap] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nhaCungCapId] INT NOT NULL,
    [nguoiTaoId] INT NOT NULL,
    [ngayNhap] DATETIME NOT NULL CONSTRAINT [PhieuNhap_ngayNhap_df] DEFAULT CURRENT_TIMESTAMP,
    [tongTien] DECIMAL(14,2) NOT NULL CONSTRAINT [PhieuNhap_tongTien_df] DEFAULT 0,
    [ghiChu] NVARCHAR(max),
    CONSTRAINT [PhieuNhap_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ChiTietPhieuNhap] (
    [id] INT NOT NULL IDENTITY(1,1),
    [phieuNhapId] INT NOT NULL,
    [bienTheId] INT NOT NULL,
    [soLuong] INT NOT NULL,
    [giaNhap] DECIMAL(12,2) NOT NULL,
    CONSTRAINT [ChiTietPhieuNhap_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[KhachHang] (
    [id] INT NOT NULL IDENTITY(1,1),
    [ten] NVARCHAR(200) NOT NULL,
    [sdt] NVARCHAR(20),
    [diaChi] NVARCHAR(300),
    [createdAt] DATETIME NOT NULL CONSTRAINT [KhachHang_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [KhachHang_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[HoaDon] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nguoiBanId] INT NOT NULL,
    [khachHangId] INT,
    [ngayBan] DATETIME NOT NULL CONSTRAINT [HoaDon_ngayBan_df] DEFAULT CURRENT_TIMESTAMP,
    [tongTien] DECIMAL(14,2) NOT NULL CONSTRAINT [HoaDon_tongTien_df] DEFAULT 0,
    [giamGia] DECIMAL(12,2) NOT NULL CONSTRAINT [HoaDon_giamGia_df] DEFAULT 0,
    [hinhThucTT] NVARCHAR(20) NOT NULL CONSTRAINT [HoaDon_hinhThucTT_df] DEFAULT 'tienmat',
    [trangThaiTT] NVARCHAR(10) NOT NULL CONSTRAINT [HoaDon_trangThaiTT_df] DEFAULT 'daTT',
    CONSTRAINT [HoaDon_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ChiTietHoaDon] (
    [id] INT NOT NULL IDENTITY(1,1),
    [hoaDonId] INT NOT NULL,
    [bienTheId] INT NOT NULL,
    [soLuong] INT NOT NULL,
    [donGia] DECIMAL(12,2) NOT NULL,
    [thanhTien] DECIMAL(14,2) NOT NULL,
    CONSTRAINT [ChiTietHoaDon_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_SanPham_Ten] ON [dbo].[SanPham]([ten]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_SanPham_DanhMuc] ON [dbo].[SanPham]([danhMuc]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_BienThe_SanPhamId] ON [dbo].[BienThe]([sanPhamId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_BienThe_GiaTri] ON [dbo].[BienThe]([giaTri]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_PhieuNhap_NgayNhap] ON [dbo].[PhieuNhap]([ngayNhap] DESC);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_HoaDon_NgayBan] ON [dbo].[HoaDon]([ngayBan] DESC);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_HoaDon_NguoiBanId] ON [dbo].[HoaDon]([nguoiBanId]);

-- AddForeignKey
ALTER TABLE [dbo].[BienThe] ADD CONSTRAINT [FK_BienThe_SanPham] FOREIGN KEY ([sanPhamId]) REFERENCES [dbo].[SanPham]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PhieuNhap] ADD CONSTRAINT [FK_PhieuNhap_NhaCungCap] FOREIGN KEY ([nhaCungCapId]) REFERENCES [dbo].[NhaCungCap]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PhieuNhap] ADD CONSTRAINT [FK_PhieuNhap_NguoiDung] FOREIGN KEY ([nguoiTaoId]) REFERENCES [dbo].[NguoiDung]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ChiTietPhieuNhap] ADD CONSTRAINT [FK_ChiTietPhieuNhap_PhieuNhap] FOREIGN KEY ([phieuNhapId]) REFERENCES [dbo].[PhieuNhap]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ChiTietPhieuNhap] ADD CONSTRAINT [FK_ChiTietPhieuNhap_BienThe] FOREIGN KEY ([bienTheId]) REFERENCES [dbo].[BienThe]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[HoaDon] ADD CONSTRAINT [FK_HoaDon_NguoiDung] FOREIGN KEY ([nguoiBanId]) REFERENCES [dbo].[NguoiDung]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[HoaDon] ADD CONSTRAINT [FK_HoaDon_KhachHang] FOREIGN KEY ([khachHangId]) REFERENCES [dbo].[KhachHang]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ChiTietHoaDon] ADD CONSTRAINT [FK_ChiTietHoaDon_HoaDon] FOREIGN KEY ([hoaDonId]) REFERENCES [dbo].[HoaDon]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ChiTietHoaDon] ADD CONSTRAINT [FK_ChiTietHoaDon_BienThe] FOREIGN KEY ([bienTheId]) REFERENCES [dbo].[BienThe]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
