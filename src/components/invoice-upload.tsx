"use client";

import { useActionState, useRef } from "react";
import {
  uploadInvoiceAction,
  type UploadInvoiceState,
} from "@/app/actions/invoices";
import { ALLOWED_INVOICE_EXTENSIONS } from "@/lib/invoices/constants";

const initialState: UploadInvoiceState = {};

const acceptTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/xml",
  "text/xml",
].join(",");

export function InvoiceUpload() {
  const [state, formAction, pending] = useActionState(uploadInvoiceAction, initialState);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-zinc-900">Subir factura</h2>
      <p className="mt-1 text-sm text-zinc-600">
        Tras subir, la IA extrae proveedor, montos y categoría. Máximo 10 MB.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label htmlFor="document_type" className="block text-sm font-medium text-zinc-700">
            Tipo
          </label>
          <select
            id="document_type"
            name="document_type"
            defaultValue="expense"
            disabled={pending}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 disabled:bg-zinc-50 sm:max-w-xs"
          >
            <option value="expense">Gasto</option>
            <option value="income">Ingreso</option>
          </select>
          <p className="mt-1 text-xs text-zinc-500">
            Puedes cambiarlo luego al revisar antes de confirmar.
          </p>
        </div>

        <div
          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 px-6 py-10 transition hover:border-emerald-400 hover:bg-emerald-50/30"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          role="button"
          tabIndex={0}
        >
          <input
            ref={inputRef}
            type="file"
            name="file"
            accept={acceptTypes}
            required
            className="sr-only"
            onChange={(event) => {
              const label = event.target.files?.[0]?.name;
              const hint = document.getElementById("file-hint");
              if (hint && label) hint.textContent = label;
            }}
          />
          <p className="text-sm font-medium text-zinc-800">
            Haz clic para elegir un archivo
          </p>
          <p id="file-hint" className="mt-2 text-xs text-zinc-500">
            {ALLOWED_INVOICE_EXTENSIONS.join(", ")}
          </p>
        </div>

        {state.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
        )}
        {state.message && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60 sm:w-auto"
        >
          {pending ? "Subiendo y analizando…" : "Subir factura"}
        </button>
      </form>
    </section>
  );
}
