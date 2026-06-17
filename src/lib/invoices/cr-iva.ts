/** IVA general Costa Rica (13 %). */
export const CR_STANDARD_IVA_RATE = 0.13;

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Total con IVA incluido → subtotal + IVA. */
export function splitTotalWithIva(
  total: number,
  rate = CR_STANDARD_IVA_RATE,
): { subtotal: number; tax_amount: number } {
  const subtotal = roundMoney(total / (1 + rate));
  const tax_amount = roundMoney(total - subtotal);
  return { subtotal, tax_amount };
}

export function ivaFromSubtotal(subtotal: number, rate = CR_STANDARD_IVA_RATE): number {
  return roundMoney(subtotal * rate);
}

export function totalFromParts(
  subtotal: number,
  tax_amount: number,
  retention_amount = 0,
): number {
  return roundMoney(subtotal + tax_amount - retention_amount);
}

export function parseAmountInput(raw: string): number | null {
  const trimmed = raw.trim().replace(",", ".");
  if (!trimmed) return null;
  const num = Number(trimmed);
  return Number.isFinite(num) && num >= 0 ? num : null;
}

export function formatAmountInput(value: number | null): string {
  if (value == null) return "";
  return String(value);
}
