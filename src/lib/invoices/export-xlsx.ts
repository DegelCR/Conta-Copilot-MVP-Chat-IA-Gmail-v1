import ExcelJS from "exceljs";
import type { ExportRow } from "@/lib/invoices/export-rows";
import { EXPORT_HEADERS, invoicesToExportRows } from "@/lib/invoices/export-rows";
import type { InvoiceRow } from "@/lib/invoices/constants";

const AMOUNT_COLS = [5, 6, 7, 8] as const;
const MAX_COL_WIDTH = 48;
const MIN_COL_WIDTH = 10;

function rowToValues(row: ExportRow): (string | number | null)[] {
  return [
    row.vendor,
    row.invoiceNumber,
    row.date,
    row.documentType,
    row.subtotal,
    row.tax,
    row.retention,
    row.total,
    row.currency,
    row.category,
    row.status,
  ];
}

function autoFitColumns(sheet: ExcelJS.Worksheet) {
  sheet.columns.forEach((column) => {
    let maxLength = MIN_COL_WIDTH;
    column.eachCell?.({ includeEmpty: true }, (cell) => {
      const text =
        cell.value == null
          ? ""
          : typeof cell.value === "number"
            ? cell.value.toLocaleString("es-CR")
            : String(cell.value);
      maxLength = Math.max(maxLength, text.length + 2);
    });
    column.width = Math.min(maxLength, MAX_COL_WIDTH);
  });
}

export async function invoicesToXlsxBuffer(invoices: InvoiceRow[]): Promise<Buffer> {
  const rows = invoicesToExportRows(invoices);
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Conta Copilot";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Facturas", {
    views: [{ state: "frozen", ySplit: 1, activeCell: "A2" }],
  });

  sheet.addRow([...EXPORT_HEADERS]);
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FF14532D" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFECFDF5" },
  };
  headerRow.alignment = { vertical: "middle", horizontal: "left" };
  headerRow.height = 22;

  for (const row of rows) {
    sheet.addRow(rowToValues(row));
  }

  const lastRow = sheet.rowCount;
  for (let r = 2; r <= lastRow; r++) {
    const dataRow = sheet.getRow(r);
    dataRow.alignment = { vertical: "middle", wrapText: false };
    for (const col of AMOUNT_COLS) {
      const cell = dataRow.getCell(col);
      if (typeof cell.value === "number") {
        cell.numFmt = '#,##0.00';
        cell.alignment = { horizontal: "right" };
      }
    }
  }

  autoFitColumns(sheet);

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
