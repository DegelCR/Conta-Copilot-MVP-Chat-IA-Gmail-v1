import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import {
  extractedInvoiceSchema,
  normalizeExtractedInvoice,
  parseExtractedInvoice,
  totalsAreConsistent,
  type ExtractedInvoice,
} from "@/lib/invoices/schema";

const EXTRACTION_PROMPT = `Eres un asistente contable para Costa Rica. Extrae datos de esta factura o recibo.

Reglas:
- Montos numéricos sin símbolos de moneda (solo números).
- IVA típico en CR: 13%. Si hay un solo impuesto, es tax_amount.
- Si hay retención en la factura, extráela en retention_amount (sino null).
- Extrae invoice_number si aparece (consecutivo, número de documento o clave).
- Si total = subtotal + IVA - retención, respeta esa relación.
- Si no encuentras un campo, usa null.
- invoice_date en YYYY-MM-DD.
- currency: CRC salvo que indique claramente USD u otra.
- category: elige la más cercana de la lista sugerida.
- document_type: "expense" para facturas de compra/gasto; "income" solo si es claramente una venta o ingreso (factura que emite el usuario). Por defecto expense.`;

export function formatOpenAIError(error: unknown): string {
  if (error instanceof OpenAI.APIError) {
    if (error.status === 429) {
      return "Cuota de OpenAI agotada o sin créditos. Entra a platform.openai.com → Settings → Billing, añade método de pago o recarga créditos, y vuelve a intentar.";
    }
    if (error.status === 401) {
      return "API key de OpenAI inválida. Revisa OPENAI_API_KEY en .env.local.";
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Error desconocido al contactar OpenAI.";
}

function detectMimeType(fileName: string, fallback?: string | null): string {
  if (fallback) return fallback;
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".xml")) return "application/xml";
  return "application/octet-stream";
}

function isXml(mimeType: string, fileName: string) {
  return mimeType.includes("xml") || fileName.toLowerCase().endsWith(".xml");
}

function isImage(mimeType: string) {
  return mimeType.startsWith("image/");
}

function isPdf(mimeType: string, fileName: string) {
  return mimeType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf");
}

async function buildMessageContent(
  openai: OpenAI,
  buffer: Buffer,
  fileName: string,
  mimeType: string,
): Promise<OpenAI.Chat.Completions.ChatCompletionContentPart[]> {
  if (isXml(mimeType, fileName)) {
    const xmlText = buffer.toString("utf-8").slice(0, 80_000);
    return [
      {
        type: "text",
        text: `${EXTRACTION_PROMPT}\n\nContenido XML:\n${xmlText}`,
      },
    ];
  }

  if (isImage(mimeType)) {
    const base64 = buffer.toString("base64");
    return [
      { type: "text", text: EXTRACTION_PROMPT },
      {
        type: "image_url",
        image_url: { url: `data:${mimeType};base64,${base64}` },
      },
    ];
  }

  if (isPdf(mimeType, fileName)) {
    const uploaded = await openai.files.create({
      file: new File([new Uint8Array(buffer)], fileName, {
        type: "application/pdf",
      }),
      purpose: "user_data",
    });

    return [
      { type: "text", text: EXTRACTION_PROMPT },
      { type: "file", file: { file_id: uploaded.id } },
    ];
  }

  throw new Error("Formato no soportado para extracción con IA.");
}

async function callExtractionModel(
  openai: OpenAI,
  content: OpenAI.Chat.Completions.ChatCompletionContentPart[],
): Promise<ExtractedInvoice> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content }],
    response_format: zodResponseFormat(extractedInvoiceSchema, "invoice"),
    temperature: 0.1,
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("OpenAI no devolvió datos de extracción.");
  }

  let parsed = normalizeExtractedInvoice(parseExtractedInvoice(raw));

  if (!totalsAreConsistent(parsed)) {
    const retry = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `${EXTRACTION_PROMPT}\n\nLos totales no cuadraron (subtotal + IVA ≠ total). Revisa los montos con cuidado.`,
            },
            ...content.filter((part) => part.type !== "text"),
          ],
        },
      ],
      response_format: zodResponseFormat(extractedInvoiceSchema, "invoice"),
      temperature: 0,
    });

    const retryRaw = retry.choices[0]?.message?.content;
    if (retryRaw) {
      parsed = normalizeExtractedInvoice(parseExtractedInvoice(retryRaw));
    }
  }

  return parsed;
}

export async function extractInvoiceFromBuffer(
  buffer: Buffer,
  fileName: string,
  mimeTypeHint?: string | null,
): Promise<ExtractedInvoice> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY no está configurada en .env.local. Añádela y reinicia npm run dev.",
    );
  }

  const mimeType = detectMimeType(fileName, mimeTypeHint);
  const openai = new OpenAI({ apiKey });

  try {
    const content = await buildMessageContent(openai, buffer, fileName, mimeType);
    return await callExtractionModel(openai, content);
  } catch (error) {
    throw new Error(formatOpenAIError(error));
  }
}

export type ExtractionMeta = {
  extracted: ExtractedInvoice;
  mathValid: boolean;
};

export async function extractInvoiceFromBufferWithMeta(
  buffer: Buffer,
  fileName: string,
  mimeTypeHint?: string | null,
): Promise<ExtractionMeta> {
  const extracted = await extractInvoiceFromBuffer(buffer, fileName, mimeTypeHint);
  return {
    extracted,
    mathValid: totalsAreConsistent(extracted),
  };
}
