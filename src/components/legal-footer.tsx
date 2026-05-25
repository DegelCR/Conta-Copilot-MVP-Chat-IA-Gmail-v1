import Link from "next/link";

export function LegalFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-white px-4 py-6 text-center text-sm text-zinc-500 sm:px-6">
      <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <Link href="/privacidad" className="font-medium text-emerald-700 hover:underline">
          Política de privacidad
        </Link>
        <span className="text-zinc-300" aria-hidden>
          ·
        </span>
        <Link href="/terminos" className="font-medium text-emerald-700 hover:underline">
          Términos de uso
        </Link>
      </nav>
      <p className="mt-2 text-xs text-zinc-400">Conta Copilot — versión beta</p>
    </footer>
  );
}
