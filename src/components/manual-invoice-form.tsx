import { createManualInvoiceAction } from "@/app/actions/invoices";
import { FiscalDisclaimer } from "@/components/fiscal-disclaimer";
import { INVOICE_CATEGORIES } from "@/lib/invoices/schema";

export function ManualInvoiceForm() {
  return (
    <form action={createManualInvoiceAction} className="space-y-4">
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
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="manual_subtotal" className="block text-sm font-medium text-zinc-700">
              Subtotal
            </label>
            <input
              id="manual_subtotal"
              name="subtotal"
              type="text"
              placeholder="Opcional"
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
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
              placeholder="Opcional"
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
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
              required
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
          <select
            id="manual_category"
            name="category"
            defaultValue="Otros"
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
          >
            {INVOICE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
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
