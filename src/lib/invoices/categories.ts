import { INVOICE_CATEGORIES } from "@/lib/invoices/schema";

const MAX_CATEGORY_LENGTH = 60;

/** Normaliza texto de categoría (trim, longitud, capitalización simple). */
export function normalizeCategoryName(raw: string): string {
  const trimmed = raw.trim().replace(/\s+/g, " ");
  if (!trimmed) return "Otros";
  const capped = trimmed.slice(0, MAX_CATEGORY_LENGTH);
  return capped
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function categoryKey(name: string): string {
  return name.trim().toLowerCase();
}

/** Lista predeterminada + extras del usuario (sin duplicados). */
export function mergeInvoiceCategories(
  customCategories: string[] | null | undefined,
  usedInInvoices: string[] | null | undefined = [],
): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const name of INVOICE_CATEGORIES) {
    const key = categoryKey(name);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(name);
    }
  }

  for (const raw of [...(customCategories ?? []), ...(usedInInvoices ?? [])]) {
    const name = normalizeCategoryName(raw);
    const key = categoryKey(name);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(name);
  }

  return result;
}

export function isDefaultCategory(name: string): boolean {
  return INVOICE_CATEGORIES.some((c) => categoryKey(c) === categoryKey(name));
}
