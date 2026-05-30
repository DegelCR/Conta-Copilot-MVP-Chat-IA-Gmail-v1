"use client";

import Link from "next/link";
import { useActionState, useCallback, useEffect, useState } from "react";
import {
  reviewInvoiceAction,
  type ReviewInvoiceState,
} from "@/app/actions/invoices";
import {
  DOCUMENT_TYPE_LABELS,
  INVOICE_STATUS_LABELS,
  formatCurrency,
  type InvoiceStatus,
} from "@/lib/invoices/constants";
import { CategoryField } from "@/components/category-field";
import type { InvoiceDetail } from "@/lib/invoices/queries";
import { totalsAreConsistent } from "@/lib/invoices/schema";
import { FiscalDisclaimer } from "@/components/fiscal-disclaimer";
import { HaciendaFiscalPanel } from "@/components/hacienda-fiscal-panel";
import { ProcessInvoiceButton } from "@/components/process-invoice-button";
import type { CrXmlMeta } from "@/lib/hacienda/parse-cr-xml";
import { isManualEntryInvoice } from "@/lib/invoices/manual";

type InvoiceReviewFormProps = {
  invoice: InvoiceDetail;
  categories: string[];
};

const initialState: ReviewInvoiceState = {};

function expectedTotalFromParts(
  subtotal: number | null,
  tax_amount: number | null,
  retention_amount: number | null,
): number | null {
  if (subtotal == null) return null;
  const tax = tax_amount ?? 0;
  const retention = retention_amount ?? 0;
  return subtotal + tax - retention;
}

