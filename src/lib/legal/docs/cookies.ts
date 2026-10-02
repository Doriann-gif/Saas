import { docLink, type DocContext } from "../context";
import { doc, esc, h1, h3, link, mail, numbered, table, ul } from "../md";
import { CONSENT_LABELS, type ConsentCategory } from "../services";

type Row = { name: string; provider: string; purpose: string; duration: string };

function rowsFor(ctx: DocContext, category: ConsentCategory): Row[] {
  const rows: Row[] = [];
  const f = ctx.p.features;

  if (category === "necessary") {
    rows.push({ name: "cly_consent_* (local storage)", provider: ctx.company, purpose: "Remembers your cookie choices", duration: "6 months" });
    if (f.accounts) {
      rows.push({ name: "Session / authentication cookie", provider: ctx.company, purpose: "Keeps you logged in", duration: "Session or until you log out" });
    }
    if (f.physicalGoods || f.digitalProducts) {
      rows.push({ name: "Shopping cart", provider: ctx.company, purpose: "Remembers the items in your cart", duration: "Up to 2 weeks" });
    }
  }

  for (const s of ctx.services.filter((x) => x.consent === category)) {
    for (const c of s.cookies) {
      rows.push({ name: esc(c.name), provider: esc(s.name), purpose: esc(s.purpose), duration: esc(c.duration) });
    }
  }
  return rows;
}

export function cookiePolicy(ctx: DocContext): string {
  const { p } = ctx;
  const h2 = numbered();
  const categories: ConsentCategory[] = ["necessary", "functional", "analytics", "marketing"];
  const used = categories.filter((c) => c === "necessary" || ctx.services.some((s) => s.consent === c));
  const cookieless = ctx.services.filter((s) => s.cookies.length === 0 && s.consent !== "necessary");

  return doc([
    h1("Cookie Policy"),
    `*Last updated: ${ctx.updated}*`,
    `This Cookie Policy explains how ${ctx.company} uses cookies and similar technologies on ${ctx.site}. It should be read together with our ${docLink(ctx, "privacy", "Privacy Policy")}.`,

    h2("What are cookies?"),
    `Cookies are small text files stored on your device when you visit a website. Similar technologies, such as local storage, pixels and scripts, work in a comparable way. In this policy we call all of them "cookies".`,

    h2("How we use cookies"),
    `Under Article 5(3) of the ePrivacy Directive (2002/58/EC), as implemented in national law${
      p.country === "DE" ? " (in Germany, § 25 TDDDG)" : ""
    }, we may only store or read information on your device with your consent, unless it is strictly necessary to provide the service you asked for.`,
    ul([
      "**Strictly necessary cookies** are always active, because the website cannot work properly without them.",
      "**All other cookies** are only set after you have given your consent in our cookie banner. Until then, the related scripts are blocked.",
    ]),
    `Refusing cookies is as easy as accepting them. If you refuse, you can still use our website; some features, such as embedded videos or chat, may not be available.`,

    h2("Cookies we use"),
    ...used.flatMap((c) => {
      const rows = rowsFor(ctx, c);
      return [
        h3(CONSENT_LABELS[c].label),
        CONSENT_LABELS[c].description,
        rows.length
          ? table(["Name", "Provider", "Purpose", "Duration"], rows.map((r) => [r.name, r.provider, r.purpose, r.duration]))
          : "This category does not set cookies of its own, but the related scripts are only loaded with your consent.",
      ];
    }),
    cookieless.length > 0 &&
      `Some of the services above (${cookieless.map((s) => esc(s.name)).join(", ")}) work with scripts or pixels rather than their own cookies on our domain. They are still blocked until you consent.`,
    `Third-party providers may change the names and durations of their cookies. For the most accurate details, see the provider's own privacy policy:`,
    ctx.services.length > 0 && ul(ctx.services.map((s) => `${link(s.name, s.privacyUrl)} (${esc(s.provider)})`)),

    p.services.some((id) => ["ga4", "google-ads"].includes(id)) && h2("Google Consent Mode"),
    p.services.some((id) => ["ga4", "google-ads"].includes(id)) &&
      `We use Google Consent Mode. Until you consent, Google tags run in a restricted mode that does not set analytics or advertising cookies. Your choice in our cookie banner is passed to Google so that its tags respect it.`,

    h2("Changing your choice"),
    `You can change or withdraw your consent at any time by clicking ${link("Cookie settings", "#cookie-settings")} (also available at the bottom of every page). We ask for your consent again after 6 months, or sooner if we change the cookies we use.`,
    `You can also block or delete cookies in your browser settings. Here is how to do it in the most common browsers:`,
    ul([
      link("Google Chrome", "https://support.google.com/chrome/answer/95647"),
      link("Mozilla Firefox", "https://support.mozilla.org/kb/enhanced-tracking-protection-firefox-desktop"),
      link("Safari", "https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac"),
      link("Microsoft Edge", "https://support.microsoft.com/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"),
    ]),

    h2("Changes and contact"),
    `We update this Cookie Policy whenever we change the cookies we use. For questions, contact us at ${mail(p.email)}.`,
  ]);
}
