import { bannerScript, configVersion, inactiveScript, type BannerConfig } from "@/lib/banner/script";
import { appUrl, BRAND } from "@/lib/brand";
import { getPublishedProject } from "@/lib/data";
import { CONSENT_LABELS, getServices, type ConsentCategory } from "@/lib/legal/services";
import { ENTITLEMENTS } from "@/lib/plans";
import { hostedDocUrl } from "@/lib/urls";

const ORDER: Exclude<ConsentCategory, "necessary">[] = ["functional", "analytics", "marketing"];

function js(body: string, maxAge: number) {
  return new Response(body, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": `public, max-age=${maxAge}, s-maxage=${maxAge}`,
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export async function GET(_: Request, { params }: RouteContext<"/b/[publicId]">) {
  const { publicId } = await params;
  let found: Awaited<ReturnType<typeof getPublishedProject>>;
  try {
    found = await getPublishedProject(publicId.replace(/\.js$/, ""));
  } catch (err) {
    // This script runs on customers' sites: never break their page with a 500.
    console.error("[banner] lookup failed", err);
    return js(inactiveScript("temporarily unavailable"), 30);
  }
  if (!found) return js(inactiveScript("unknown site id"), 60);
  const ent = ENTITLEMENTS[found.plan];
  if (!ent.publish) return js(inactiveScript("no active subscription"), 60);

  const { project } = found;
  const services = getServices(project.answers.services);
  const used = ORDER.filter((c) => services.some((s) => s.consent === c));

  const config: BannerConfig = {
    id: project.public_id,
    version: configVersion(used),
    categories: used.map((c) => ({ id: c, label: CONSENT_LABELS[c].label, description: CONSENT_LABELS[c].description })),
    policyUrl: hostedDocUrl(project.public_id, "cookies"),
    log: ent.consentLog ? `${appUrl()}/api/consent` : null,
    gcm: project.answers.services.some((s) => s === "ga4" || s === "google-ads"),
    badge: ent.badge ? { text: `Consent by ${BRAND.name}`, url: `${appUrl()}/?ref=${project.public_id}` } : null,
  };
  return js(bannerScript(config), 300);
}
