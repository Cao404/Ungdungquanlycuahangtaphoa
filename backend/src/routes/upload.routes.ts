import { Router, Request, Response } from 'express';
import { upload } from '../middlewares/upload.middleware';
import { ok, badRequest, serverError } from '../utils/response';

const router = Router();

// POST /api/upload: Upload 1 ảnh
router.post('/', (req: Request, res: Response) => {
  upload.single('image')(req, res, (err: any) => {
    if (err) {
      return badRequest(res, err.message || 'Lỗi khi upload file');
    }

    if (!req.file) {
      return badRequest(res, 'Vui lòng chọn 1 file hình ảnh');
    }

    try {
      // Đường dẫn tương đối hoạt động với web, iPhone và Android. Không lưu
      // localhost vì trên điện thoại nó trỏ về chính thiết bị đó.
      const fileUrl = `/uploads/${req.file.filename}`;

      return ok(
        res,
        {
          url: fileUrl,
          filename: req.file.filename,
          size: req.file.size,
          mimetype: req.file.mimetype,
        },
        'Upload ảnh thành công'
      );
    } catch (e) {
      return serverError(res, e);
    }
  });
});

export default router;
