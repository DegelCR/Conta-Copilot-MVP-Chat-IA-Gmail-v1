"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  processInvoiceAction,
  type ProcessInvoiceState,
} from "@/app/actions/invoices";

const initialState: ProcessInvoiceState = {};

type ProcessInvoiceButtonProps = {
  invoiceId: string;
  className?: string;
};

export function ProcessInvoiceButton({ invoiceId, className }: ProcessInvoiceButtonProps) {
  const [state, formAction, pending] = useActionState(processInvoiceAction, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.message) {
      router.refresh();
    }
  }, [state.message, router]);

  return (
    <form action={formAction} className={className ?? "flex flex-col items-end gap-1"}>
      <input type="hidden" name="invoiceId" value={invoiceId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-emerald-600 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-60"
      >
        {pending ? "Procesando…" : "Procesar con IA"}
      </button>
      {state.error && (
        <span className="max-w-xs text-right text-xs text-red-600">{state.error}</span>
      )}
      {state.message && (
        <span className="max-w-xs text-right text-xs text-emerald-700">{state.message}</span>
      )}
    </form>
  );
}
