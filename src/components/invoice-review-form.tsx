"use client";

import Link from "next/link";
import { useActionState } from "react";
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
import { INVOICE_CATEGORIES } from "@/lib/invoices/schema";
import type { InvoiceDetail } from "@/lib/invoices/queries";
import { totalsAreConsistent } from "@/lib/invoices/schema";
import { ProcessInvoiceButton } from "@/components/process-invoice-button";

type InvoiceReviewFormProps = {
  invoice: InvoiceDetail;
};

const initialState: ReviewInvoiceState = {};

function PreviewPanel({ invoice }: { invoice: InvoiceDetail }) {
  const url = invoice.signedFileUrl;

  if (!url) {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center rounded-xl bg-zinc-100 p-6 text-sm text-zinc-500">
        No se pudo cargar la vista previa del archivo.
      </div>
    );
  }

  if (invoice.fileMime.startsWith("image/")) {
    return (
      <div className="flex min-h-[320px] items-center justify-center overflow-hidden rounded-xl bg-zinc-100 p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={invoice.file_name ?? "Factura"}
          className="max-h-[70vh] max-w-full rounded-lg object-contain"
        />
      </div>
    );
  }

  if (invoice.fileMime === "application/pdf") {
    return (
      <iframe
        src={url}
        title={invoice.file_name ?? "Factura PDF"}
        className="h-[70vh] w-full rounded-xl border border-zinc-200 bg-white"
      />
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6">
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

export function InvoiceReviewForm({ invoice }: InvoiceReviewFormProps) {
  const [state, formAction, pending] = useActionState(reviewInvoiceAction, initialState);
  const isPending = invoice.status === "pending_review";
  const isConfirmed = invoice.status === "confirmed";
  const isEditable = isPending || isConfirmed;
  const documentType = invoice.document_type ?? "expense";
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
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h2 className="text-sm font-medium text-zinc-700">Documento original</h2>
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

        {!mathValid && isEditable && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Subtotal + IVA − retención no coincide con el total. Corrige los montos antes de confirmar.
          </p>
        )}

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
              <select
                id="category"
                name="category"
                defaultValue={invoice.category ?? "Otros"}
                disabled={!isEditable}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 disabled:bg-zinc-50"
              >
                {INVOICE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
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
            <div className="flex flex-wrap gap-3 pt-2">
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

        {isConfirmed && (
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
