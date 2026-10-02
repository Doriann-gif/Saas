export type PlanId = "free" | "starter" | "pro";
export type PaidPlanId = Exclude<PlanId, "free">;
export type Interval = "month" | "year";

export type Entitlements = {
  sites: number;
  /** Hosted pages, cookie banner and downloads. */
  publish: boolean;
  consentLog: boolean;
  badge: boolean;
};

export const PLANS: Record<PaidPlanId, { name: string; price: Record<Interval, number>; blurb: string; features: string[] }> = {
  starter: {
    name: "Starter",
    price: { month: 15, year: 150 },
    blurb: "For one website or shop",
    features: [
      "1 website",
      "All 6 legal documents",
      "Hosted pages, auto-updated when the law changes",
      "GDPR cookie banner with Google Consent Mode v2",
      "Compliance checklist for your country",
      "Download as HTML or Markdown",
    ],
  },
  pro: {
    name: "Pro",
    price: { month: 29, year: 290 },
    blurb: "For agencies and growing businesses",
    features: [
      "Up to 5 websites",
      "Everything in Starter",
      "Consent logs: proof of consent for audits (GDPR Art. 7(1))",
      "CSV export of consent records",
      "No \"Powered by\" badge",
      "Priority email support",
    ],
  },
};

export const ENTITLEMENTS: Record<PlanId, Entitlements> = {
  free: { sites: 1, publish: false, consentLog: false, badge: true },
  starter: { sites: 1, publish: true, consentLog: false, badge: true },
  pro: { sites: 5, publish: true, consentLog: true, badge: false },
};

const PRICE_ENV: Record<PaidPlanId, Record<Interval, string>> = {
  starter: { month: "STRIPE_PRICE_STARTER_MONTHLY", year: "STRIPE_PRICE_STARTER_YEARLY" },
  pro: { month: "STRIPE_PRICE_PRO_MONTHLY", year: "STRIPE_PRICE_PRO_YEARLY" },
};

export function priceIdFor(plan: PaidPlanId, interval: Interval): string {
  const id = process.env[PRICE_ENV[plan][interval]];
  if (!id) throw new Error(`Missing environment variable ${PRICE_ENV[plan][interval]}`);
  return id;
}

export function planForPriceId(priceId: string): PaidPlanId | null {
  for (const plan of Object.keys(PRICE_ENV) as PaidPlanId[]) {
    for (const interval of ["month", "year"] as const) {
      if (process.env[PRICE_ENV[plan][interval]] === priceId) return plan;
    }
  }
  return null;
}

const ACTIVE = new Set(["active", "trialing", "past_due"]);

export function effectivePlan(sub: { plan: string | null; status: string | null } | null | undefined): PlanId {
  if (!sub?.plan || !sub.status || !ACTIVE.has(sub.status)) return "free";
  return sub.plan === "pro" || sub.plan === "starter" ? sub.plan : "free";
}
