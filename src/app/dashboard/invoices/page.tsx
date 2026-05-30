import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard-header";
import { InvoiceExportLink } from "@/components/invoice-export-link";
import { InvoiceFilters } from "@/components/invoice-filters";
import { InvoicesTable } from "@/components/invoices-table";
import { parseInvoiceListFilters } from "@/lib/invoices/filter-params";
import { getInvoiceCategoriesForUser } from "@/lib/invoices/categories-db";
import { listInvoicesForUser } from "@/lib/invoices/queries";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function InvoicesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = parseInvoiceListFilters(params);
  const [invoices, categories] = await Promise.all([
    listInvoicesForUser(filters),
    getInvoiceCategoriesForUser(),
  ]);

  return (
    <div className="min-h-full bg-zinc-50">
      <DashboardHeader active="invoices" />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-emerald-700 hover:underline"
          >
            ← Volver al dashboard
          </Link>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-900">Facturas</h1>
          <p className="mt-1 text-zinc-600">
            Busca y filtra todas tus facturas. Fecha según emisión del documento.
          </p>
        </div>

        <InvoiceFilters filters={filters} categories={categories} />

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-zinc-600">
            {invoices.length === 0
              ? "0 resultados"
              : `${invoices.length} factura${invoices.length === 1 ? "" : "s"}`}
            {invoices.length === 200 && " (máximo mostrado)"}
          </p>
          <InvoiceExportLink filters={filters} />
        </div>

        <div className="mt-4">
          <InvoicesTable invoices={invoices} />
        </div>
      </main>
    </div>
  );
}
