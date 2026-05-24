import Link from "next/link";
import {
  DOCUMENT_TYPE_LABELS,
  INVOICE_STATUS_LABELS,
  formatCurrency,
  invoiceHasExtraction,
  type InvoiceRow,
} from "@/lib/invoices/constants";
import { ProcessInvoiceButton } from "@/components/process-invoice-button";

type RecentInvoicesProps = {
  invoices: InvoiceRow[];
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function statusClasses(status: InvoiceRow["status"]) {
  switch (status) {
    case "confirmed":
      return "bg-emerald-100 text-emerald-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-amber-100 text-amber-800";
  }
}

export function RecentInvoices({ invoices }: RecentInvoicesProps) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Facturas recientes</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Datos extraídos con IA. Estado pendiente hasta que revises y confirmes.
          </p>
        </div>
        <Link
          href="/dashboard/invoices"
          className="shrink-0 text-sm font-medium text-emerald-700 hover:underline"
        >
          Ver todas
        </Link>
      </div>

      {invoices.length === 0 ? (
        <p className="mt-6 rounded-lg bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-500">
          Aún no hay facturas. Sube tu primera arriba.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-zinc-100">
          {invoices.map((invoice) => {
            const extracted = invoiceHasExtraction(invoice);
            const mathValid = invoice.raw_ai_json?.math_valid !== false;
            const documentType = invoice.document_type ?? "expense";

            return (
              <li
                key={invoice.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-zinc-900">
                    {invoice.vendor ?? invoice.file_name ?? "Sin nombre"}
                  </p>
                  {invoice.vendor && invoice.file_name && (
                    <p className="truncate text-xs text-zinc-500">{invoice.file_name}</p>
                  )}
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-600">
                    <span>{formatDate(invoice.created_at)}</span>
                    {extracted && (
                      <>
                        <span>{formatCurrency(invoice.total, invoice.currency)}</span>
                        {invoice.category && <span>{invoice.category}</span>}
                        {!mathValid && (
                          <span className="text-amber-700">Montos a revisar</span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <div className="flex flex-wrap justify-end gap-1">
                    <span
                      className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${statusClasses(invoice.status)}`}
                    >
                      {INVOICE_STATUS_LABELS[invoice.status]}
                    </span>
                    {invoice.status === "confirmed" && (
                      <span className="inline-flex w-fit rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-800">
                        {DOCUMENT_TYPE_LABELS[documentType]}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/dashboard/invoices/${invoice.id}`}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                  >
                    {invoice.status === "pending_review" ? "Revisar" : "Ver detalle"}
                  </Link>
                  {!extracted && invoice.status === "pending_review" && (
                    <ProcessInvoiceButton invoiceId={invoice.id} />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
