import {
  DOCUMENT_TYPE_LABELS,
  INVOICE_STATUS_LABELS,
  type InvoiceRow,
} from "@/lib/invoices/constants";

const CSV_HEADERS = [
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

function escapeCsvCell(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatAmount(amount: number | null): string {
  if (amount == null) return "";
  return amount.toFixed(2);
}

function formatCsvRow(cells: string[]): string {
  return cells.map(escapeCsvCell).join(",");
}

export function invoicesToCsv(invoices: InvoiceRow[]): string {
  const lines = [formatCsvRow([...CSV_HEADERS])];

  for (const invoice of invoices) {
    const documentType = invoice.document_type ?? "expense";
    lines.push(
      formatCsvRow([
        invoice.vendor ?? "",
        invoice.invoice_number ?? "",
        invoice.invoice_date ?? "",
        DOCUMENT_TYPE_LABELS[documentType],
        formatAmount(invoice.subtotal),
        formatAmount(invoice.tax_amount),
        formatAmount(invoice.retention_amount),
        formatAmount(invoice.total),
        invoice.currency ?? "CRC",
        invoice.category ?? "",
        INVOICE_STATUS_LABELS[invoice.status],
      ]),
    );
  }

  return lines.join("\r\n");
}

export function buildInvoicesExportFilename(date = new Date()): string {
  const stamp = date.toISOString().slice(0, 10);
  return `facturas-${stamp}.csv`;
}
