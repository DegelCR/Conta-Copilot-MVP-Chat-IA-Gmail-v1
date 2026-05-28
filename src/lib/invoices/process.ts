import type { SupabaseClient } from "@supabase/supabase-js";
import { INVOICE_BUCKET } from "@/lib/invoices/constants";
import { buildRawAiJson, extractInvoiceData } from "@/lib/invoices/extract-pipeline";

type ProcessResult = {
  vendor: string | null;
  total: number | null;
  mathValid: boolean;
};

export async function processInvoiceExtraction(
  supabase: SupabaseClient,
  invoiceId: string,
  userId: string,
): Promise<ProcessResult> {
  const { data: invoice, error: fetchError } = await supabase
    .from("invoices")
    .select("id, file_path, file_name, user_id, document_type")
    .eq("id", invoiceId)
    .eq("user_id", userId)
    .single();

  if (fetchError || !invoice?.file_path) {
    throw new Error("Factura no encontrada.");
  }

  const { data: fileBlob, error: downloadError } = await supabase.storage
    .from(INVOICE_BUCKET)
    .download(invoice.file_path);

  if (downloadError || !fileBlob) {
    throw new Error("No se pudo descargar el archivo de la factura.");
  }

  const buffer = Buffer.from(await fileBlob.arrayBuffer());
  const result = await extractInvoiceData(
    buffer,
    invoice.file_name ?? "factura.pdf",
  );
  const { extracted, mathValid } = result;

  const { error: updateError } = await supabase
    .from("invoices")
    .update({
      vendor: extracted.vendor,
      invoice_number: extracted.invoice_number,
      invoice_date: extracted.invoice_date,
      subtotal: extracted.subtotal,
      tax_amount: extracted.tax_amount,
      retention_amount: extracted.retention_amount,
      total: extracted.total,
      currency: extracted.currency ?? "CRC",
      category: extracted.category,
      document_type: extracted.document_type ?? invoice.document_type ?? "expense",
      raw_ai_json: buildRawAiJson(result),
      updated_at: new Date().toISOString(),
    })
    .eq("id", invoiceId)
    .eq("user_id", userId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return {
    vendor: extracted.vendor,
    total: extracted.total,
    mathValid,
  };
}

export function formatInvoiceSummary(result: ProcessResult): string {
  const vendor = result.vendor ?? "Proveedor desconocido";
  const total =
    result.total != null
      ? new Intl.NumberFormat("es-CR", {
          style: "currency",
          currency: "CRC",
        }).format(result.total)
      : "monto no detectado";
  const mathNote = result.mathValid ? "" : " Revisa los montos: no cuadran del todo.";
  return `${vendor} — ${total}.${mathNote}`;
}
