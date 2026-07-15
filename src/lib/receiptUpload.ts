export const RECEIPT_MAX_BYTES = 10 * 1024 * 1024;

export const RECEIPT_ACCEPT = 'image/jpeg,image/png,image/webp,application/pdf';

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

export function validateReceiptFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return 'Please choose a JPG, PNG, WebP, or PDF file.';
  }
  if (file.size > RECEIPT_MAX_BYTES) {
    return 'File must be 10MB or smaller.';
  }
  return null;
}

export function formatReceiptSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isCloudinaryPdfUrl(url: string): boolean {
  return url.includes('res.cloudinary.com') && /\.pdf($|[?#])/i.test(url);
}

export function isCloudinaryReceiptUrl(url: string): boolean {
  return url.includes('res.cloudinary.com');
}
