import { z } from "zod";

export const INVOICE_CATEGORIES = [
  "Combustible",
  "Servicios",
  "Alimentación",
  "Oficina",
  "Transporte",
  "Software",
  "Salud",
  "Otros",
] as const;

export const extractedInvoiceSchema = z.object({
  vendor: z.string().nullable().describe("Nombre del proveedor o emisor"),
  invoice_number: z
    .string()
    .nullable()
    .describe("Número de factura, consecutivo o clave numérica impresa"),
  invoice_date: z
    .string()
    .nullable()
    .describe("Fecha de la factura en formato YYYY-MM-DD"),
  subtotal: z.number().nullable().describe("Subtotal sin impuestos"),
  tax_amount: z.number().nullable().describe("Monto de IVA u otros impuestos"),
  retention_amount: z
    .number()
    .nullable()
    .describe("Retención aplicada (si aparece en la factura, sino null)"),
  total: z.number().nullable().describe("Total a pagar o monto final"),
  currency: z
    .string()
    .nullable()
    .describe("Código de moneda, ej. CRC o USD. Default CRC en Costa Rica"),
  category: z
    .string()
    .nullable()
    .describe(
      `Categoría de gasto. Preferir: ${INVOICE_CATEGORIES.join(", ")}`,
    ),
  document_type: z
    .enum(["expense", "income"])
    .nullable()
    .describe(
      "expense si es factura de compra/gasto; income si es factura de venta/ingreso que emite o recibe el usuario",
    ),
});

export type ExtractedInvoice = z.infer<typeof extractedInvoiceSchema>;

export function parseExtractedInvoice(raw: string): ExtractedInvoice {
  return extractedInvoiceSchema.parse(JSON.parse(raw));
}

/** Tolerancia: subtotal + IVA - retención ≈ total (Costa Rica) */
export function totalsAreConsistent(data: ExtractedInvoice): boolean {
  const { subtotal, tax_amount, total, retention_amount } = data;
  if (subtotal == null || total == null) return true;
  const tax = tax_amount ?? 0;
  const retention = retention_amount ?? 0;
  const expected = subtotal + tax - retention;
  return Math.abs(expected - total) <= Math.max(1, Math.abs(total) * 0.02);
}

export function normalizeExtractedInvoice(data: ExtractedInvoice): ExtractedInvoice {
  return {
    ...data,
    currency: (data.currency ?? "CRC").toUpperCase(),
    category: data.category ?? "Otros",
    document_type: data.document_type ?? "expense",
  };
}
