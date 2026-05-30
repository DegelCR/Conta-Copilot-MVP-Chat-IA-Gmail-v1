"use client";

import { useActionState, useRef, useState } from "react";
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

function setInputFile(input: HTMLInputElement, file: File) {
  const dt = new DataTransfer();
  dt.items.add(file);
  input.files = dt.files;
}

function updateFileHint(fileName: string) {
  const hint = document.getElementById("file-hint");
  if (hint) hint.textContent = fileName;
}

type InvoiceUploadProps = {
  /** Solo el formulario de subida, sin envoltorio de sección */
  embedded?: boolean;
};

export function InvoiceUpload({ embedded = false }: InvoiceUploadProps) {
  const [state, formAction, pending] = useActionState(uploadInvoiceAction, initialState);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [dropError, setDropError] = useState<string | null>(null);

  function assignFile(file: File | undefined) {
    if (!file || !inputRef.current) return;
    setDropError(null);
    setInputFile(inputRef.current, file);
    updateFileHint(file.name);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    const files = event.dataTransfer.files;
    if (files.length > 1) {
      setDropError("Solo un archivo por subida; se seleccionó el primero.");
    }
    assignFile(files[0]);
  }

  const form = (
      <form action={formAction} className={embedded ? "space-y-4" : "mt-6 space-y-4"}>
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
          className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition ${
            dragActive
              ? "border-emerald-500 bg-emerald-50/50"
              : "border-zinc-300 bg-zinc-50 hover:border-emerald-400 hover:bg-emerald-50/30"
          }`}
          onClick={() => inputRef.current?.click()}
          onDragEnter={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            if (event.currentTarget === event.target) setDragActive(false);
          }}
          onDrop={handleDrop}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Subir factura: clic o arrastrar un archivo"
        >
          <input
            ref={inputRef}
            type="file"
            name="file"
            accept={acceptTypes}
            required
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                setDropError(null);
                updateFileHint(file.name);
              }
            }}
          />
          <p className="text-sm font-medium text-zinc-800">
            Arrastra un archivo aquí o haz clic para elegirlo
          </p>
          <p className="mt-1 text-xs text-zinc-500">Un archivo por subida (máx. 10 MB)</p>
          <p id="file-hint" className="mt-2 text-xs text-zinc-500">
            {ALLOWED_INVOICE_EXTENSIONS.join(", ")}
          </p>
        </div>

        {dropError && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{dropError}</p>
        )}

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
  );

  if (embedded) {
    return form;
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-zinc-900">Subir factura</h2>
      <p className="mt-1 text-sm text-zinc-600">
        Tras subir, la IA extrae proveedor, montos y categoría. Máximo 10 MB.
      </p>
      {form}
    </section>
  );
}
