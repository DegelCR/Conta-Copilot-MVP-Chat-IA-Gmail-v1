import Link from "next/link";
import { notFound } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";
import { InvoiceReviewForm } from "@/components/invoice-review-form";
import { getInvoiceForUser } from "@/lib/invoices/queries";

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
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-lg font-semibold text-emerald-700">
              Conta Copilot
            </Link>
            <nav className="hidden gap-4 text-sm sm:flex">
              <Link href="/dashboard" className="text-zinc-600 hover:text-zinc-900">
                Dashboard
              </Link>
              <Link href="/dashboard/invoices" className="font-medium text-emerald-700">
                Facturas
              </Link>
            </nav>
          </div>
          <SignOutButton />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
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
            {invoice.file_name ?? "Documento"}
            {invoice.status === "pending_review"
              ? " — corrige los datos si la IA se equivocó y confirma."
              : invoice.status === "confirmed"
                ? " — puedes editar los datos o reprocesar con IA."
                : "."}
          </p>
        </div>

        <InvoiceReviewForm invoice={invoice} />
      </main>
    </div>
  );
}
