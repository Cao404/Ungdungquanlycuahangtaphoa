BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[PhieuKiemKe] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nguoiTaoId] INT NOT NULL,
    [nguoiDuyetId] INT,
    [ngayTao] DATETIME NOT NULL CONSTRAINT [PhieuKiemKe_ngayTao_df] DEFAULT CURRENT_TIMESTAMP,
    [ngayDuyet] DATETIME,
    [ghiChu] NVARCHAR(500),
    [lyDoTuChoi] NVARCHAR(500),
    [trangThai] NVARCHAR(20) NOT NULL CONSTRAINT [PhieuKiemKe_trangThai_df] DEFAULT 'choDuyet',
    CONSTRAINT [PhieuKiemKe_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ChiTietKiemKe] (
    [id] INT NOT NULL IDENTITY(1,1),
    [phieuKiemKeId] INT NOT NULL,
    [bienTheId] INT NOT NULL,
    [soLuongHeThong] INT NOT NULL,
    [soLuongThucTe] INT NOT NULL,
    [chenhLech] INT NOT NULL,
    CONSTRAINT [ChiTietKiemKe_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [UQ_ChiTietKiemKe_Phieu_BienThe] UNIQUE NONCLUSTERED ([phieuKiemKeId],[bienTheId])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_PhieuKiemKe_NguoiTao_NgayTao] ON [dbo].[PhieuKiemKe]([nguoiTaoId], [ngayTao] DESC);

-- AddForeignKey
ALTER TABLE [dbo].[PhieuKiemKe] ADD CONSTRAINT [FK_PhieuKiemKe_NguoiTao] FOREIGN KEY ([nguoiTaoId]) REFERENCES [dbo].[NguoiDung]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PhieuKiemKe] ADD CONSTRAINT [FK_PhieuKiemKe_NguoiDuyet] FOREIGN KEY ([nguoiDuyetId]) REFERENCES [dbo].[NguoiDung]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ChiTietKiemKe] ADD CONSTRAINT [FK_ChiTietKiemKe_PhieuKiemKe] FOREIGN KEY ([phieuKiemKeId]) REFERENCES [dbo].[PhieuKiemKe]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ChiTietKiemKe] ADD CONSTRAINT [FK_ChiTietKiemKe_BienThe] FOREIGN KEY ([bienTheId]) REFERENCES [dbo].[BienThe]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
