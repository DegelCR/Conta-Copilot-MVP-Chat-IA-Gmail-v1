"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  isAllowedInvoiceFile,
  MAX_INVOICE_FILE_BYTES,
  type DocumentType,
} from "@/lib/invoices/constants";
import { ingestInvoiceFile } from "@/lib/invoices/ingest";
import {
  formatInvoiceSummary,
  processInvoiceExtraction,
} from "@/lib/invoices/process";

export type UploadInvoiceState = {
  error?: string;
  message?: string;
};

export type ProcessInvoiceState = {
  error?: string;
  message?: string;
};

export async function uploadInvoiceAction(
  _prevState: UploadInvoiceState,
  formData: FormData,
): Promise<UploadInvoiceState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debes iniciar sesión para subir facturas." };
  }

  const fileEntry = formData.get("file");

  if (!fileEntry || !(fileEntry instanceof File) || fileEntry.size === 0) {
    return { error: "Selecciona un archivo (PDF, imagen o XML)." };
  }

  if (fileEntry.size > MAX_INVOICE_FILE_BYTES) {
    return { error: "El archivo supera el límite de 10 MB." };
  }

  if (!isAllowedInvoiceFile(fileEntry)) {
    return {
      error: "Formato no permitido. Usa PDF, JPG, PNG, WEBP, GIF o XML.",
    };
  }

  const documentType = parseDocumentType(formData.get("document_type"));

  try {
    const buffer = Buffer.from(await fileEntry.arrayBuffer());
    const result = await ingestInvoiceFile(supabase, {
      userId: user.id,
      fileName: fileEntry.name,
      buffer,
      mimeType: fileEntry.type,
      source: "manual",
      documentType,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/invoices");

    if (result.extractionOk && result.summary) {
      return {
        message: `"${fileEntry.name}" subida y analizada con IA: ${result.summary} Estado: pendiente de revisión.`,
      };
    }

    const detail = result.extractionError ?? "Error desconocido";
    return {
      message: `"${fileEntry.name}" subida correctamente, pero la extracción con IA falló: ${detail}. Usa "Procesar con IA" en la lista.`,
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Error al subir la factura.";
    return { error: detail };
  }
}

export type ReviewInvoiceState = {
  error?: string;
  message?: string;
};

function parseOptionalNumber(value: FormDataEntryValue | null): number | null {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const num = Number(text);
  return Number.isFinite(num) ? num : null;
}

function parseDocumentType(value: FormDataEntryValue | null): DocumentType {
  return String(value ?? "") === "income" ? "income" : "expense";
}

function parseInvoiceFields(formData: FormData) {
  return {
    vendor: String(formData.get("vendor") ?? "").trim() || null,
    invoiceNumber: String(formData.get("invoice_number") ?? "").trim() || null,
    invoiceDate: String(formData.get("invoice_date") ?? "").trim() || null,
    subtotal: parseOptionalNumber(formData.get("subtotal")),
    taxAmount: parseOptionalNumber(formData.get("tax_amount")),
    retentionAmount: parseOptionalNumber(formData.get("retention_amount")),
    total: parseOptionalNumber(formData.get("total")),
    currency: String(formData.get("currency") ?? "CRC").trim() || "CRC",
    category: String(formData.get("category") ?? "Otros").trim() || "Otros",
    documentType: parseDocumentType(formData.get("document_type")),
  };
}

function revalidateInvoicePaths(invoiceId: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/invoices");
  revalidatePath(`/dashboard/invoices/${invoiceId}`);
}

export async function reviewInvoiceAction(
  _prevState: ReviewInvoiceState,
  formData: FormData,
): Promise<ReviewInvoiceState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debes iniciar sesión." };
  }

  const invoiceId = String(formData.get("invoiceId") ?? "");
  const intent = String(formData.get("intent") ?? "confirm");

  if (!invoiceId) {
    return { error: "Factura no válida." };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("invoices")
    .select("id, status")
    .eq("id", invoiceId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !existing) {
    return { error: "Factura no encontrada." };
  }

  if (existing.status === "rejected") {
    return { error: "Las facturas rechazadas no se pueden editar." };
  }

  if (existing.status === "confirmed" && intent === "save") {
    const fields = parseInvoiceFields(formData);

    if (fields.total == null) {
      return { error: "Indica el total de la factura." };
    }

    const { error } = await supabase
      .from("invoices")
      .update({
        vendor: fields.vendor,
        invoice_number: fields.invoiceNumber,
        invoice_date: fields.invoiceDate,
        subtotal: fields.subtotal,
        tax_amount: fields.taxAmount,
        retention_amount: fields.retentionAmount,
        total: fields.total,
        currency: fields.currency,
        category: fields.category,
        document_type: fields.documentType,
        updated_at: new Date().toISOString(),
      })
      .eq("id", invoiceId)
      .eq("user_id", user.id);

    if (error) return { error: error.message };

    revalidateInvoicePaths(invoiceId);
    return { message: "Cambios guardados correctamente." };
  }

  if (existing.status !== "pending_review") {
    return { error: "Esta factura ya fue revisada." };
  }

  if (intent === "reject") {
    const { error } = await supabase
      .from("invoices")
      .update({ status: "rejected", updated_at: new Date().toISOString() })
      .eq("id", invoiceId)
      .eq("user_id", user.id);

    if (error) return { error: error.message };

    revalidateInvoicePaths(invoiceId);
    redirect("/dashboard");
  }

  const fields = parseInvoiceFields(formData);

  if (fields.total == null) {
    return { error: "Indica el total de la factura antes de confirmar." };
  }

  const { error: updateError } = await supabase
    .from("invoices")
    .update({
      vendor: fields.vendor,
      invoice_number: fields.invoiceNumber,
      invoice_date: fields.invoiceDate,
      subtotal: fields.subtotal,
      tax_amount: fields.taxAmount,
      retention_amount: fields.retentionAmount,
      total: fields.total,
      currency: fields.currency,
      category: fields.category,
      document_type: fields.documentType,
      status: "confirmed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", invoiceId)
    .eq("user_id", user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidateInvoicePaths(invoiceId);
  redirect("/dashboard");
}

export async function processInvoiceAction(
  _prevState: ProcessInvoiceState,
  formData: FormData,
): Promise<ProcessInvoiceState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debes iniciar sesión." };
  }

  const invoiceId = String(formData.get("invoiceId") ?? "");
  if (!invoiceId) {
    return { error: "Factura no válida." };
  }

  const { data: existing } = await supabase
    .from("invoices")
    .select("id, status")
    .eq("id", invoiceId)
    .eq("user_id", user.id)
    .single();

  if (!existing) {
    return { error: "Factura no encontrada." };
  }

  if (existing.status === "rejected") {
    return { error: "No se puede reprocesar una factura rechazada." };
  }

  try {
    const result = await processInvoiceExtraction(supabase, invoiceId, user.id);
    revalidateInvoicePaths(invoiceId);
    return {
      message: `Extracción completada: ${formatInvoiceSummary(result)}`,
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Error desconocido";
    return { error: detail };
  }
}
