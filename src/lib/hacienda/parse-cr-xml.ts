import type { ExtractedInvoice } from "@/lib/invoices/schema";
import { normalizeExtractedInvoice, totalsAreConsistent } from "@/lib/invoices/schema";
import { getFirstTagContent, parseAmount, parseInvoiceDate } from "@/lib/hacienda/xml-tags";

export type CrXmlMeta = {
  clave: string | null;
  numeroConsecutivo: string | null;
  tipoComprobante: string | null;
  cedulaEmisor: string | null;
  nombreEmisor: string | null;
};

export type CrXmlParseResult = {
  extracted: ExtractedInvoice;
  meta: CrXmlMeta;
  mathValid: boolean;
};

const ROOT_TIPO: Record<string, string> = {
  facturaelectronica: "FE",
  tiqueteelectronico: "TE",
  notacreditoelectronica: "NC",
  notadebitoelectronica: "ND",
  facturaelectronicacompra: "FEC",
  facturaelectronicaexportacion: "FEE",
  recibopago: "REP",
};

function getXmlBlock(xml: string, localName: string): string | null {
  const re = new RegExp(
    `<(?:[\\w.-]+:)?${localName}(?:\\s[^>]*)?>([\\s\\S]*?)</(?:[\\w.-]+:)?${localName}>`,
    "i",
  );
  return xml.match(re)?.[1] ?? null;
}

function detectTipoComprobante(xml: string): string | null {
  const root = xml.match(/<(?:[\w.-]+:)?(\w+)[\s>]/i)?.[1];
  if (!root) return null;
  return ROOT_TIPO[root.toLowerCase()] ?? root.toUpperCase();
}

function looksLikeCrElectronicInvoice(xml: string): boolean {
  const lower = xml.toLowerCase();
  return (
    lower.includes("facturaelectronica") ||
    lower.includes("tiqueteelectronico") ||
    lower.includes("notacreditoelectronica") ||
    lower.includes("notadebitoelectronica") ||
    lower.includes("<clave>") ||
    lower.includes(":clave>")
  );
}

/**
 * Intenta mapear XML de comprobante electrónico CR (v4.x) sin llamar a OpenAI.
 * Devuelve null si el archivo no parece un comprobante conocido.
 */
export function parseCrElectronicInvoiceXml(buffer: Buffer): CrXmlParseResult | null {
  const xml = buffer.toString("utf-8");
  if (!looksLikeCrElectronicInvoice(xml)) return null;

  const clave = getFirstTagContent(xml, ["Clave"]);
  const numeroConsecutivo = getFirstTagContent(xml, ["NumeroConsecutivo"]);
  const fecha = parseInvoiceDate(getFirstTagContent(xml, ["FechaEmision"]));
  const emisorBlock = getXmlBlock(xml, "Emisor");
  const emisorScope = emisorBlock ?? xml;

  const nombreEmisor =
    getFirstTagContent(emisorScope, ["Nombre"]) ??
    getFirstTagContent(emisorScope, ["NombreComercial"]);

  const cedulaEmisor =
    getFirstTagContent(emisorScope, ["Numero"]) ??
    getFirstTagContent(emisorScope, ["IdentificacionExtranjero"]);

  const subtotal =
    parseAmount(getFirstTagContent(xml, ["TotalVentaNeta"])) ??
    parseAmount(getFirstTagContent(xml, ["TotalGravado"])) ??
    parseAmount(getFirstTagContent(xml, ["TotalVenta"]));

  const tax_amount = parseAmount(getFirstTagContent(xml, ["TotalImpuesto", "TotalImpuestoAsumidoEmisorFabrica"]));
  const total =
    parseAmount(getFirstTagContent(xml, ["TotalComprobante"])) ??
    parseAmount(getFirstTagContent(xml, ["TotalVenta"]));

  const currency =
    getFirstTagContent(xml, ["CodigoMoneda", "CodigoTipoMoneda"])?.toUpperCase() ?? "CRC";

  const invoice_number =
    clave && clave.length >= 20
      ? clave
      : numeroConsecutivo
        ? numeroConsecutivo
        : clave;

  const extracted = normalizeExtractedInvoice({
    vendor: nombreEmisor,
    invoice_number,
    invoice_date: fecha,
    subtotal,
    tax_amount,
    retention_amount: null,
    total,
    currency,
    category: "Otros",
    document_type: "expense",
  });

  return {
    extracted,
    meta: {
      clave: clave ?? null,
      numeroConsecutivo: numeroConsecutivo ?? null,
      tipoComprobante: detectTipoComprobante(xml),
      cedulaEmisor: cedulaEmisor?.replace(/\D/g, "") || null,
      nombreEmisor: nombreEmisor ?? null,
    },
    mathValid: totalsAreConsistent(extracted),
  };
}
