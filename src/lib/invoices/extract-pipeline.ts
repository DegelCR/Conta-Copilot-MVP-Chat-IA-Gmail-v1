import { parseCrElectronicInvoiceXml, type CrXmlMeta } from "@/lib/hacienda/parse-cr-xml";
import {
  extractInvoiceFromBufferWithMeta,
  type ExtractionMeta,
} from "@/lib/invoices/extract";
import type { ExtractedInvoice } from "@/lib/invoices/schema";
import { totalsAreConsistent } from "@/lib/invoices/schema";

export type ExtractionSource = "cr_xml" | "openai";

export type InvoiceExtractionResult = ExtractionMeta & {
  source: ExtractionSource;
  hacienda?: CrXmlMeta;
};

function isXmlFile(fileName: string, mimeType?: string | null): boolean {
  const lower = fileName.toLowerCase();
  return lower.endsWith(".xml") || (mimeType?.includes("xml") ?? false);
}

export async function extractInvoiceData(
  buffer: Buffer,
  fileName: string,
  mimeTypeHint?: string | null,
): Promise<InvoiceExtractionResult> {
  if (isXmlFile(fileName, mimeTypeHint)) {
    const parsed = parseCrElectronicInvoiceXml(buffer);
    if (parsed) {
      return {
        extracted: parsed.extracted,
        mathValid: parsed.mathValid,
        source: "cr_xml",
        hacienda: parsed.meta,
      };
    }
  }

  const ai = await extractInvoiceFromBufferWithMeta(buffer, fileName, mimeTypeHint);
  return { ...ai, source: "openai" };
}

export function buildRawAiJson(result: InvoiceExtractionResult): Record<string, unknown> {
  return {
    ...result.extracted,
    math_valid: result.mathValid,
    extraction_source: result.source,
    hacienda: result.hacienda ?? null,
  };
}

export function mergeCrXmlIntoExtracted(
  extracted: ExtractedInvoice,
  meta: CrXmlMeta,
): ExtractedInvoice {
  return {
    ...extracted,
    vendor: extracted.vendor ?? meta.nombreEmisor,
    invoice_number:
      extracted.invoice_number ??
      (meta.clave && meta.clave.length >= 20 ? meta.clave : meta.numeroConsecutivo),
  };
}

export function recheckMath(extracted: ExtractedInvoice): boolean {
  return totalsAreConsistent(extracted);
}
