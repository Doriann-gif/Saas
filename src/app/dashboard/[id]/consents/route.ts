import { NextResponse } from "next/server";
import { getPlan, getProject } from "@/lib/data";
import { ENTITLEMENTS } from "@/lib/plans";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const csvCell = (v: unknown) => {
  const s = typeof v === "string" ? v : JSON.stringify(v ?? "");
  // Prefix formula characters so the export can't trigger spreadsheet formula injection.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};

export async function GET(_: Request, { params }: RouteContext<"/dashboard/[id]/consents">) {
  const { id } = await params;
  const [project, plan] = await Promise.all([getProject(id), getPlan()]);
  if (!project) return new NextResponse("Not found", { status: 404 });
  if (!ENTITLEMENTS[plan].consentLog) return new NextResponse("Consent logs are part of the Pro plan", { status: 402 });

  const supabase = await createSupabaseServerClient();
  const rows: string[] = ["timestamp,consent_id,config_version,functional,analytics,marketing,user_agent"];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("consent_logs")
      .select("created_at,consent_id,config_version,choices,user_agent")
      .eq("project_id", id)
      .order("created_at", { ascending: false })
      .range(from, from + PAGE - 1);
    if (error) return new NextResponse("Export failed", { status: 500 });
    for (const r of data) {
      const c = (r.choices ?? {}) as Record<string, boolean>;
      rows.push([r.created_at, r.consent_id, r.config_version, !!c.functional, !!c.analytics, !!c.marketing, r.user_agent ?? ""].map(csvCell).join(","));
    }
    if (data.length < PAGE || from >= 100_000) break;
  }

  return new NextResponse(rows.join("\n") + "\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="consent-log-${project.public_id}.csv"`,
    },
  });
}
