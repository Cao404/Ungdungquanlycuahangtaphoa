import { randomBytes } from 'crypto';
import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/auth.types';

export type ScannerStatus = 'WAITING' | 'CONNECTED' | 'DISCONNECTED' | 'EXPIRED' | 'CLOSED';
type ScannerSession = {
  sessionId: string; pairingCode: string; ownerId: string; deviceId: string | null;
  scannerUserId: string | null; scannerToken: string | null; createdAt: Date; expiresAt: Date; status: ScannerStatus;
  lastBarcode?: string; lastScanAt?: number;
};

const sessions = new Map<string, ScannerSession>();
let io: Server | null = null;
const publicSession = (session: ScannerSession) => ({
  sessionId: session.sessionId, pairingCode: session.pairingCode,
  createdAt: session.createdAt.toISOString(), expiresAt: session.expiresAt.toISOString(), status: currentStatus(session),
});

function currentStatus(session: ScannerSession): ScannerStatus {
  if (!['CLOSED', 'EXPIRED'].includes(session.status) && Date.now() >= session.expiresAt.getTime()) session.status = 'EXPIRED';
  return session.status;
}

function emitStatus(session: ScannerSession) {
  io?.to(`scanner:${session.sessionId}`).emit('scanner:status', publicSession(session));
}

export function setupScannerGateway(server: HttpServer) {
  io = new Server(server, { cors: { origin: '*' } });
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token as string;
      const user = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      socket.data.userId = String(user.id); next();
    } catch { next(new Error('UNAUTHORIZED')); }
  });
  io.on('connection', (socket) => {
    socket.on('scanner:join', (sessionId: string, done?: (result: { ok: boolean; status?: ScannerStatus }) => void) => {
      const session = sessions.get(sessionId.toUpperCase());
      if (!session || session.ownerId !== socket.data.userId || ['CLOSED', 'EXPIRED'].includes(currentStatus(session))) return done?.({ ok: false });
      socket.join(`scanner:${session.sessionId}`); done?.({ ok: true, status: session.status });
    });
  });
}

export function createScannerSession(ownerId: string) {
  for (const session of sessions.values()) {
    if (session.ownerId === ownerId && !['CLOSED', 'EXPIRED'].includes(currentStatus(session))) {
      session.status = 'CLOSED'; emitStatus(session);
    }
  }
  const sessionId = randomBytes(5).toString('hex').toUpperCase();
  const session: ScannerSession = {
    sessionId, pairingCode: sessionId.slice(0, 6), ownerId, deviceId: null, scannerUserId: null, scannerToken: null,
    createdAt: new Date(), expiresAt: new Date(Date.now() + 10 * 60_000), status: 'WAITING',
  };
  sessions.set(sessionId, session);
  return publicSession(session);
}

export function getScannerSession(id: string, ownerId: string) {
  const session = [...sessions.values()].find((item) => item.sessionId === id.toUpperCase() || item.pairingCode === id.toUpperCase());
  if (!session || session.ownerId !== ownerId) return null;
  return publicSession(session);
}

export function joinScannerSession(code: string, userId: string, deviceId: string) {
  const session = [...sessions.values()].find((item) => item.pairingCode === code.toUpperCase() || item.sessionId === code.toUpperCase());
  if (!session || ['CLOSED', 'EXPIRED'].includes(currentStatus(session))) return null;
  if (session.deviceId && session.deviceId !== deviceId) return { conflict: true as const };
  session.deviceId = deviceId; session.scannerUserId = userId; session.scannerToken = randomBytes(24).toString('hex'); session.status = 'CONNECTED';
  emitStatus(session);
  return { ...publicSession(session), scannerToken: session.scannerToken };
}

export function disconnectScannerSession(id: string, userId: string, deviceId: string) {
  const session = sessions.get(id.toUpperCase());
  if (!session || session.scannerUserId !== userId || session.deviceId !== deviceId) return false;
  if (!['CLOSED', 'EXPIRED'].includes(currentStatus(session))) { session.status = 'DISCONNECTED'; session.scannerToken = null; session.scannerUserId = null; session.deviceId = null; emitStatus(session); }
  return true;
}

export function closeScannerSession(id: string, ownerId: string) {
  const session = sessions.get(id.toUpperCase());
  if (!session || session.ownerId !== ownerId) return false;
  session.status = 'CLOSED'; session.scannerToken = null; session.scannerUserId = null; session.deviceId = null; emitStatus(session); return true;
}

export function publishBarcode(id: string, userId: string, deviceId: string, scannerToken: string, barcode: string) {
  const session = sessions.get(id.toUpperCase());
  if (!session || session.scannerUserId !== userId || currentStatus(session) !== 'CONNECTED' || session.deviceId !== deviceId || session.scannerToken !== scannerToken || !barcode.trim()) return false;
  const now = Date.now();
  if (session.lastBarcode === barcode.trim() && session.lastScanAt && now - session.lastScanAt < 1200) return true;
  session.lastBarcode = barcode.trim(); session.lastScanAt = now;
  io?.to(`scanner:${session.sessionId}`).emit('scanner:barcode', { barcode: barcode.trim(), scannedAt: new Date(now).toISOString() });
  return true;
}
