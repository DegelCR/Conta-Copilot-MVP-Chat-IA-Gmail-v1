import Link from "next/link";

export default function InvoiceNotFound() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-zinc-50 px-6">
      <h1 className="text-xl font-semibold text-zinc-900">Factura no encontrada</h1>
      <p className="mt-2 text-sm text-zinc-600">
        No existe o no tienes permiso para verla.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
      >
        Ir al dashboard
      </Link>
    </div>
  );
}
