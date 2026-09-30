import prisma from '../config/database';

type AuditInput = { userId?: string | number | null; hanhDong: string; trangThai: 'SUCCESS' | 'FAILED'; doiTuong?: string; doiTuongId?: string | number; metadata?: Record<string, unknown> };
export async function ghiNhatKy(input: AuditInput) {
  try {
    await prisma.nhatKyHeThong.create({ data: {
      userId: input.userId == null ? null : Number(input.userId), hanhDong: input.hanhDong,
      trangThai: input.trangThai, doiTuong: input.doiTuong, doiTuongId: input.doiTuongId == null ? null : String(input.doiTuongId),
      metadata: input.metadata ? JSON.stringify(input.metadata).slice(0, 1000) : null,
    } });
  } catch (error) { console.error('[AUDIT_WRITE_FAILED]', input.hanhDong, error instanceof Error ? error.message : 'unknown'); }
}
