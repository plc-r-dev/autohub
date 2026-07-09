import { NextResponse } from "next/server";
import { getReportData, type ReportFilters } from "@/lib/reporting/queries";
import { resolveIdentityLink } from "@/lib/auth/identity";
import { requireServerSession } from "@/lib/auth/session";

type ReportType = "booking" | "billing" | "settlement" | "customer" | "vehicle";
type ExportFormat = "csv" | "excel";

function parseDate(value: string | null): Date | undefined {
  if (!value) {
    return undefined;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function csvEscape(value: unknown): string {
  const str = value instanceof Date ? value.toISOString() : String(value ?? "");
  if (str.includes(",") || str.includes("\"") || str.includes("\n")) {
    return `"${str.replace(/"/g, "\"\"")}"`;
  }
  return str;
}

function buildCsv(rows: Array<Record<string, unknown>>): string {
  if (rows.length === 0) {
    return "";
  }
  const firstRow = rows[0];
  if (!firstRow) {
    return "";
  }
  const headers = Object.keys(firstRow);
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => csvEscape(row[h])).join(","));
  }
  return lines.join("\n");
}

export async function GET(request: Request) {
  try {
    const session = await requireServerSession();
    const identity = await resolveIdentityLink(session.user.id);
    if (!identity.domainUserId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as ReportType | null;
  const format = (searchParams.get("format") as ExportFormat | null) ?? "csv";

  if (!type || !["booking", "billing", "settlement", "customer", "vehicle"].includes(type)) {
    return NextResponse.json({ error: "Invalid report type." }, { status: 400 });
  }
  if (!["csv", "excel"].includes(format)) {
    return NextResponse.json({ error: "Invalid export format." }, { status: 400 });
  }

  const filters: ReportFilters = {
    from: parseDate(searchParams.get("from")),
    to: parseDate(searchParams.get("to")),
    merchantId: searchParams.get("merchantId") ?? undefined,
    branchId: searchParams.get("branchId") ?? undefined,
    bookingStatus: searchParams.get("bookingStatus") ?? undefined,
  };

  const data = await getReportData(filters);
  const rows = data[type];
  const csv = buildCsv(rows as Array<Record<string, unknown>>);

  const extension = format === "excel" ? "xls" : "csv";
  const mime =
    format === "excel"
      ? "application/vnd.ms-excel; charset=utf-8"
      : "text/csv; charset=utf-8";

  return new NextResponse(csv, {
    headers: {
      "Content-Type": mime,
      "Content-Disposition": `attachment; filename="${type}-report.${extension}"`,
    },
  });
}
