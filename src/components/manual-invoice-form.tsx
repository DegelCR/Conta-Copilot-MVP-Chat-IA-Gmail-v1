"use client";

import { useCallback, useState } from "react";
import { createManualInvoiceAction } from "@/app/actions/invoices";
import { CategoryField } from "@/components/category-field";
import { FiscalDisclaimer } from "@/components/fiscal-disclaimer";
import {
  formatAmountInput,
  ivaFromSubtotal,
  parseAmountInput,
  splitTotalWithIva,
  totalFromParts,
} from "@/lib/invoices/cr-iva";

type ManualInvoiceFormProps = {
  categories: string[];
};

type AmountSource = "total" | "subtotal" | "manual";

export function ManualInvoiceForm({ categories }: ManualInvoiceFormProps) {
  const [autoIva, setAutoIva] = useState(true);
  const [subtotal, setSubtotal] = useState("");
  const [taxAmount, setTaxAmount] = useState("");
  const [retention, setRetention] = useState("");
  const [total, setTotal] = useState("");
  const [lastSource, setLastSource] = useState<AmountSource>("total");

  const retentionNum = parseAmountInput(retention) ?? 0;

  const applyFromTotal = useCallback(
    (totalValue: number) => {
      const { subtotal: st, tax_amount: tax } = splitTotalWithIva(
        totalValue + retentionNum,
      );
      setSubtotal(formatAmountInput(st));
      setTaxAmount(formatAmountInput(tax));
      setTotal(formatAmountInput(totalValue));
    },
    [retentionNum],
  );

  const applyFromSubtotal = useCallback(
    (subtotalValue: number) => {
      const tax = ivaFromSubtotal(subtotalValue);
      const tot = totalFromParts(subtotalValue, tax, retentionNum);
      setSubtotal(formatAmountInput(subtotalValue));
      setTaxAmount(formatAmountInput(tax));
      setTotal(formatAmountInput(tot));
    },
    [retentionNum],
  );

  const handleTotalChange = (raw: string) => {
    setTotal(raw);
    if (!autoIva) return;
    const value = parseAmountInput(raw);
    if (value == null) return;
    setLastSource("total");
    applyFromTotal(value);
  };

  const handleSubtotalChange = (raw: string) => {
    setSubtotal(raw);
    if (!autoIva) return;
    const value = parseAmountInput(raw);
    if (value == null) return;
    setLastSource("subtotal");
    applyFromSubtotal(value);
  };

  const handleTaxChange = (raw: string) => {
    setTaxAmount(raw);
    if (autoIva) setLastSource("manual");
  };

  const handleRetentionChange = (raw: string) => {
    setRetention(raw);
    if (!autoIva) return;
    const ret = parseAmountInput(raw) ?? 0;
    const sub = parseAmountInput(subtotal);
    const tax = parseAmountInput(taxAmount);
    const tot = parseAmountInput(total);
    if (lastSource === "subtotal" && sub != null) {
      setTotal(formatAmountInput(totalFromParts(sub, tax ?? ivaFromSubtotal(sub), ret)));
    } else if (tot != null) {
      applyFromTotal(tot);
    } else if (sub != null) {
      applyFromSubtotal(sub);
    }
  };

  const handleAutoIvaChange = (enabled: boolean) => {
    setAutoIva(enabled);
    if (!enabled) return;
    const tot = parseAmountInput(total);
    const sub = parseAmountInput(subtotal);
    if (tot != null) {
      applyFromTotal(tot);
    } else if (sub != null) {
      applyFromSubtotal(sub);
    }
  };

  return (
    <form action={createManualInvoiceAction} className="space-y-4">
      <input type="hidden" name="auto_iva" value={autoIva ? "1" : "0"} />

      <div>
        <label htmlFor="manual_document_type" className="block text-sm font-medium text-zinc-700">
          Tipo
        </label>
        <select
          id="manual_document_type"
          name="document_type"
          defaultValue="expense"
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 sm:max-w-xs"
        >
          <option value="expense">Gasto (compra que pagaste)</option>
          <option value="income">Ingreso (venta o cobro)</option>
        </select>
      </div>

      <div>
        <label htmlFor="manual_vendor" className="block text-sm font-medium text-zinc-700">
          Proveedor o cliente <span className="text-red-600">*</span>
        </label>
        <input
          id="manual_vendor"
          name="vendor"
          type="text"
          required
          placeholder="Ej. supermercado, ferretería, restaurante"
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="manual_invoice_number" className="block text-sm font-medium text-zinc-700">
            Número de factura / consecutivo
          </label>
          <input
            id="manual_invoice_number"
            name="invoice_number"
            type="text"
            placeholder="El que aparece en el tiquete"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
          />
        </div>
        <div>
          <label htmlFor="manual_invoice_date" className="block text-sm font-medium text-zinc-700">
            Fecha del documento <span className="text-red-600">*</span>
          </label>
          <input
            id="manual_invoice_date"
            name="invoice_date"
            type="date"
            required
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
          />
        </div>
      </div>

      <fieldset className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-4">
        <legend className="px-1 text-sm font-medium text-zinc-800">Montos (como en el tiquete)</legend>

        <label className="mt-3 flex cursor-pointer items-start gap-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            checked={autoIva}
            onChange={(event) => handleAutoIvaChange(event.target.checked)}
            className="mt-0.5 rounded border-zinc-300"
          />
          <span>
            Calcular IVA 13% automáticamente
            <span className="mt-0.5 block text-xs text-zinc-500">
              Escribí el <strong>total pagado</strong> y se completan subtotal e IVA. También podés
              partir del subtotal.
            </span>
          </span>
        </label>

        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="manual_subtotal" className="block text-sm font-medium text-zinc-700">
              Subtotal
            </label>
            <input
              id="manual_subtotal"
              name="subtotal"
              type="text"
              inputMode="decimal"
              value={subtotal}
              onChange={(event) => handleSubtotalChange(event.target.value)}
              placeholder={autoIva ? "Se calcula" : "Opcional"}
              readOnly={autoIva && lastSource === "total"}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 read-only:bg-zinc-100"
            />
          </div>
          <div>
            <label htmlFor="manual_tax_amount" className="block text-sm font-medium text-zinc-700">
              IVA
            </label>
            <input
              id="manual_tax_amount"
              name="tax_amount"
              type="text"
              inputMode="decimal"
              value={taxAmount}
              onChange={(event) => handleTaxChange(event.target.value)}
              placeholder={autoIva ? "Se calcula" : "Opcional"}
              readOnly={autoIva && lastSource !== "manual"}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 read-only:bg-zinc-100"
            />
          </div>
          <div>
            <label
              htmlFor="manual_retention_amount"
              className="block text-sm font-medium text-zinc-700"
            >
              Retención
            </label>
            <input
              id="manual_retention_amount"
              name="retention_amount"
              type="text"
              inputMode="decimal"
              value={retention}
              onChange={(event) => handleRetentionChange(event.target.value)}
              placeholder="Opcional"
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
            />
          </div>
          <div>
            <label htmlFor="manual_total" className="block text-sm font-medium text-zinc-700">
              Total pagado <span className="text-red-600">*</span>
            </label>
            <input
              id="manual_total"
              name="total"
              type="text"
              inputMode="decimal"
              required
              value={total}
              onChange={(event) => handleTotalChange(event.target.value)}
              placeholder="Ej. 12500"
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
            />
          </div>
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="manual_currency" className="block text-sm font-medium text-zinc-700">
            Moneda
          </label>
          <select
            id="manual_currency"
            name="currency"
            defaultValue="CRC"
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
          >
            <option value="CRC">CRC (colones)</option>
            <option value="USD">USD (dólares)</option>
          </select>
        </div>
        <div>
          <label htmlFor="manual_category" className="block text-sm font-medium text-zinc-700">
            Categoría
          </label>
          <CategoryField id="manual_category" categories={categories} defaultValue="Otros" />
        </div>
      </div>

      <FiscalDisclaimer variant="compact" />

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          name="intent"
          value="confirm"
          className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          Guardar y confirmar
        </button>
        <button
          type="submit"
          name="intent"
          value="review"
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          Guardar para revisar después
        </button>
      </div>
    </form>
  );
}
