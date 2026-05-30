import type { DocumentType, InvoiceStatus } from "@/lib/invoices/constants";
import type { InvoiceListFilters } from "@/lib/invoices/queries";

const VALID_STATUSES: InvoiceStatus[] = ["pending_review", "confirmed", "rejected"];
const VALID_DOCUMENT_TYPES: DocumentType[] = ["expense", "income"];

function pickParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = params[key];
  if (Array.isArray(value)) return value[0];
  return value;
}

export function parseInvoiceListFilters(
  params: Record<string, string | string[] | undefined>,
): InvoiceListFilters {
  const status = pickParam(params, "status");
  const category = pickParam(params, "category");
  const documentType = pickParam(params, "document_type");

  return {
    q: pickParam(params, "q")?.trim() || undefined,
    status: VALID_STATUSES.includes(status as InvoiceStatus)
      ? (status as InvoiceStatus)
      : undefined,
    documentType: VALID_DOCUMENT_TYPES.includes(documentType as DocumentType)
      ? (documentType as DocumentType)
      : undefined,
    category: category?.trim() ? category.trim().slice(0, 60) : undefined,
    vendor: pickParam(params, "vendor")?.trim() || undefined,
    from: pickParam(params, "from") || undefined,
    to: pickParam(params, "to") || undefined,
  };
}

export function invoiceListFiltersToSearchParams(filters: InvoiceListFilters): string {
  const params = new URLSearchParams();

  if (filters.q) params.set("q", filters.q);
  if (filters.status) params.set("status", filters.status);
  if (filters.documentType) params.set("document_type", filters.documentType);
  if (filters.category) params.set("category", filters.category);
  if (filters.vendor) params.set("vendor", filters.vendor);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);

  return params.toString();
}
