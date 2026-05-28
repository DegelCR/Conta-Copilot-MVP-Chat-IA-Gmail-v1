"use client";

import { useActionState } from "react";
import { lookupTaxpayerAction, type LookupTaxpayerState } from "@/app/actions/hacienda";
import type { CrXmlMeta } from "@/lib/hacienda/parse-cr-xml";

type HaciendaFiscalPanelProps = {
  hacienda: CrXmlMeta | null;
  extractionSource?: string | null;
};

const initialState: LookupTaxpayerState = {};

export function HaciendaFiscalPanel({ hacienda, extractionSource }: HaciendaFiscalPanelProps) {
  const [state, formAction, pending] = useActionState(lookupTaxpayerAction, initialState);
  const defaultId = hacienda?.cedulaEmisor ?? "";

  return (
    <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
      <p className="font-medium">Datos fiscales (Costa Rica)</p>
      {extractionSource === "cr_xml" && (
        <p className="mt-1 text-xs text-sky-800">
          Campos leídos del XML electrónico (sin enviar a Hacienda).
        </p>
      )}
      {hacienda && (
        <dl className="mt-3 grid gap-1 text-xs sm:grid-cols-2">
          {hacienda.tipoComprobante && (
            <>
              <dt className="text-sky-700">Tipo</dt>
              <dd>{hacienda.tipoComprobante}</dd>
            </>
          )}
          {hacienda.clave && (
            <>
              <dt className="text-sky-700">Clave</dt>
              <dd className="break-all font-mono">{hacienda.clave}</dd>
            </>
          )}
          {hacienda.cedulaEmisor && (
            <>
              <dt className="text-sky-700">Cédula emisor</dt>
              <dd>{hacienda.cedulaEmisor}</dd>
            </>
          )}
        </dl>
      )}

      <form action={formAction} className="mt-4 flex flex-wrap items-end gap-2">
        <div className="min-w-[12rem] flex-1">
          <label htmlFor="hacienda-identificacion" className="block text-xs font-medium text-sky-800">
            Consultar emisor en Hacienda (API pública)
          </label>
          <input
            id="hacienda-identificacion"
            name="identificacion"
            type="text"
            inputMode="numeric"
            defaultValue={defaultId}
            placeholder="Cédula jurídica o física"
            className="mt-1 w-full rounded-lg border border-sky-300 bg-white px-3 py-2 text-sm text-zinc-900"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg border border-sky-600 bg-white px-3 py-2 text-xs font-medium text-sky-800 hover:bg-sky-100 disabled:opacity-60"
        >
          {pending ? "Consultando…" : "Consultar"}
        </button>
      </form>

      {state.error && (
        <p className="mt-2 rounded bg-red-50 px-2 py-1 text-xs text-red-700">{state.error}</p>
      )}
      {state.data && (
        <div className="mt-2 rounded bg-white/80 px-3 py-2 text-xs">
          <p className="font-medium text-zinc-900">{state.data.nombre ?? "Sin nombre en respuesta"}</p>
          {state.data.situacion && (
            <p className="mt-1 text-zinc-600">Situación: {state.data.situacion}</p>
          )}
          {state.data.regimen && <p className="text-zinc-600">Régimen: {state.data.regimen}</p>}
          {state.data.actividades.length > 0 && (
            <p className="mt-1 text-zinc-600">
              Actividades: {state.data.actividades.slice(0, 3).join("; ")}
            </p>
          )}
        </div>
      )}

      <p className="mt-3 text-[11px] leading-relaxed text-sky-700">
        Consulta informativa. No valida el comprobante ante Hacienda ni sustituye asesoría fiscal.
        El envío a sandbox requiere credenciales del contribuyente (RUT).
      </p>
    </div>
  );
}
