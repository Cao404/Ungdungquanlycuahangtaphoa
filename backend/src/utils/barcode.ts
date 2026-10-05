export class BarcodeValidationError extends Error {}

/**
 * Barcode is optional because loose goods and services may not have one.
 * Preserve the scanned value (apart from surrounding whitespace) so EAN/UPC
 * and alphanumeric Code 128 identifiers can share the same workflow.
 */
export function normalizeBarcode(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') throw new BarcodeValidationError('Mã vạch phải là chuỗi ký tự.');

  const barcode = value.trim();
  if (!barcode) return null;
  if (barcode.length > 64) throw new BarcodeValidationError('Mã vạch không được dài quá 64 ký tự.');
  if (/[\u0000-\u001f\u007f]/.test(barcode)) {
    throw new BarcodeValidationError('Mã vạch chứa ký tự không hợp lệ.');
  }
  return barcode;
}

export function isUniqueConstraintError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002';
}
