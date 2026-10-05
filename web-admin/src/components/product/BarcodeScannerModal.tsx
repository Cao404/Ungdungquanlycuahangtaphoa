import {
  ArrowsClockwise,
  CheckCircle,
  DeviceMobile,
  Link,
  WifiHigh,
  X,
} from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { API_BASE_URL } from '../../services/api';
import { scannerService } from '../../services/scanner.service';
import { useAuthStore } from '../../store/authStore';
import type { ScannerSession } from '../../types/Scanner';

interface BarcodeScannerModalProps {
  onDetected: (barcode: string) => void;
  onClose: () => void;
}

const SOCKET_URL = new URL(API_BASE_URL, window.location.origin).origin;

const statusText: Record<ScannerSession['status'], string> = {
  WAITING: 'Đang chờ điện thoại kết nối',
  CONNECTED: 'Điện thoại đã kết nối — hãy quét mã',
  DISCONNECTED: 'Điện thoại đã ngắt kết nối',
  EXPIRED: 'Mã kết nối đã hết hạn',
  CLOSED: 'Phiên quét đã đóng',
};

export default function BarcodeScannerModal({ onDetected, onClose }: BarcodeScannerModalProps) {
  const token = useAuthStore((state) => state.token);
  const [session, setSession] = useState<ScannerSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [restartKey, setRestartKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const detectedRef = useRef(false);

  useEffect(() => {
    let disposed = false;
    detectedRef.current = false;
    setSession(null);
    setError(null);

    const closeCurrentSession = () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
      const sessionId = sessionIdRef.current;
      sessionIdRef.current = null;
      if (sessionId) void scannerService.close(sessionId).catch(() => undefined);
    };

    const startPairing = async () => {
      if (!token) {
        setError('Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại.');
        return;
      }

      let created: ScannerSession;
      try {
        created = await scannerService.createSession();
        if (disposed) {
          void scannerService.close(created.sessionId).catch(() => undefined);
          return;
        }

        sessionIdRef.current = created.sessionId;
        setSession(created);
      } catch (requestError: any) {
        setError(requestError?.response?.data?.message ?? 'Không tạo được mã kết nối. Kiểm tra backend và thử lại.');
        return;
      }

      try {
        const { io } = await import('socket.io-client');
        if (disposed) return;
        const socket = io(SOCKET_URL, {
          auth: { token },
          transports: ['websocket', 'polling'],
        });
        socketRef.current = socket;

        socket.on('connect', () => {
          setError(null);
          socket.emit(
            'scanner:join',
            created.sessionId,
            (result: { ok: boolean; status?: ScannerSession['status'] }) => {
              if (!result.ok) setError('Không tham gia được phiên quét. Hãy tạo mã kết nối mới.');
              else if (result.status) setSession((current) => current ? { ...current, status: result.status! } : current);
            }
          );
        });

        socket.on('connect_error', () => {
          setError('Không kết nối được realtime với máy chủ. Kiểm tra backend rồi tạo lại mã.');
        });

        socket.on('scanner:status', (nextSession: ScannerSession) => {
          setSession(nextSession);
        });

        socket.on('scanner:barcode', ({ barcode }: { barcode: string }) => {
          const normalized = barcode?.trim();
          if (!normalized || detectedRef.current) return;
          detectedRef.current = true;
          onDetected(normalized);
        });
      } catch {
        setError('Mã đã tạo nhưng web chưa kết nối được realtime. Hãy khởi động lại web-admin rồi tạo mã mới.');
      }
    };

    // Deferring one tick prevents React StrictMode's development-only effect
    // replay from creating and immediately invalidating two scanner sessions.
    const startTimer = window.setTimeout(() => void startPairing(), 0);
    return () => {
      disposed = true;
      window.clearTimeout(startTimer);
      closeCurrentSession();
    };
  }, [onDetected, restartKey, token]);

  const copyPairingCode = async () => {
    if (!session?.pairingCode) return;
    try {
      await navigator.clipboard.writeText(session.pairingCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const isConnected = session?.status === 'CONNECTED';
  const canRestart = Boolean(error || session?.status === 'EXPIRED' || session?.status === 'DISCONNECTED');

  return (
    <div className="modal-backdrop barcode-scanner-backdrop" role="dialog" aria-modal="true" aria-labelledby="barcode-scanner-title">
      <div className="modal-box barcode-scanner-modal">
        <div className="modal-header barcode-scanner-header">
          <div>
            <h3 id="barcode-scanner-title"><DeviceMobile size={23} /> Kết nối điện thoại quét mã</h3>
            <p>Dùng iPhone hoặc giả lập Android làm máy quét cho dòng sản phẩm này.</p>
          </div>
          <button type="button" className="btn ghost barcode-scanner-close" onClick={onClose} aria-label="Đóng kết nối máy quét">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body barcode-scanner-body">
          {error ? <div className="alert warning">{error}</div> : null}

          <div className={`pairing-card ${isConnected ? 'connected' : ''}`}>
            <span className="pairing-label">Mã kết nối 6 ký tự</span>
            <button type="button" className="pairing-code" onClick={copyPairingCode} disabled={!session?.pairingCode} title="Sao chép mã kết nối">
              {session?.pairingCode ?? '------'}
            </button>
            <div className="pairing-status">
              {isConnected ? <CheckCircle size={19} weight="fill" /> : <WifiHigh size={19} />}
              <span>{session ? statusText[session.status] : 'Đang tạo mã kết nối...'}</span>
            </div>
            {copied && <span className="pairing-copied">Đã sao chép mã</span>}
          </div>

          <ol className="pairing-steps">
            <li><span>1</span><div>Mở app trên iPhone hoặc giả lập Android và đăng nhập vào hệ thống; có thể dùng <strong>tài khoản nhân viên</strong>.</div></li>
            <li><span>2</span><div>Vào <strong>Cá nhân → Dùng thiết bị này làm máy quét phụ</strong>.</div></li>
            <li><span>3</span><div>Nhập mã 6 ký tự phía trên, bấm kết nối rồi quét barcode trên sản phẩm.</div></li>
          </ol>

          <p className="barcode-scanner-tip">
            <Link size={17} /> Khi quét thành công, mã vạch sẽ tự điền vào form và cửa sổ này tự đóng.
          </p>
        </div>

        <div className="modal-actions barcode-scanner-actions">
          <button type="button" className="btn" onClick={onClose}>Đóng</button>
          <button type="button" className="btn primary" onClick={() => setRestartKey((value) => value + 1)} disabled={!canRestart}>
            <ArrowsClockwise size={18} /> Tạo mã mới
          </button>
        </div>
      </div>
    </div>
  );
}
