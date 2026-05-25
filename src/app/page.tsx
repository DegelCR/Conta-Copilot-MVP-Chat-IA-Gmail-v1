import Link from "next/link";
import { FiscalDisclaimer } from "@/components/fiscal-disclaimer";
import { LegalFooter } from "@/components/legal-footer";

export default function Home() {
  return (
    <div className="min-h-full bg-gradient-to-b from-emerald-50 to-zinc-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-xl font-semibold text-emerald-800">Conta Copilot</span>
        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-white/60"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Crear cuenta
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-16">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
            Copiloto contable con IA
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-zinc-900 sm:text-5xl">
            Organiza facturas sin Excel ni carpetas interminables
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-zinc-600">
            Sube PDFs e imágenes, deja que la IA extraiga proveedor, montos e IVA, y consulta
            tus gastos desde un dashboard simple. Pensado para contadores, freelancers y
            pequeños negocios en Costa Rica.
          </p>
          <FiscalDisclaimer variant="compact" className="mt-4 max-w-xl" />
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/signup"
              className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Empezar gratis
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-zinc-300 bg-white px-6 py-3 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>

        <section className="mt-20 grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "Sube facturas",
              description: "PDF, XML e imágenes en un solo lugar.",
            },
            {
              title: "IA extrae datos",
              description: "Proveedor, fecha, subtotal, IVA y total automáticamente.",
            },
            {
              title: "Dashboard claro",
              description: "Ingresos, gastos y tendencias sin complicaciones.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-zinc-900">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">{item.description}</p>
            </article>
          ))}
        </section>
      </main>
      <LegalFooter />
    </div>
  );
}
