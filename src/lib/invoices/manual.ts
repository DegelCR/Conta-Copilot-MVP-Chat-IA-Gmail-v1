import type { InvoiceRow } from "@/lib/invoices/constants";

export const MANUAL_ENTRY_FILE_NAME = "Registro manual";
export const MANUAL_ENTRY_SOURCE = "manual_entry";

export function isManualEntryInvoice(invoice: {
  file_path?: string | null;
  file_name?: string | null;
  raw_ai_json?: Record<string, unknown> | null;
}): boolean {
  if (invoice.raw_ai_json?.extraction_source === MANUAL_ENTRY_SOURCE) {
    return true;
  }
  return !invoice.file_path && invoice.file_name === MANUAL_ENTRY_FILE_NAME;
}

export function manualEntryLabel(invoice: InvoiceRow): string {
  return invoice.vendor?.trim() || MANUAL_ENTRY_FILE_NAME;
}
