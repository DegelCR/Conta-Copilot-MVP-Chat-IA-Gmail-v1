import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { InvoiceReviewForm } from "@/components/invoice-review-form";
import { getInvoiceForUser } from "@/lib/invoices/queries";
import { isManualEntryInvoice, manualEntryLabel } from "@/lib/invoices/manual";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function InvoiceReviewPage({ params }: PageProps) {
  const { id } = await params;
  const invoice = await getInvoiceForUser(id);

  if (!invoice) {
    notFound();
  }

  return (
    <div className="min-h-full bg-zinc-50">
      <DashboardHeader active="invoices" />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8">
          <Link
            href="/dashboard/invoices"
            className="text-sm font-medium text-emerald-700 hover:underline"
          >
            ← Volver a facturas
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900">
            {invoice.status === "pending_review" ? "Revisar factura" : "Detalle de factura"}
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            {isManualEntryInvoice(invoice)
              ? manualEntryLabel(invoice)
              : (invoice.file_name ?? "Documento")}
            {invoice.status === "pending_review"
              ? isManualEntryInvoice(invoice)
                ? " — revisa los datos ingresados y confirma."
                : " — corrige los datos si la IA se equivocó y confirma."
              : invoice.status === "confirmed"
                ? isManualEntryInvoice(invoice)
                  ? " — puedes editar los datos."
                  : " — puedes editar los datos o reprocesar con IA."
                : "."}
          </p>
        </div>

        <InvoiceReviewForm invoice={invoice} />
      </main>
    </div>
  );
}