function InvoiceAmountSummary({
  subtotal,
  tax_amount,
  retention_amount,
  total,
  currency,
}: {
  subtotal: number | null;
  tax_amount: number | null;
  retention_amount: number | null;
  total: number | null;
  currency: string;
}) {
  const expected = expectedTotalFromParts(subtotal, tax_amount, retention_amount);
  const hasParts = subtotal != null || tax_amount != null || retention_amount != null;

  if (total == null && !hasParts) {
    return (
      <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
        No se detectó el total. Complétalo abajo o usa <strong>Procesar con IA</strong>.
      </p>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Resumen de montos</p>
      <p className="mt-1 text-2xl font-semibold text-zinc-900">
        {total != null ? formatCurrency(total, currency) : "Total no indicado"}
      </p>
      {hasParts && (
        <p className="mt-2 text-sm text-zinc-600">
          {subtotal != null && <span>Subtotal {formatCurrency(subtotal, currency)}</span>}
          {tax_amount != null && tax_amount > 0 && (
            <span>
              {subtotal != null ? " · " : ""}
              IVA {formatCurrency(tax_amount, currency)}
            </span>
          )}
          {retention_amount != null && retention_amount > 0 && (
            <span>
              {" · "}
              Retención {formatCurrency(retention_amount, currency)}
            </span>
          )}
          {total == null && expected != null && (
            <span className="block mt-1 text-amber-800">
              Calculado (subtotal + IVA − retención): {formatCurrency(expected, currency)}
            </span>
          )}
        </p>
      )}
    </div>
  );
}

function haciendaMetaFromRaw(raw: Record<string, unknown> | null | undefined): CrXmlMeta | null {
  const block = raw?.hacienda;
  if (!block || typeof block !== "object") return null;
  const h = block as Record<string, unknown>;
  return {
    clave: typeof h.clave === "string" ? h.clave : null,
    numeroConsecutivo: typeof h.numeroConsecutivo === "string" ? h.numeroConsecutivo : null,
    tipoComprobante: typeof h.tipoComprobante === "string" ? h.tipoComprobante : null,
    cedulaEmisor: typeof h.cedulaEmisor === "string" ? h.cedulaEmisor : null,
    nombreEmisor: typeof h.nombreEmisor === "string" ? h.nombreEmisor : null,
  };
}

function PreviewToolbar({
  fileName,
  fileUrl,
  onExpand,
}: {
  fileName: string | null;
  fileUrl: string | null;
  onExpand: () => void;
}) {
  return (
    <div className="mb-2 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onExpand}
        disabled={!fileUrl}
        className="rounded-lg border border-emerald-600 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Ampliar vista
      </button>
      {fileUrl && (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Abrir en pestaña nueva
        </a>
      )}
      {fileName && (
        <span className="text-xs text-zinc-500 truncate max-w-[12rem] sm:max-w-none">
          {fileName}
        </span>
      )}
    </div>
  );
}

function ManualEntryPreview({ className }: { className?: string }) {
  return (
    <div
      className={`flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center ${className ?? ""}`}
    >
      <p className="text-sm font-medium text-zinc-800">Registro manual</p>
      <p className="mt-2 max-w-sm text-sm text-zinc-600">
        Factura física ingresada campo por campo (sin correo ni archivo). Revisa los datos a la
        derecha y confirma cuando estén correctos.
      </p>
    </div>
  );
}

function PreviewContent({
  invoice,
  className,
}: {
  invoice: InvoiceDetail;
  className?: string;
}) {
  if (isManualEntryInvoice(invoice)) {
    return <ManualEntryPreview className={className} />;
  }

  const url = invoice.signedFileUrl;

  if (!url) {
    return (
      <div
        className={`flex min-h-[280px] items-center justify-center rounded-xl bg-zinc-100 p-6 text-sm text-zinc-500 ${className ?? ""}`}
      >
        No se pudo cargar la vista previa del archivo.
      </div>
    );
  }

  if (invoice.fileMime.startsWith("image/")) {
    return (
      <div
        className={`flex min-h-[280px] items-center justify-center overflow-auto rounded-xl bg-zinc-100 p-4 ${className ?? ""}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={invoice.file_name ?? "Factura"}
          className="max-h-full max-w-full rounded-lg object-contain"
        />
      </div>
    );
  }

  if (invoice.fileMime === "application/pdf") {
    return (
      <iframe
        src={`${url}#view=FitH`}
        title={invoice.file_name ?? "Factura PDF"}
        className={`min-h-[280px] w-full rounded-xl border border-zinc-200 bg-white ${className ?? ""}`}
      />
    );
  }

  return (
    <div className={`rounded-xl border border-zinc-200 bg-zinc-50 p-6 ${className ?? ""}`}>
      <p className="text-sm text-zinc-600">
        Vista previa no disponible para este formato.{" "}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-emerald-700 underline"
        >
          Abrir {invoice.file_name ?? "archivo"}
        </a>
      </p>
    </div>
  );
}

function PreviewExpandedModal({
  invoice,
  open,
  onClose,
}: {
  invoice: InvoiceDetail;
  open: boolean;
  onClose: () => void;
}) {
  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleEscape);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, handleEscape]);

  if (!open) return null;

  const url = invoice.signedFileUrl;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-zinc-900/90"
      role="dialog"
      aria-modal="true"
      aria-label="Vista ampliada del documento"
    >
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-4 py-3 text-white">
        <p className="truncate text-sm font-medium">
          {invoice.file_name ?? "Documento"}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/30 px-3 py-1.5 text-sm hover:bg-white/10"
            >
              Nueva pestaña
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
          >
            Cerrar
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 p-3 sm:p-4">
        {url && invoice.fileMime.startsWith("image/") ? (
          <div className="flex h-full items-center justify-center overflow-auto rounded-lg bg-zinc-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={invoice.file_name ?? "Factura"}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        ) : url && invoice.fileMime === "application/pdf" ? (
          <iframe
            src={`${url}#view=FitH`}
            title={invoice.file_name ?? "Factura PDF"}
            className="h-full w-full rounded-lg border border-zinc-200 bg-white"
          />
        ) : (
          <p className="text-center text-sm text-white/80">No se pudo cargar el documento.</p>
        )}
      </div>
    </div>
  );
}

