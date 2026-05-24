import { createClient } from "@/lib/supabase/server";
import {
  INVOICE_BUCKET,
  type InvoiceRow,
  type InvoiceStatus,
  type DocumentType,
} from "@/lib/invoices/constants";

export type InvoiceListFilters = {
  q?: string;
  status?: InvoiceStatus;
  documentType?: DocumentType;
  category?: string;
  vendor?: string;
  from?: string;
  to?: string;
};

const INVOICE_LIST_COLUMNS =
  "id, file_name, file_path, status, document_type, vendor, invoice_number, invoice_date, subtotal, tax_amount, retention_amount, total, currency, category, raw_ai_json, created_at";

function escapeIlikePattern(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

export async function listInvoicesForUser(
  filters: InvoiceListFilters = {},
): Promise<InvoiceRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  let query = supabase
    .from("invoices")
    .select(INVOICE_LIST_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(200);

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.documentType) {
    query = query.eq("document_type", filters.documentType);
  }

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  const vendor = filters.vendor?.trim();
  if (vendor) {
    query = query.ilike("vendor", `%${escapeIlikePattern(vendor)}%`);
  }

  if (filters.from) {
    query = query.gte("invoice_date", filters.from);
  }

  if (filters.to) {
    query = query.lte("invoice_date", filters.to);
  }

  const search = filters.q?.trim();
  if (search) {
    const term = escapeIlikePattern(search);
    query = query.or(
      `vendor.ilike.%${term}%,invoice_number.ilike.%${term}%,file_name.ilike.%${term}%`,
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("listInvoicesForUser:", error.message);
    return [];
  }

  return (data as InvoiceRow[]) ?? [];
}

export async function listConfirmedInvoicesForUser(
  limit = 100,
): Promise<InvoiceRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("invoices")
    .select(INVOICE_LIST_COLUMNS)
    .eq("status", "confirmed")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("listConfirmedInvoicesForUser:", error.message);
    return [];
  }

  return (data as InvoiceRow[]) ?? [];
}

export type InvoiceDetail = InvoiceRow & {
  signedFileUrl: string | null;
  fileMime: string;
};

function guessMimeFromName(fileName: string | null): string {
  const lower = (fileName ?? "").toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".xml")) return "application/xml";
  return "application/octet-stream";
}

export async function getInvoiceForUser(
  invoiceId: string,
): Promise<InvoiceDetail | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select(
      "id, file_name, file_path, status, document_type, vendor, invoice_number, invoice_date, subtotal, tax_amount, retention_amount, total, currency, category, raw_ai_json, created_at",
    )
    .eq("id", invoiceId)
    .eq("user_id", user.id)
    .single();

  if (error || !invoice) return null;

  let signedFileUrl: string | null = null;
  if (invoice.file_path) {
    const { data: signed } = await supabase.storage
      .from(INVOICE_BUCKET)
      .createSignedUrl(invoice.file_path, 60 * 60);
    signedFileUrl = signed?.signedUrl ?? null;
  }

  return {
    ...(invoice as InvoiceRow),
    signedFileUrl,
    fileMime: guessMimeFromName(invoice.file_name),
  };
}
