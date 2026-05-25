import {
  DOCUMENT_TYPE_LABELS,
  INVOICE_STATUS_LABELS,
  type InvoiceRow,
} from "@/lib/invoices/constants";

export const EXPORT_HEADERS = [
  "Proveedor",
  "Nº factura",
  "Fecha",
  "Tipo",
  "Subtotal",
  "IVA",
  "Retención",
  "Total",
  "Moneda",
  "Categoría",
  "Estado",
] as const;

export type ExportRow = {
  vendor: string;
  invoiceNumber: string;
  date: string;
  documentType: string;
  subtotal: number | null;
  tax: number | null;
  retention: number | null;
  total: number | null;
  currency: string;
  category: string;
  status: string;
};

export function invoiceToExportRow(invoice: InvoiceRow): ExportRow {
  const documentType = invoice.document_type ?? "expense";
  return {
    vendor: invoice.vendor ?? "",
    invoiceNumber: invoice.invoice_number ?? "",
    date: invoice.invoice_date ?? "",
    documentType: DOCUMENT_TYPE_LABELS[documentType],
    subtotal: invoice.subtotal,
    tax: invoice.tax_amount,
    retention: invoice.retention_amount,
    total: invoice.total,
    currency: invoice.currency ?? "CRC",
    category: invoice.category ?? "",
    status: INVOICE_STATUS_LABELS[invoice.status],
  };
}

export function invoicesToExportRows(invoices: InvoiceRow[]): ExportRow[] {
  return invoices.map(invoiceToExportRow);
}