function PreviewPanel({ invoice }: { invoice: InvoiceDetail }) {
  const [expanded, setExpanded] = useState(false);
  const manualEntry = isManualEntryInvoice(invoice);

  return (
    <>
      {!manualEntry && (
        <PreviewToolbar
          fileName={invoice.file_name}
          fileUrl={invoice.signedFileUrl}
          onExpand={() => setExpanded(true)}
        />
      )}
      <PreviewContent invoice={invoice} className="h-[min(70vh,640px)]" />
      {!manualEntry && (
        <PreviewExpandedModal
          invoice={invoice}
          open={expanded}
          onClose={() => setExpanded(false)}
        />
      )}
    </>
  );
}

export function InvoiceReviewForm({ invoice, categories }: InvoiceReviewFormProps) {
  const [state, formAction, pending] = useActionState(reviewInvoiceAction, initialState);
  const isPending = invoice.status === "pending_review";
  const isConfirmed = invoice.status === "confirmed";
  const isEditable = isPending || isConfirmed;
  const documentType = invoice.document_type ?? "expense";
  const extractionSource =
    typeof invoice.raw_ai_json?.extraction_source === "string"
      ? invoice.raw_ai_json.extraction_source
      : null;
  const haciendaMeta = haciendaMetaFromRaw(invoice.raw_ai_json);
  const manualEntry = isManualEntryInvoice(invoice);
  const mathValid = totalsAreConsistent({
    vendor: invoice.vendor,
    invoice_number: invoice.invoice_number,
    invoice_date: invoice.invoice_date,
    subtotal: invoice.subtotal,
    tax_amount: invoice.tax_amount,
    retention_amount: invoice.retention_amount,
    total: invoice.total,
    currency: invoice.currency,
    category: invoice.category,
    document_type: documentType,
  });

  return (
    <div className="grid gap-8 xl:grid-cols-[1.15fr_1fr]">
      <div>
        <h2 className="text-sm font-medium text-zinc-700">
          {manualEntry ? "Origen del registro" : "Documento original"}
        </h2>
        <div className="mt-3">
          <PreviewPanel invoice={invoice} />
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-medium text-zinc-700">Datos extraídos</h2>
          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700">
            {INVOICE_STATUS_LABELS[invoice.status as InvoiceStatus]}
          </span>
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
            {DOCUMENT_TYPE_LABELS[documentType]}
          </span>
        </div>

        <InvoiceAmountSummary
          subtotal={invoice.subtotal}
          tax_amount={invoice.tax_amount}
          retention_amount={invoice.retention_amount}
          total={invoice.total}
          currency={invoice.currency ?? "CRC"}
        />

        {!mathValid && isEditable && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Subtotal + IVA − retención no coincide con el total. Corrige los montos antes de confirmar.
          </p>
        )}

        <div className="mt-4">
          <HaciendaFiscalPanel hacienda={haciendaMeta} extractionSource={extractionSource} />
        </div>

        <form action={formAction} className="mt-4 space-y-4">
          <input type="hidden" name="invoiceId" value={invoice.id} />

          <div>
            <label htmlFor="document_type" className="block text-sm font-medium text-zinc-700">
              Tipo
            </label>
            <select
              id="document_type"
              name="document_type"
              defaultValue={documentType}
              disabled={!isEditable}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 disabled:bg-zinc-50"
            >
              <option value="expense">{DOCUMENT_TYPE_LABELS.expense}</option>
              <option value="income">{DOCUMENT_TYPE_LABELS.income}</option>
            </select>
            <p className="mt-1 text-xs text-zinc-500">
              Gasto: compras y pagos. Ingreso: ventas o cobros que registras.
            </p>
          </div>

          <div>
            <label htmlFor="vendor" className="block text-sm font-medium text-zinc-700">
              {documentType === "income" ? "Cliente" : "Proveedor"}
            </label>
            <input
              id="vendor"
              name="vendor"
              type="text"
              defaultValue={invoice.vendor ?? ""}
              readOnly={!isEditable}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 read-only:bg-zinc-50"
            />
          </div>

          <div>
            <label htmlFor="invoice_number" className="block text-sm font-medium text-zinc-700">
              Número de factura
            </label>
            <input
              id="invoice_number"
              name="invoice_number"
              type="text"
              placeholder="Consecutivo o clave"
              defaultValue={invoice.invoice_number ?? ""}
              readOnly={!isEditable}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 read-only:bg-zinc-50"
            />
          </div>

          <div>
            <label htmlFor="invoice_date" className="block text-sm font-medium text-zinc-700">
              Fecha
            </label>
            <input
              id="invoice_date"
              name="invoice_date"
              type="date"
              defaultValue={invoice.invoice_date ?? ""}
              readOnly={!isEditable}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 read-only:bg-zinc-50"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="subtotal" className="block text-sm font-medium text-zinc-700">
                Subtotal
              </label>
              <input
                id="subtotal"
                name="subtotal"
                type="number"
                step="0.01"
                min="0"
                defaultValue={invoice.subtotal ?? ""}
                readOnly={!isEditable}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 read-only:bg-zinc-50"
              />
            </div>
            <div>
              <label htmlFor="tax_amount" className="block text-sm font-medium text-zinc-700">
                IVA
              </label>
              <input
                id="tax_amount"
                name="tax_amount"
                type="number"
                step="0.01"
                min="0"
                defaultValue={invoice.tax_amount ?? ""}
                readOnly={!isEditable}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 read-only:bg-zinc-50"
              />
            </div>
            <div>
              <label htmlFor="retention_amount" className="block text-sm font-medium text-zinc-700">
                Retención
              </label>
              <input
                id="retention_amount"
                name="retention_amount"
                type="number"
                step="0.01"
                min="0"
                defaultValue={invoice.retention_amount ?? ""}
                readOnly={!isEditable}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 read-only:bg-zinc-50"
              />
            </div>
            <div>
              <label htmlFor="total" className="block text-sm font-medium text-zinc-700">
                Total
              </label>
              <input
                id="total"
                name="total"
                type="number"
                step="0.01"
                min="0"
                defaultValue={invoice.total ?? ""}
                readOnly={!isEditable}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 read-only:bg-zinc-50"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-zinc-700">
                Moneda
              </label>
              <select
                id="currency"
                name="currency"
                defaultValue={invoice.currency ?? "CRC"}
                disabled={!isEditable}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 disabled:bg-zinc-50"
              >
                <option value="CRC">CRC (colones)</option>
                <option value="USD">USD (dólares)</option>
              </select>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-zinc-700">
                Categoría
              </label>
              <CategoryField
                id="category"
                categories={categories}
                defaultValue={invoice.category ?? "Otros"}
                disabled={!isEditable}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 read-only:bg-zinc-50 disabled:bg-zinc-50"
              />
            </div>
          </div>

          {state.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
          )}

          {state.message && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {state.message}
            </p>
          )}

          {isPending ? (
            <div className="space-y-3 pt-2">
              <FiscalDisclaimer variant="compact" />
              <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                name="intent"
                value="confirm"
                disabled={pending}
                className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {pending ? "Guardando…" : "Confirmar factura"}
              </button>
              <button
                type="submit"
                name="intent"
                value="reject"
                disabled={pending}
                className="rounded-lg border border-red-300 px-5 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
              >
                Rechazar
              </button>
              <Link
                href="/dashboard/invoices"
                className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Volver
              </Link>
              </div>
            </div>
          ) : isConfirmed ? (
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                name="intent"
                value="save"
                disabled={pending}
                className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {pending ? "Guardando…" : "Guardar cambios"}
              </button>
              <Link
                href="/dashboard/invoices"
                className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Volver
              </Link>
            </div>
          ) : (
            <div className="rounded-lg bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
              Esta factura fue rechazada. Total registrado:{" "}
              {formatCurrency(invoice.total, invoice.currency)}
              <div className="mt-4">
                <Link
                  href="/dashboard/invoices"
                  className="font-medium text-emerald-700 hover:underline"
                >
                  ← Volver a facturas
                </Link>
              </div>
            </div>
          )}
        </form>

        {isConfirmed && !manualEntry && invoice.file_path && (
          <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
            <p className="text-sm text-zinc-600">
              ¿Quieres volver a extraer datos con IA? Se sobrescribirán los campos actuales.
            </p>
            <div className="mt-2">
              <ProcessInvoiceButton
                invoiceId={invoice.id}
                className="flex flex-col items-start gap-1"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
