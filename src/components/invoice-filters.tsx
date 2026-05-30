import Link from "next/link";
import { CategoryField } from "@/components/category-field";
import {
  DOCUMENT_TYPE_LABELS,
  INVOICE_STATUS_LABELS,
  type DocumentType,
  type InvoiceStatus,
} from "@/lib/invoices/constants";
import type { InvoiceListFilters } from "@/lib/invoices/queries";

type InvoiceFiltersProps = {
  filters: InvoiceListFilters;
  categories: string[];
};

const STATUS_OPTIONS: InvoiceStatus[] = ["pending_review", "confirmed", "rejected"];

export function InvoiceFilters({ filters, categories }: InvoiceFiltersProps) {
  const hasActiveFilters = Boolean(
    filters.q ||
      filters.status ||
      filters.documentType ||
      filters.category ||
      filters.vendor ||
      filters.from ||
      filters.to,
  );

  return (
    <form
      method="get"
      className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block sm:col-span-2 lg:col-span-3">
          <span className="text-sm font-medium text-zinc-700">Buscar</span>
          <input
            type="search"
            name="q"
            defaultValue={filters.q ?? ""}
            placeholder="Proveedor, número de factura o archivo…"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Estado</span>
          <select
            name="status"
            defaultValue={filters.status ?? ""}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">Todos</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {INVOICE_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Tipo</span>
          <select
            name="document_type"
            defaultValue={filters.documentType ?? ""}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">Todos</option>
            {(Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[]).map((type) => (
              <option key={type} value={type}>
                {DOCUMENT_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Categoría</span>
          <CategoryField
            id="filter_category"
            name="category"
            categories={categories}
            defaultValue={filters.category ?? ""}
            showHint={false}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <p className="mt-1 text-xs text-zinc-500">Deja vacío para ver todas las categorías.</p>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Proveedor</span>
          <input
            type="text"
            name="vendor"
            defaultValue={filters.vendor ?? ""}
            placeholder="Filtrar por emisor…"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Desde</span>
          <input
            type="date"
            name="from"
            defaultValue={filters.from ?? ""}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Hasta</span>
          <input
            type="date"
            name="to"
            defaultValue={filters.to ?? ""}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Aplicar filtros
        </button>
        {hasActiveFilters && (
          <Link
            href="/dashboard/invoices"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            Limpiar filtros
          </Link>
        )}
      </div>
    </form>
  );
}
