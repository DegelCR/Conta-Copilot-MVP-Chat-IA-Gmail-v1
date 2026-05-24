import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseInvoiceListFilters } from "@/lib/invoices/filter-params";
import {
  buildInvoicesExportFilename,
  invoicesToCsv,
} from "@/lib/invoices/export-csv";
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

  const filters = parseInvoiceListFilters(rawParams);
  const invoices = await listInvoicesForUser(filters);
  const csv = invoicesToCsv(invoices);
  const filename = buildInvoicesExportFilename();

  return new NextResponse(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
