import { RequestHandler } from 'express';
import * as baocao from '../services/baocao.service';
import { ok, badRequest, serverError } from '../utils/response';

export const doanhThu: RequestHandler = async (req, res) => {
  const { tu, den } = req.query as { tu?: string; den?: string };
  if (!tu || !den) return badRequest(res, 'Cần truyền query tu và den (YYYY-MM-DD)');
  try { ok(res, await baocao.doanhThu(tu, den)); }
  catch (e) { serverError(res, e); }
};

export const banChay: RequestHandler = async (req, res) => {
  const { tu, den } = req.query as { tu?: string; den?: string };
  if (!tu || !den) return badRequest(res, 'Cần truyền query tu và den (YYYY-MM-DD)');
  try { ok(res, await baocao.banChay(tu, den)); }
  catch (e) { serverError(res, e); }
};
