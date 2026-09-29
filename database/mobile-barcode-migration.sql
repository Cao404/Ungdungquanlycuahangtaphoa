/* Run once against SQL Server before enabling camera barcode lookup. */
/* Dynamic SQL avoids SQL Server compiling later references before the new column exists. */
IF COL_LENGTH('dbo.BienThe', 'barcode') IS NULL
  EXEC(N'ALTER TABLE dbo.BienThe ADD barcode NVARCHAR(64) NULL;');

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_BienThe_Barcode' AND object_id = OBJECT_ID('dbo.BienThe'))
  EXEC(N'CREATE UNIQUE INDEX UX_BienThe_Barcode ON dbo.BienThe(barcode) WHERE barcode IS NOT NULL;');
