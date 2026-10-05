import { apiGet, apiPost } from './api';
import type { ScannerSession } from '../types/Scanner';

export const scannerService = {
  createSession: () => apiPost<ScannerSession>('/scanner/sessions', {}),
  getSession: (id: string) => apiGet<ScannerSession>(`/scanner/sessions/${id}`),
  close: (id: string) => apiPost<void>(`/scanner/sessions/${id}/close`, {}),
};
