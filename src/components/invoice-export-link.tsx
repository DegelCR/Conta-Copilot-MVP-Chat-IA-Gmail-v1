import { invoiceListFiltersToSearchParams } from "@/lib/invoices/filter-params";
import type { InvoiceListFilters } from "@/lib/invoices/queries";

type InvoiceExportLinkProps = {
  filters: InvoiceListFilters;
};

export function InvoiceExportLink({ filters }: InvoiceExportLinkProps) {
  const query = invoiceListFiltersToSearchParams(filters);
  const href = `/api/invoices/export${query ? `?${query}` : ""}`;

  return (
    <a
      href={href}
      className="inline-flex items-center rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
    >
      Descargar CSV
    </a>
  );
}
