import { z } from "zod";
import { getPublishedProject } from "@/lib/data";
import { ENTITLEMENTS } from "@/lib/plans";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

// Sent by the banner with navigator.sendBeacon (text/plain, so no CORS preflight).
const bodySchema = z.object({
  p: z.string().regex(/^[A-Za-z0-9]{8,32}$/),
  id: z.string().min(8).max(64),
  v: z.string().max(32),
  c: z.object({ functional: z.boolean().optional(), analytics: z.boolean().optional(), marketing: z.boolean().optional() }).strict(),
});

const CORS = { "Access-Control-Allow-Origin": "*" };

export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > 2048) return new Response(null, { status: 413, headers: CORS });

  let parsed;
  try {
    parsed = bodySchema.safeParse(JSON.parse(raw));
  } catch {
    return new Response(null, { status: 400, headers: CORS });
  }
  if (!parsed.success) return new Response(null, { status: 400, headers: CORS });

  try {
    const found = await getPublishedProject(parsed.data.p);
    if (!found || !ENTITLEMENTS[found.plan].consentLog) return new Response(null, { status: 204, headers: CORS });

    const { error } = await createSupabaseAdminClient()
      .from("consent_logs")
      .insert({
        project_id: found.project.id,
        consent_id: parsed.data.id,
        choices: parsed.data.c,
        config_version: parsed.data.v,
        user_agent: request.headers.get("user-agent")?.slice(0, 300) ?? null,
      });
    if (error) throw error;
  } catch (err) {
    console.error("[consent] insert failed", err);
    return new Response(null, { status: 503, headers: CORS });
  }
  return new Response(null, { status: 204, headers: CORS });
}
