import { invoiceListFiltersToSearchParams } from "@/lib/invoices/filter-params";
import type { InvoiceListFilters } from "@/lib/invoices/queries";

type InvoiceExportLinkProps = {
  filters: InvoiceListFilters;
};

const linkClass =
  "inline-flex items-center rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50";

export function InvoiceExportLink({ filters }: InvoiceExportLinkProps) {
  const query = invoiceListFiltersToSearchParams(filters);
  const base = `/api/invoices/export${query ? `?${query}` : ""}`;
  const excelHref = base;
  const csvHref = `${base}${query ? "&" : "?"}format=csv`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a href={excelHref} className={`${linkClass} border-emerald-600 text-emerald-800`}>
        Descargar Excel
      </a>
      <a href={csvHref} className={linkClass}>
        CSV
      </a>
    </div>
  );
}
