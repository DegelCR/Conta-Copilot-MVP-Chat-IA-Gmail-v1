import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseInvoiceListFilters } from "@/lib/invoices/filter-params";
import {
  buildInvoicesExportFilename,
  invoicesToCsv,
} from "@/lib/invoices/export-csv";
import { invoicesToXlsxBuffer } from "@/lib/invoices/export-xlsx";
import { listInvoicesForUser } from "@/lib/invoices/queries";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const rawParams: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    rawParams[key] = value;
  });

  const format = searchParams.get("format") === "csv" ? "csv" : "xlsx";
  const filters = parseInvoiceListFilters(rawParams);
  const invoices = await listInvoicesForUser(filters);
  const filename = buildInvoicesExportFilename(format);

  if (format === "csv") {
    const csv = invoicesToCsv(invoices);
    return new NextResponse(`\uFEFF${csv}`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  const buffer = await invoicesToXlsxBuffer(invoices);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
