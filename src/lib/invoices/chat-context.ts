import {
  DOCUMENT_TYPE_LABELS,
  type DocumentType,
  type InvoiceRow,
} from "@/lib/invoices/constants";
import {
  belongsToCurrentMonth,
  computeMonthlyStats,
  formatMonthLabel,
} from "@/lib/invoices/stats";

function normalizeDocumentType(value: string | null | undefined): DocumentType {
  return value === "income" ? "income" : "expense";
}

function formatAmount(amount: number | null): string {
  if (amount == null) return "—";
  return amount.toFixed(2);
}

function aggregateByKey(
  invoices: InvoiceRow[],
  keyFn: (inv: InvoiceRow) => string,
  onlyExpenses = true,
): { key: string; total: number; count: number }[] {
  const totals = new Map<string, { total: number; count: number }>();

  for (const inv of invoices) {
    if (onlyExpenses && normalizeDocumentType(inv.document_type) !== "expense") {
      continue;
    }
    const key = keyFn(inv);
    const amount = Number(inv.total) || 0;
    const current = totals.get(key) ?? { total: 0, count: 0 };
    totals.set(key, {
      total: current.total + amount,
      count: current.count + 1,
    });
  }

  return [...totals.entries()]
    .map(([key, value]) => ({ key, ...value }))
    .sort((a, b) => b.total - a.total);
}

function formatInvoiceLine(inv: InvoiceRow): string {
  const type = DOCUMENT_TYPE_LABELS[normalizeDocumentType(inv.document_type)];
  const date = inv.invoice_date ?? inv.created_at.slice(0, 10);
  const vendor = inv.vendor ?? inv.file_name ?? "Sin proveedor";
  const category = inv.category ?? "Sin categoría";
  const currency = inv.currency ?? "CRC";

  return [
    date,
    type,
    vendor,
    category,
    currency,
    `subtotal=${formatAmount(inv.subtotal)}`,
    `iva=${formatAmount(inv.tax_amount)}`,
    `ret=${formatAmount(inv.retention_amount)}`,
    `total=${formatAmount(inv.total)}`,
  ].join(" | ");
}

export function buildChatContext(invoices: InvoiceRow[], now = new Date()): string {
  const stats = computeMonthlyStats(invoices, now);
  const monthLabel = formatMonthLabel(now);
  const monthly = invoices.filter((inv) => belongsToCurrentMonth(inv, now));
  const monthlyExpenses = monthly.filter(
    (inv) => normalizeDocumentType(inv.document_type) === "expense",
  );
  const monthlyIncome = monthly.filter(
    (inv) => normalizeDocumentType(inv.document_type) === "income",
  );

  const categoryTotals = aggregateByKey(
    monthlyExpenses,
    (inv) => inv.category ?? "Sin categoría",
  );
  const topVendors = aggregateByKey(
    monthlyExpenses,
    (inv) => inv.vendor ?? inv.file_name ?? "Sin proveedor",
  ).slice(0, 15);

  const lines: string[] = [
    `Mes de referencia: ${monthLabel}`,
    `Facturas confirmadas en total: ${invoices.length}`,
    `Facturas confirmadas en el mes actual: ${stats.confirmedCount}`,
    "",
    "Resumen del mes actual (solo confirmadas; fecha del documento o de subida en el mes):",
    `- Gastos (total): ${stats.expensesTotal.toFixed(2)} CRC equivalente (${stats.expenseCount} facturas; montos se suman sin convertir moneda mixta)`,
    `- Ingresos (total): ${stats.incomeTotal.toFixed(2)} (${stats.incomeCount} facturas)`,
    `- IVA en gastos del mes: ${stats.taxTotal.toFixed(2)}`,
    `- Retenciones en gastos del mes: ${stats.retentionTotal.toFixed(2)}`,
  ];

  if (stats.confirmedOutsideMonth > 0) {
    lines.push(
      `- Hay ${stats.confirmedOutsideMonth} factura(s) confirmada(s) con fecha fuera del mes actual (no entran en los totales del mes).`,
    );
  }

  if (categoryTotals.length > 0) {
    lines.push("", "Gastos del mes por categoría:");
    for (const row of categoryTotals) {
      lines.push(`- ${row.key}: ${row.total.toFixed(2)} (${row.count} facturas)`);
    }
  }

  if (topVendors.length > 0) {
    lines.push("", "Top proveedores por gasto en el mes:");
    for (const row of topVendors) {
      lines.push(`- ${row.key}: ${row.total.toFixed(2)} (${row.count} facturas)`);
    }
  }

  if (monthlyIncome.length > 0) {
    lines.push("", `Ingresos del mes (${monthlyIncome.length}):`);
    for (const inv of monthlyIncome.slice(0, 20)) {
      lines.push(`- ${formatInvoiceLine(inv)}`);
    }
  }

  const recent = [...invoices]
    .sort((a, b) => {
      const da = a.invoice_date ?? a.created_at;
      const db = b.invoice_date ?? b.created_at;
      return db.localeCompare(da);
    })
    .slice(0, 100);

  lines.push(
    "",
    `Detalle de hasta ${recent.length} facturas confirmadas (más recientes primero):`,
  );

  if (recent.length === 0) {
    lines.push("(No hay facturas confirmadas.)");
  } else {
    for (const inv of recent) {
      lines.push(`- ${formatInvoiceLine(inv)}`);
    }
  }

  return lines.join("\n");
}
