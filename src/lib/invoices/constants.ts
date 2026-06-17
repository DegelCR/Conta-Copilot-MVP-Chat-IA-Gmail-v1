export const INVOICE_BUCKET = "invoices";

export const MAX_INVOICE_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_INVOICE_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/xml",
  "text/xml",
] as const;

export const ALLOWED_INVOICE_EXTENSIONS = [
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".xml",
] as const;

export function sanitizeFileName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 120);
}

export function isAllowedInvoiceFileName(
  fileName: string,
  mimeType?: string | null,
): boolean {
  if (
    mimeType &&
    ALLOWED_INVOICE_MIME_TYPES.includes(
      mimeType as (typeof ALLOWED_INVOICE_MIME_TYPES)[number],
    )
  ) {
    return true;
  }

  const lower = fileName.toLowerCase();
  return ALLOWED_INVOICE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export function isAllowedInvoiceFile(file: File): boolean {
  return isAllowedInvoiceFileName(file.name, file.type);
}

const PDF_MAGIC = Buffer.from("%PDF-");
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG_MAGIC = Buffer.from([0xff, 0xd8, 0xff]);
const GIF87_MAGIC = Buffer.from("GIF87a");
const GIF89_MAGIC = Buffer.from("GIF89a");
const WEBP_MAGIC = Buffer.from("WEBP");

function bufferStartsWith(buffer: Buffer, prefix: Buffer): boolean {
  if (buffer.length < prefix.length) return false;
  return buffer.subarray(0, prefix.length).equals(prefix);
}

/** Verifica magic bytes del contenido (defensa contra extensiones/MIME falsos). */
export function validateInvoiceFileContent(
  buffer: Buffer,
  fileName: string,
): boolean {
  if (buffer.length === 0) return false;

  const lower = fileName.toLowerCase();

  if (lower.endsWith(".pdf")) {
    return bufferStartsWith(buffer, PDF_MAGIC);
  }

  if (lower.endsWith(".png")) {
    return bufferStartsWith(buffer, PNG_MAGIC);
  }

  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
    return bufferStartsWith(buffer, JPEG_MAGIC);
  }

  if (lower.endsWith(".gif")) {
    return (
      bufferStartsWith(buffer, GIF87_MAGIC) ||
      bufferStartsWith(buffer, GIF89_MAGIC)
    );
  }

  if (lower.endsWith(".webp")) {
    return (
      buffer.length >= 12 &&
      buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).equals(WEBP_MAGIC)
    );
  }

  if (lower.endsWith(".xml")) {
    const head = buffer.subarray(0, Math.min(buffer.length, 256)).toString("utf8").trimStart();
    return head.startsWith("<?xml") || head.startsWith("<");
  }

  return false;
}

export type InvoiceStatus = "pending_review" | "confirmed" | "rejected";

export type DocumentType = "expense" | "income";

export type InvoiceRow = {
  id: string;
  file_name: string | null;
  file_path: string | null;
  status: InvoiceStatus;
  document_type: DocumentType;
  vendor: string | null;
  invoice_number: string | null;
  invoice_date: string | null;
  subtotal: number | null;
  tax_amount: number | null;
  retention_amount: number | null;
  total: number | null;
  currency: string;
  category: string | null;
  raw_ai_json: Record<string, unknown> | null;
  source?: "manual" | "gmail";
  source_meta?: Record<string, unknown> | null;
  created_at: string;
};

export function invoiceHasExtraction(invoice: InvoiceRow): boolean {
  return invoice.vendor != null || invoice.total != null || invoice.raw_ai_json != null;
}

export function formatCurrency(amount: number | null, currency = "CRC") {
  if (amount == null) return "—";
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: currency === "USD" ? "USD" : "CRC",
  }).format(amount);
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  pending_review: "Pendiente",
  confirmed: "Confirmada",
  rejected: "Rechazada",
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  expense: "Gasto",
  income: "Ingreso",
};
