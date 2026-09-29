import { RequestHandler } from 'express';
import { badRequest, ok, serverError } from '../utils/response';
import { layTongQuanThue } from '../services/thue.service';

export const overview: RequestHandler = async (req, res) => {
  const { tu, den } = req.query as { tu?: string; den?: string };
  if (!tu || !den) return badRequest(res, 'Cần truyền khoảng thời gian tu và den.');
  try { ok(res, await layTongQuanThue(tu, den)); }
  catch (error: any) { badRequest(res, error.message); }
};
