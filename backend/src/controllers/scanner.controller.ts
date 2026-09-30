import { RequestHandler } from 'express';
import { badRequest, created, notFound, ok } from '../utils/response';
import { closeScannerSession, createScannerSession, disconnectScannerSession, getScannerSession, joinScannerSession, publishBarcode } from '../realtime/scanner.gateway';
import { ghiNhatKy } from '../services/audit.service';

export const createSession: RequestHandler = (req, res) => {
  const session = createScannerSession(req.user!.id);
  void ghiNhatKy({ userId: req.user!.id, hanhDong: 'SCANNER_SESSION_CREATE', trangThai: 'SUCCESS', doiTuong: 'ScannerSession', doiTuongId: session.sessionId });
  created(res, session);
};
export const getSession: RequestHandler = (req, res) => {
  const session = getScannerSession(req.params.id, req.user!.id);
  if (!session) return notFound(res, 'Phiên quét không tồn tại');
  ok(res, session);
};
export const joinSession: RequestHandler = (req, res) => {
  if (typeof req.body?.deviceId !== 'string' || req.body.deviceId.length < 8) return badRequest(res, 'Thiết bị quét không hợp lệ');
  const result = joinScannerSession(req.params.id, req.user!.id, req.body.deviceId);
  if (!result) return notFound(res, 'Phiên quét không tồn tại hoặc đã hết hạn');
  if ('conflict' in result) return res.status(409).json({ success: false, message: 'Phiên quét đã được kết nối với một thiết bị khác', errorCode: 'SCANNER_ALREADY_CONNECTED' });
  void ghiNhatKy({ userId: req.user!.id, hanhDong: 'SCANNER_PAIR', trangThai: 'SUCCESS', doiTuong: 'ScannerSession', doiTuongId: result.sessionId });
  ok(res, result);
};
export const scan: RequestHandler = (req, res) => {
  const { barcode, deviceId, scannerToken } = req.body ?? {};
  if ([barcode, deviceId, scannerToken].some((value) => typeof value !== 'string' || !value.trim())) return badRequest(res, 'Dữ liệu quét không hợp lệ');
  if (!publishBarcode(req.params.id, req.user!.id, deviceId, scannerToken, barcode)) return notFound(res, 'Phiên quét không hợp lệ, đã đóng hoặc hết hạn');
  ok(res, null, 'Đã gửi mã vạch tới máy bán hàng');
};
export const disconnect: RequestHandler = (req, res) => {
  if (typeof req.body?.deviceId !== 'string' || !disconnectScannerSession(req.params.id, req.user!.id, req.body.deviceId)) return notFound(res, 'Phiên quét không hợp lệ');
  ok(res, null, 'Đã ngắt kết nối máy quét');
};
export const close: RequestHandler = (req, res) => {
  if (!closeScannerSession(req.params.id, req.user!.id)) return notFound(res, 'Phiên quét không tồn tại');
  void ghiNhatKy({ userId: req.user!.id, hanhDong: 'SCANNER_SESSION_CLOSE', trangThai: 'SUCCESS', doiTuong: 'ScannerSession', doiTuongId: req.params.id });
  ok(res, null, 'Đã đóng phiên quét');
};
