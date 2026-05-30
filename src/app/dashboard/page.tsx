import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard-header";
import { InvoiceUpload } from "@/components/invoice-upload";
import { ManualInvoiceForm } from "@/components/manual-invoice-form";
import { RecentInvoices } from "@/components/recent-invoices";
import { formatCurrency, type InvoiceRow } from "@/lib/invoices/constants";
import { computeMonthlyStats } from "@/lib/invoices/stats";

type PageProps = {
  searchParams: Promise<{ manual_error?: string }>;
};

export default async function DashboardPage({ searchParams }: PageProps) {
  const { manual_error: manualError } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: invoices, error: invoicesError } = await supabase
    .from("invoices")
    .select(
      "id, file_name, file_path, status, document_type, vendor, invoice_number, invoice_date, subtotal, tax_amount, retention_amount, total, currency, category, raw_ai_json, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: confirmedForStats, error: statsError } = await supabase
    .from("invoices")
    .select(
      "status, document_type, invoice_date, created_at, total, tax_amount, retention_amount, currency",
    )
    .eq("status", "confirmed");

  const stats = computeMonthlyStats((confirmedForStats as InvoiceRow[] | null) ?? []);

  return (
    <div className="min-h-full bg-zinc-50">
      <DashboardHeader active="dashboard" />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-semibold text-zinc-900">Dashboard</h1>
        <p className="mt-2 text-zinc-600">
          Hola{user?.email ? `, ${user.email}` : ""}. Totales de{" "}
          <span className="font-medium capitalize">{stats.monthLabel}</span> según facturas{" "}
          <span className="font-medium">confirmadas</span> (fecha del documento o de subida).
        </p>

        {(statsError || invoicesError) && (
          <p className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
            No se pudieron cargar los totales. Si falta la columna{" "}
            <span className="font-medium">document_type</span>, ejecuta{" "}
            <span className="font-medium">supabase/add-document-type.sql</span> en Supabase.
          </p>
        )}

        {stats.confirmedOutsideMonth > 0 && stats.confirmedCount === 0 && (
          <p className="mt-3 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Tienes {stats.confirmedOutsideMonth} factura
            {stats.confirmedOutsideMonth === 1 ? "" : "s"} confirmada
            {stats.confirmedOutsideMonth === 1 ? "" : "s"} con fecha de documento de otro mes.
            Corrige la <span className="font-medium">fecha</span> en el detalle o vuelve a subirla
            este mes para que aparezca aquí.
          </p>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <p className="text-sm font-medium text-zinc-500">Ingresos (mes)</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900">
              {stats.incomeCount > 0 ? formatCurrency(stats.incomeTotal) : "—"}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {stats.incomeCount > 0
                ? `${stats.incomeCount} factura${stats.incomeCount === 1 ? "" : "s"} de ingreso`
                : "Marca facturas como ingreso al confirmar"}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <p className="text-sm font-medium text-zinc-500">Gastos (mes)</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900">
              {stats.expenseCount > 0
                ? formatCurrency(stats.expensesTotal)
                : "—"}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {stats.expenseCount} gasto{stats.expenseCount === 1 ? "" : "s"} confirmado
              {stats.expenseCount === 1 ? "" : "s"}
              {stats.incomeCount > 0 &&
                ` · ${stats.incomeCount} ingreso${stats.incomeCount === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <p className="text-sm font-medium text-zinc-500">IVA estimado</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900">
              {stats.expenseCount > 0 ? formatCurrency(stats.taxTotal) : "—"}
            </p>
            {stats.retentionTotal > 0 && (
              <p className="mt-1 text-xs text-zinc-500">
                Retenciones: {formatCurrency(stats.retentionTotal)}
              </p>
            )}
          </div>
        </div>

        <section className="mt-8 rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-zinc-900">Subir factura</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Opcional: PDF, foto o XML para que la IA extraiga los datos (máx. 10 MB).
          </p>
          <div className="mt-6">
            <InvoiceUpload embedded />
          </div>

          <div
            id="registro-manual"
            className="mt-10 scroll-mt-24 rounded-xl border-2 border-emerald-200 bg-emerald-50/40 p-6"
          >
            <h2 className="text-lg font-semibold text-zinc-900">Registrar sin archivo</h2>
            <p className="mt-1 text-sm text-zinc-700">
              Escribe los datos del tiquete o factura en papel. No necesitas subir foto ni archivo
              arriba.
            </p>

            {manualError && (
              <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {manualError}
              </p>
            )}

            <div className="mt-6">
              <ManualInvoiceForm />
            </div>
          </div>
        </section>

        <div className="mt-8">
          <RecentInvoices invoices={(invoices as InvoiceRow[] | null) ?? []} />
        </div>
      </main>
    </div>
  );
}
