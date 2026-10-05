import { apiGet, apiPost } from './api';
import { ScannerSession } from '../types/Scanner';
export const scannerService = {
  createSession: () => apiPost<ScannerSession>('/scanner/sessions', {}),
  getSession: (id: string) => apiGet<ScannerSession>(`/scanner/sessions/${id}`),
  joinSession: (id: string, deviceId: string) => apiPost<ScannerSession>(`/scanner/sessions/${id}/join`, { deviceId }),
  publish: (id: string, barcode: string, deviceId: string, scannerToken: string) => apiPost<void>(`/scanner/sessions/${id}/scans`, { barcode, deviceId, scannerToken }),
  disconnect: (id: string, deviceId: string) => apiPost<void>(`/scanner/sessions/${id}/disconnect`, { deviceId }),
  close: (id: string) => apiPost<void>(`/scanner/sessions/${id}/close`, {}),
};
