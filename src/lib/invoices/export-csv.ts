import type { ExportRow } from "@/lib/invoices/export-rows";
import { EXPORT_HEADERS, invoicesToExportRows } from "@/lib/invoices/export-rows";
import type { InvoiceRow } from "@/lib/invoices/constants";

/** Punto y coma: Excel en español (Costa Rica) separa columnas correctamente. */
const DELIMITER = ";";

function escapeCsvCell(value: string): string {
  if (/[";"\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatAmount(amount: number | null): string {
  if (amount == null) return "";
  return amount.toFixed(2).replace(".", ",");
}

function formatCsvRow(cells: string[]): string {
  return cells.map(escapeCsvCell).join(DELIMITER);
}

function exportRowToCells(row: ExportRow): string[] {
  return [
    row.vendor,
    row.invoiceNumber,
    row.date,
    row.documentType,
    formatAmount(row.subtotal),
    formatAmount(row.tax),
    formatAmount(row.retention),
    formatAmount(row.total),
    row.currency,
    row.category,
    row.status,
  ];
}

export function invoicesToCsv(invoices: InvoiceRow[]): string {
  const rows = invoicesToExportRows(invoices);
  const lines = [
    "sep=;",
    formatCsvRow([...EXPORT_HEADERS]),
    ...rows.map((row) => formatCsvRow(exportRowToCells(row))),
  ];
  return lines.join("\r\n");
}

export function buildInvoicesExportFilename(
  format: "csv" | "xlsx" = "csv",
  date = new Date(),
): string {
  const stamp = date.toISOString().slice(0, 10);
  return format === "xlsx" ? `facturas-${stamp}.xlsx` : `facturas-${stamp}.csv`;
}
