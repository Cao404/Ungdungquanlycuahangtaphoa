/* Đổi URL ảnh local cũ thành đường dẫn tương đối để dùng được trên mọi thiết bị. */
UPDATE dbo.SanPham
SET hinhAnh = SUBSTRING(hinhAnh, CHARINDEX('/uploads/', hinhAnh), LEN(hinhAnh))
WHERE hinhAnh IS NOT NULL
  AND CHARINDEX('/uploads/', hinhAnh) > 0
  AND hinhAnh <> SUBSTRING(hinhAnh, CHARINDEX('/uploads/', hinhAnh), LEN(hinhAnh));
