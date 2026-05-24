import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard-header";
import { GmailPanel } from "@/components/gmail-panel";
import { createClient } from "@/lib/supabase/server";
import { getGmailConnectionPublic } from "@/lib/gmail/connection";

/** Sincronización Gmail puede tardar con muchos adjuntos del mes */
export const maxDuration = 120;

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function pickParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = params[key];
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function GmailPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const connection = user
    ? await getGmailConnectionPublic(supabase, user.id)
    : null;

  let banner: string | null = null;
  let bannerTone: "success" | "error" | "info" = "info";

  const error = pickParam(params, "error");
  const connected = pickParam(params, "connected");
  const autoSync = pickParam(params, "auto_sync") === "1";

  if (error) {
    banner = decodeURIComponent(error);
    bannerTone = "error";
  } else if (connected === "1" && autoSync) {
    banner =
      "Gmail conectado. Sincronizando adjuntos del mes (sin IA automática; usa «Procesar con IA» en cada factura).";
    bannerTone = "success";
  } else if (connected === "1") {
    banner = "Gmail conectado correctamente.";
    bannerTone = "success";
  }

  return (
    <div className="min-h-full bg-zinc-50">
      <DashboardHeader active="gmail" />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-emerald-700 hover:underline"
          >
            ← Volver al dashboard
          </Link>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-900">Gmail</h1>
          <p className="mt-1 text-zinc-600">
            Importa facturas desde adjuntos de correo. Los tokens se guardan cifrados y nunca se
            muestran en el navegador.
          </p>
        </div>

        <GmailPanel
          connection={connection}
          banner={banner}
          bannerTone={bannerTone}
          autoSyncOnMount={Boolean(connection && connected === "1" && autoSync)}
        />
      </main>
    </div>
  );
}
