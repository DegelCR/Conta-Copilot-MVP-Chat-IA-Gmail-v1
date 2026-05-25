import Link from "next/link";
import type { ReactNode } from "react";

type LegalPageShellProps = {
  title: string;
  updatedAt: string;
  children: ReactNode;
};

export function LegalPageShell({ title, updatedAt, children }: LegalPageShellProps) {
  return (
    <div className="min-h-full bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <Link href="/" className="text-lg font-semibold text-emerald-700">
            Conta Copilot
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            Iniciar sesión
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <h1 className="text-3xl font-semibold text-zinc-900">{title}</h1>
        <p className="mt-2 text-sm text-zinc-500">Última actualización: {updatedAt}</p>
        <div className="prose-legal mt-8 space-y-6 text-sm leading-relaxed text-zinc-700">
          {children}
        </div>
        <p className="mt-10">
          <Link href="/" className="font-medium text-emerald-700 hover:underline">
            ← Volver al inicio
          </Link>
        </p>
      </main>
    </div>
  );
}
