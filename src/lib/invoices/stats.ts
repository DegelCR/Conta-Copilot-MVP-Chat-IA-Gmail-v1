import type { DocumentType, InvoiceRow } from "@/lib/invoices/constants";

export type MonthlyStats = {
  expensesTotal: number;
  taxTotal: number;
  retentionTotal: number;
  incomeTotal: number;
  confirmedCount: number;
  expenseCount: number;
  incomeCount: number;
  monthLabel: string;
  confirmedOutsideMonth: number;
};

function normalizeDocumentType(value: string | null | undefined): DocumentType {
  return value === "income" ? "income" : "expense";
}

function parseReferenceDate(iso: string): Date {
  return new Date(iso.includes("T") ? iso : `${iso}T12:00:00`);
}

function isCurrentMonth(date: Date, now: Date): boolean {
  return (
    date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
  );
}

/** Incluye factura si la fecha del documento o la de subida cae en el mes actual. */
export function belongsToCurrentMonth(
  invoice: Pick<InvoiceRow, "invoice_date" | "created_at">,
  now = new Date(),
): boolean {
  const byCreatedAt = isCurrentMonth(new Date(invoice.created_at), now);

  if (!invoice.invoice_date) {
    return byCreatedAt;
  }

  const byInvoiceDate = isCurrentMonth(parseReferenceDate(invoice.invoice_date), now);
  return byInvoiceDate || byCreatedAt;
}

export function formatMonthLabel(now = new Date()): string {
  return new Intl.DateTimeFormat("es-CR", {
    month: "long",
    year: "numeric",
  }).format(now);
}

/** Agrega facturas confirmadas del mes (fecha de factura o subida en el mes actual). */
export function computeMonthlyStats(
  invoices: Pick<
    InvoiceRow,
    | "status"
    | "document_type"
    | "invoice_date"
    | "created_at"
    | "total"
    | "tax_amount"
    | "retention_amount"
    | "currency"
  >[],
  now = new Date(),
): MonthlyStats {
  const confirmed = invoices.filter((inv) => inv.status === "confirmed");
  const monthly = confirmed.filter((inv) => belongsToCurrentMonth(inv, now));
  const confirmedOutsideMonth = confirmed.length - monthly.length;

  let expensesTotal = 0;
  let taxTotal = 0;
  let retentionTotal = 0;
  let incomeTotal = 0;
  let expenseCount = 0;
  let incomeCount = 0;

  for (const inv of monthly) {
    const total = Number(inv.total) || 0;
    if (normalizeDocumentType(inv.document_type) === "income") {
      incomeTotal += total;
      incomeCount += 1;
    } else {
      expensesTotal += total;
      taxTotal += Number(inv.tax_amount) || 0;
      retentionTotal += Number(inv.retention_amount) || 0;
      expenseCount += 1;
    }
  }

  return {
    expensesTotal,
    taxTotal,
    retentionTotal,
    incomeTotal,
    confirmedCount: monthly.length,
    expenseCount,
    incomeCount,
    monthLabel: formatMonthLabel(now),
    confirmedOutsideMonth,
  };
}
