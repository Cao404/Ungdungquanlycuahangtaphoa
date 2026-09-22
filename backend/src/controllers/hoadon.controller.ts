import { RequestHandler } from 'express';
import {
  HoaDonServiceError,
  hoaDonQuerySchema,
  layDanhSachHoaDon,
  layHoaDonTheoId,
  taoHoaDon,
  taoHoaDonSchema,
} from '../services/hoadon.service';
import { badRequest, created, forbidden, notFound, ok, serverError } from '../utils/response';

export const getAll: RequestHandler = async (req, res) => {
  const parsed = hoaDonQuerySchema.safeParse(req.query);
  if (!parsed.success) return badRequest(res, parsed.error.errors[0].message);

  try {
    ok(res, await layDanhSachHoaDon(req.user!, parsed.data));
  } catch (error) {
    serverError(res, error);
  }
};

export const getOne: RequestHandler = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return badRequest(res, 'Mã hóa đơn không hợp lệ');

  try {
    const data = await layHoaDonTheoId(id, req.user!);
    if (!data) return notFound(res, 'Hóa đơn không tồn tại');
    ok(res, data);
  } catch (error) {
    if (error instanceof HoaDonServiceError && error.statusCode === 403) {
      return forbidden(res, error.message);
    }
    serverError(res, error);
  }
};

export const createOne: RequestHandler = async (req, res) => {
  const parsed = taoHoaDonSchema.safeParse(req.body);
  if (!parsed.success) return badRequest(res, parsed.error.errors[0].message);

  try {
    const hoaDon = await taoHoaDon(req.user!.id, parsed.data);
    created(res, hoaDon, 'Thanh toán và tạo hóa đơn thành công');
  } catch (error) {
    if (error instanceof HoaDonServiceError) {
      return badRequest(res, error.message);
    }
    serverError(res, error);
  }
};
