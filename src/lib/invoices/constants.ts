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
