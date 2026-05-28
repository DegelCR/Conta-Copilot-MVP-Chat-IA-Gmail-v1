/** Extrae texto del primer tag local que coincida (ignora prefijos de namespace). */
export function getFirstTagContent(xml: string, localNames: string[]): string | null {
  for (const name of localNames) {
    const re = new RegExp(
      `<(?:[\\w.-]+:)?${name}(?:\\s[^>]*)?>([^<]*)</(?:[\\w.-]+:)?${name}>`,
      "i",
    );
    const match = xml.match(re);
    const value = match?.[1]?.trim();
    if (value) return value;
  }
  return null;
}

export function parseAmount(value: string | null): number | null {
  if (value == null || value === "") return null;
  const normalized = value.replace(/,/g, "").trim();
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

export function parseInvoiceDate(value: string | null): string | null {
  if (!value) return null;
  const iso = value.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(iso)) return iso.slice(0, 10);
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}
