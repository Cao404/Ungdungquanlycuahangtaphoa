import { RequestHandler } from 'express';
import { layTongQuanDashboard } from '../services/dashboard.service';
import { ok, serverError } from '../utils/response';

export const getOverview: RequestHandler = async (req, res) => {
  try { ok(res, await layTongQuanDashboard(req.query.tu as string | undefined, req.query.den as string | undefined)); }
  catch (error) { serverError(res, error); }
};
