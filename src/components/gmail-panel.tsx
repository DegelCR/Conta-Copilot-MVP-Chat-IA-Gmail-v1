"use client";

import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import {
  disconnectGmailAction,
  syncGmailAction,
  type GmailActionState,
} from "@/app/actions/gmail";
import type { GmailConnectionPublic } from "@/lib/gmail/connection";

type GmailPanelProps = {
  connection: GmailConnectionPublic | null;
  banner?: string | null;
  bannerTone?: "success" | "error" | "info";
  /** Tras OAuth: primera sincronización en la página, no en /api/gmail/callback */
  autoSyncOnMount?: boolean;
};

const initialState: GmailActionState = {};

function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function bannerClasses(tone: GmailPanelProps["bannerTone"]) {
  switch (tone) {
    case "success":
      return "bg-emerald-50 text-emerald-900";
    case "error":
      return "bg-red-50 text-red-800";
    default:
      return "bg-amber-50 text-amber-900";
  }
}

export function GmailPanel({
  connection,
  banner,
  bannerTone = "info",
  autoSyncOnMount = false,
}: GmailPanelProps) {
  const router = useRouter();
  const autoSyncStarted = useRef(false);
  const [connectingToGoogle, setConnectingToGoogle] = useState(false);
  const [syncState, syncAction, syncPending] = useActionState(syncGmailAction, initialState);
  const [disconnectState, disconnectAction, disconnectPending] = useActionState(
    disconnectGmailAction,
    initialState,
  );

  const pending = syncPending || disconnectPending;

  useEffect(() => {
    if (!autoSyncOnMount || !connection || autoSyncStarted.current) return;
    autoSyncStarted.current = true;
    router.replace("/dashboard/gmail");
    startTransition(() => {
      syncAction();
    });
  }, [autoSyncOnMount, connection, router, syncAction]);

  return (
    <div className="space-y-6">
      {banner && (
        <p className={`rounded-lg px-4 py-3 text-sm ${bannerClasses(bannerTone)}`}>{banner}</p>
      )}

      {(syncState.error || disconnectState.error) && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          {syncState.error ?? disconnectState.error}
        </p>
      )}

      {(syncState.message || disconnectState.message) && (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {syncState.message ?? disconnectState.message}
        </p>
      )}

      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        {connection ? (
          <>
            <p className="text-sm font-medium text-zinc-500">Cuenta conectada</p>
            <p className="mt-1 text-xl font-semibold text-zinc-900">{connection.google_email}</p>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-zinc-500">Conectado</dt>
                <dd className="font-medium text-zinc-900">
                  {formatDateTime(connection.connected_at)}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Última sincronización</dt>
                <dd className="font-medium text-zinc-900">
                  {formatDateTime(connection.last_synced_at)}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-zinc-500">Importación desde</dt>
                <dd className="font-medium text-zinc-900">
                  {formatDateTime(connection.backfill_from)} (mes actual, hora CR)
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap gap-3">
              <form action={syncAction}>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {syncPending ? "Sincronizando…" : "Sincronizar"}
                </button>
              </form>
              <form action={disconnectAction}>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-60"
                >
                  {disconnectPending ? "Desconectando…" : "Desconectar"}
                </button>
              </form>
            </div>
          </>
        ) : (
          <>
            <p className="text-zinc-600">
              Conecta tu Gmail para importar automáticamente adjuntos de factura (PDF, imágenes,
              XML) desde el correo del mes en curso. Las facturas quedan en{" "}
              <span className="font-medium">pendiente de revisión</span>, igual que una subida
              manual.
            </p>
            <a
              href="/api/gmail/connect"
              onClick={() => setConnectingToGoogle(true)}
              aria-busy={connectingToGoogle}
              className="mt-6 inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {connectingToGoogle ? "Redirigiendo a Google…" : "Conectar Gmail"}
            </a>
          </>
        )}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm text-zinc-600">
        <p className="font-medium text-zinc-800">Qué hace la sincronización</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>Primera vez: busca correos con adjuntos desde el 1.º del mes (Costa Rica).</li>
          <li>Después: solo correos nuevos (historial incremental de Gmail).</li>
          <li>Los adjuntos se importan sin IA; procésalos desde Facturas cuando quieras.</li>
          <li>No importa el mismo adjunto dos veces.</li>
          <li>Solo lectura de Gmail (<span className="font-mono text-xs">gmail.readonly</span>).</li>
        </ul>
      </div>
    </div>
  );
}
