import type { SupabaseClient } from "@supabase/supabase-js";
import {
  INVOICE_BUCKET,
  MAX_INVOICE_FILE_BYTES,
  type DocumentType,
  isAllowedInvoiceFileName,
  sanitizeFileName,
  validateInvoiceFileContent,
} from "@/lib/invoices/constants";
import {
  formatInvoiceSummary,
  processInvoiceExtraction,
} from "@/lib/invoices/process";

export type InvoiceSource = "manual" | "gmail";

export type IngestInvoiceInput = {
  userId: string;
  fileName: string;
  buffer: Buffer;
  mimeType?: string | null;
  source?: InvoiceSource;
  sourceMeta?: Record<string, unknown> | null;
  documentType?: DocumentType;
  runExtraction?: boolean;
};

export type IngestInvoiceResult = {
  invoiceId: string;
  extractionOk: boolean;
  extractionError?: string;
  summary?: string;
};

export async function ingestInvoiceFile(
  supabase: SupabaseClient,
  input: IngestInvoiceInput,
): Promise<IngestInvoiceResult> {
  const {
    userId,
    fileName,
    buffer,
    mimeType,
    source = "manual",
    sourceMeta = null,
    documentType = "expense",
    runExtraction = true,
  } = input;

  if (buffer.length === 0) {
    throw new Error("El archivo está vacío.");
  }

  if (buffer.length > MAX_INVOICE_FILE_BYTES) {
    throw new Error("El archivo supera el límite de 10 MB.");
  }

  if (!isAllowedInvoiceFileName(fileName, mimeType)) {
    throw new Error("Formato no permitido. Usa PDF, JPG, PNG, WEBP, GIF o XML.");
  }

  if (!validateInvoiceFileContent(buffer, fileName)) {
    throw new Error(
      "El contenido del archivo no coincide con su extensión. Sube un PDF, imagen o XML válido.",
    );
  }

  const safeName = sanitizeFileName(fileName || "factura");
  const storagePath = `${userId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(INVOICE_BUCKET)
    .upload(storagePath, buffer, {
      contentType: mimeType || undefined,
      upsert: false,
    });

  if (uploadError) {
    if (uploadError.message.toLowerCase().includes("bucket")) {
      throw new Error(
        "Bucket 'invoices' no encontrado. Ejecuta supabase/storage.sql en Supabase.",
      );
    }
    throw new Error(uploadError.message);
  }

  const { data: inserted, error: insertError } = await supabase
    .from("invoices")
    .insert({
      user_id: userId,
      file_path: storagePath,
      file_name: fileName,
      status: "pending_review",
      document_type: documentType,
      source,
      source_meta: sourceMeta,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    await supabase.storage.from(INVOICE_BUCKET).remove([storagePath]);
    if (insertError?.message.includes("relation") || insertError?.code === "42P01") {
      throw new Error(
        "Tabla 'invoices' no existe. Ejecuta supabase/schema.sql en Supabase.",
      );
    }
    throw new Error(insertError?.message ?? "Error al guardar la factura.");
  }

  if (!runExtraction) {
    return { invoiceId: inserted.id, extractionOk: false };
  }

  try {
    const result = await processInvoiceExtraction(supabase, inserted.id, userId);
    return {
      invoiceId: inserted.id,
      extractionOk: true,
      summary: formatInvoiceSummary(result),
    };
  } catch (extractError) {
    const detail =
      extractError instanceof Error ? extractError.message : "Error desconocido";
    return {
      invoiceId: inserted.id,
      extractionOk: false,
      extractionError: detail,
    };
  }
}
