import { sellsOnline, sellsToConsumers, type Profile } from "./schema";

export type CheckItem = { level: "error" | "warning" | "tip"; message: string };

/** Gaps the generated documents can't fix on their own. Shown in the dashboard. */
export function complianceChecklist(p: Profile): CheckItem[] {
  const items: CheckItem[] = [];
  const consumers = sellsToConsumers(p);
  const selling = sellsOnline(p);

  if (p.country === "FR" && consumers && !p.adrEntity) {
    items.push({ level: "error", message: "France: you must appoint a consumer mediator and name it in your documents (Art. L.612-1 Consumer Code). Fines up to €15,000." });
  }
  if (p.country === "FR" && !p.hostingProvider) {
    items.push({ level: "error", message: "France: your legal notice must name your hosting provider with its address and phone number (LCEN Art. 6-III)." });
  }
  if ((p.country === "DE" || p.country === "AT") && !p.phone) {
    items.push({ level: "warning", message: "Germany/Austria: the imprint needs a second fast contact channel besides email. Add a phone number." });
  }
  if (p.registered && !p.registrationNumber) {
    items.push({ level: "warning", message: "Add your company registration number (trade register, RCS, KvK, etc.) to the legal notice." });
  }
  if (selling && !p.vatId) {
    items.push({ level: "tip", message: "If you are VAT-registered, add your VAT number. It is mandatory on your legal notice and invoices." });
  }
  if (selling && consumers && !p.withdrawalUrl) {
    items.push({ level: "error", message: "Since 19 June 2026, online sellers must offer a \"Withdraw from contract here\" button (Directive (EU) 2023/2673). Build it and add its URL." });
  }
  if (p.services.includes("google-fonts")) {
    items.push({ level: "warning", message: "Self-host your Google Fonts. Loading them from Google's servers sends visitor IPs to Google; German courts have awarded damages for this." });
  }
  if (p.services.some((s) => s === "ga4" || s === "google-ads")) {
    items.push({ level: "tip", message: "Google requires Consent Mode v2 for EEA traffic. Our cookie banner sends it automatically. Load it before your Google tag." });
  }
  if (p.services.some((s) => ["meta-pixel", "tiktok-pixel", "linkedin-insight", "hotjar", "clarity"].includes(s))) {
    items.push({ level: "tip", message: "Tag your tracking scripts with type=\"text/plain\" data-consent=\"…\" so the banner blocks them until consent." });
  }
  return items;
}
