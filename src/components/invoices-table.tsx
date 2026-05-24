import Link from "next/link";
import {
  DOCUMENT_TYPE_LABELS,
  INVOICE_STATUS_LABELS,
  formatCurrency,
  invoiceHasExtraction,
  type InvoiceRow,
} from "@/lib/invoices/constants";

type InvoicesTableProps = {
  invoices: InvoiceRow[];
};

function formatInvoiceDate(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("es-CR", { dateStyle: "medium" }).format(
    new Date(iso.includes("T") ? iso : `${iso}T12:00:00`),
  );
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

export function InvoicesTable({ invoices }: InvoicesTableProps) {
  if (invoices.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white px-6 py-12 text-center">
        <p className="text-sm text-zinc-600">No hay facturas que coincidan con los filtros.</p>
        <Link
          href="/dashboard"
          className="mt-3 inline-block text-sm font-medium text-emerald-700 hover:underline"
        >
          Volver al dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200 text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-zinc-600">Proveedor</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-600">Nº factura</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-600">Fecha</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-600">Tipo</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-600">Total</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-600">Categoría</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-600">Estado</th>
              <th className="px-4 py-3 text-right font-medium text-zinc-600">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {invoices.map((invoice) => {
              const extracted = invoiceHasExtraction(invoice);
              const mathValid = invoice.raw_ai_json?.math_valid !== false;

              return (
                <tr key={invoice.id} className="hover:bg-zinc-50/80">
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-900">
                      {invoice.vendor ?? invoice.file_name ?? "Sin nombre"}
                    </p>
                    {invoice.vendor && invoice.file_name && (
                      <p className="mt-0.5 max-w-[200px] truncate text-xs text-zinc-500">
                        {invoice.file_name}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">
                    {invoice.invoice_number ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-700">
                    {formatInvoiceDate(invoice.invoice_date)}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">
                    {DOCUMENT_TYPE_LABELS[invoice.document_type ?? "expense"]}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-900">
                    {extracted ? (
                      <>
                        {formatCurrency(invoice.total, invoice.currency)}
                        {!mathValid && (
                          <span className="ml-2 text-xs text-amber-700">Revisar</span>
                        )}
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">{invoice.category ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClasses(invoice.status)}`}
                    >
                      {INVOICE_STATUS_LABELS[invoice.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/invoices/${invoice.id}`}
                      className="font-medium text-emerald-700 hover:underline"
                    >
                      {invoice.status === "pending_review" ? "Revisar" : "Ver"}
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
