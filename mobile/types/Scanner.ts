export type ScannerStatus = 'WAITING' | 'CONNECTED' | 'DISCONNECTED' | 'EXPIRED' | 'CLOSED';
export interface ScannerSession { sessionId: string; pairingCode: string; createdAt: string; expiresAt: string; status: ScannerStatus; scannerToken?: string; }
