export type ConsentCategory = "necessary" | "functional" | "analytics" | "marketing";

export type ServiceGroup =
  | "analytics"
  | "advertising"
  | "payments"
  | "email"
  | "support"
  | "hosting"
  | "embeds"
  | "monitoring"
  | "forms";

export type Cookie = { name: string; duration: string };

export type ThirdPartyService = {
  id: string;
  name: string;
  provider: string;
  /** Country of the contracting entity. */
  country: string;
  /** True if the provider may transfer personal data outside the EEA. */
  transfersOutsideEea: boolean;
  group: ServiceGroup;
  /** Consent category the service is blocked under in the cookie banner. */
  consent: ConsentCategory;
  purpose: string;
  privacyUrl: string;
  cookies: Cookie[];
};

export const SERVICES: ThirdPartyService[] = [
  // Analytics
  { id: "ga4", name: "Google Analytics", provider: "Google Ireland Limited", country: "Ireland", transfersOutsideEea: true, group: "analytics", consent: "analytics", purpose: "measuring website traffic and usage", privacyUrl: "https://policies.google.com/privacy", cookies: [{ name: "_ga", duration: "2 years" }, { name: "_ga_<container-id>", duration: "2 years" }] },
  { id: "plausible", name: "Plausible Analytics", provider: "Plausible Insights OÜ", country: "Estonia", transfersOutsideEea: false, group: "analytics", consent: "necessary", purpose: "privacy-friendly, cookieless traffic statistics", privacyUrl: "https://plausible.io/privacy", cookies: [] },
  { id: "matomo", name: "Matomo (self-hosted)", provider: "us (self-hosted)", country: "EU", transfersOutsideEea: false, group: "analytics", consent: "analytics", purpose: "measuring website traffic and usage on our own infrastructure", privacyUrl: "https://matomo.org/privacy-policy/", cookies: [{ name: "_pk_id.*", duration: "13 months" }, { name: "_pk_ses.*", duration: "30 minutes" }] },
  { id: "posthog", name: "PostHog", provider: "PostHog, Inc.", country: "United States", transfersOutsideEea: true, group: "analytics", consent: "analytics", purpose: "product analytics and feature usage measurement", privacyUrl: "https://posthog.com/privacy", cookies: [{ name: "ph_<project-key>_posthog", duration: "1 year" }] },
  { id: "hotjar", name: "Hotjar", provider: "Hotjar Ltd.", country: "Malta", transfersOutsideEea: true, group: "analytics", consent: "analytics", purpose: "heatmaps and session recordings to improve usability", privacyUrl: "https://www.hotjar.com/legal/policies/privacy/", cookies: [{ name: "_hjSessionUser_<site-id>", duration: "1 year" }, { name: "_hjSession_<site-id>", duration: "30 minutes" }] },
  { id: "clarity", name: "Microsoft Clarity", provider: "Microsoft Corporation", country: "United States", transfersOutsideEea: true, group: "analytics", consent: "analytics", purpose: "heatmaps and session recordings to improve usability", privacyUrl: "https://privacy.microsoft.com/privacystatement", cookies: [{ name: "_clck", duration: "1 year" }, { name: "_clsk", duration: "1 day" }] },

  // Advertising
  { id: "google-ads", name: "Google Ads", provider: "Google Ireland Limited", country: "Ireland", transfersOutsideEea: true, group: "advertising", consent: "marketing", purpose: "conversion tracking and remarketing", privacyUrl: "https://policies.google.com/privacy", cookies: [{ name: "_gcl_au", duration: "3 months" }] },
  { id: "meta-pixel", name: "Meta Pixel", provider: "Meta Platforms Ireland Limited", country: "Ireland", transfersOutsideEea: true, group: "advertising", consent: "marketing", purpose: "measuring ad performance and building audiences on Facebook and Instagram", privacyUrl: "https://www.facebook.com/privacy/policy/", cookies: [{ name: "_fbp", duration: "3 months" }] },
  { id: "tiktok-pixel", name: "TikTok Pixel", provider: "TikTok Technology Limited", country: "Ireland", transfersOutsideEea: true, group: "advertising", consent: "marketing", purpose: "measuring ad performance and building audiences on TikTok", privacyUrl: "https://www.tiktok.com/legal/page/eea/privacy-policy/en", cookies: [{ name: "_ttp", duration: "13 months" }] },
  { id: "linkedin-insight", name: "LinkedIn Insight Tag", provider: "LinkedIn Ireland Unlimited Company", country: "Ireland", transfersOutsideEea: true, group: "advertising", consent: "marketing", purpose: "conversion tracking and audience building on LinkedIn", privacyUrl: "https://www.linkedin.com/legal/privacy-policy", cookies: [{ name: "li_sugr", duration: "3 months" }, { name: "bcookie", duration: "1 year" }] },

  // Payments
  { id: "stripe", name: "Stripe", provider: "Stripe Payments Europe, Limited", country: "Ireland", transfersOutsideEea: true, group: "payments", consent: "necessary", purpose: "processing payments and preventing fraud", privacyUrl: "https://stripe.com/privacy", cookies: [{ name: "__stripe_mid", duration: "1 year" }, { name: "__stripe_sid", duration: "30 minutes" }] },
  { id: "paypal", name: "PayPal", provider: "PayPal (Europe) S.à r.l. et Cie, S.C.A.", country: "Luxembourg", transfersOutsideEea: true, group: "payments", consent: "necessary", purpose: "processing payments", privacyUrl: "https://www.paypal.com/webapps/mpp/ua/privacy-full", cookies: [] },
  { id: "mollie", name: "Mollie", provider: "Mollie B.V.", country: "Netherlands", transfersOutsideEea: false, group: "payments", consent: "necessary", purpose: "processing payments", privacyUrl: "https://www.mollie.com/privacy", cookies: [] },

  // Email
  { id: "mailchimp", name: "Mailchimp", provider: "The Rocket Science Group LLC (Intuit)", country: "United States", transfersOutsideEea: true, group: "email", consent: "necessary", purpose: "sending newsletters and measuring email engagement", privacyUrl: "https://www.intuit.com/privacy/statement/", cookies: [] },
  { id: "brevo", name: "Brevo", provider: "Sendinblue SAS (Brevo)", country: "France", transfersOutsideEea: false, group: "email", consent: "necessary", purpose: "sending newsletters and transactional emails", privacyUrl: "https://www.brevo.com/legal/privacypolicy/", cookies: [] },

  // Support / CRM
  { id: "intercom", name: "Intercom", provider: "Intercom R&D Unlimited Company", country: "Ireland", transfersOutsideEea: true, group: "support", consent: "functional", purpose: "live chat and customer support", privacyUrl: "https://www.intercom.com/legal/privacy", cookies: [{ name: "intercom-id-<app-id>", duration: "9 months" }, { name: "intercom-session-<app-id>", duration: "1 week" }] },
  { id: "crisp", name: "Crisp", provider: "Crisp IM SAS", country: "France", transfersOutsideEea: false, group: "support", consent: "functional", purpose: "live chat and customer support", privacyUrl: "https://crisp.chat/en/privacy/", cookies: [{ name: "crisp-client/session/<website-id>", duration: "6 months" }] },
  { id: "hubspot", name: "HubSpot", provider: "HubSpot Ireland Limited", country: "Ireland", transfersOutsideEea: true, group: "support", consent: "marketing", purpose: "customer relationship management and marketing automation", privacyUrl: "https://legal.hubspot.com/privacy-policy", cookies: [{ name: "hubspotutk", duration: "6 months" }, { name: "__hstc", duration: "6 months" }] },

  // Hosting / infrastructure
  { id: "vercel", name: "Vercel", provider: "Vercel Inc.", country: "United States", transfersOutsideEea: true, group: "hosting", consent: "necessary", purpose: "hosting and delivering our website", privacyUrl: "https://vercel.com/legal/privacy-policy", cookies: [] },
  { id: "netlify", name: "Netlify", provider: "Netlify, Inc.", country: "United States", transfersOutsideEea: true, group: "hosting", consent: "necessary", purpose: "hosting and delivering our website", privacyUrl: "https://www.netlify.com/privacy/", cookies: [] },
  { id: "aws", name: "Amazon Web Services", provider: "Amazon Web Services EMEA SARL", country: "Luxembourg", transfersOutsideEea: true, group: "hosting", consent: "necessary", purpose: "hosting our infrastructure and storing data", privacyUrl: "https://aws.amazon.com/privacy/", cookies: [] },
  { id: "cloudflare", name: "Cloudflare", provider: "Cloudflare, Inc.", country: "United States", transfersOutsideEea: true, group: "hosting", consent: "necessary", purpose: "content delivery and protection against attacks", privacyUrl: "https://www.cloudflare.com/privacypolicy/", cookies: [{ name: "__cf_bm", duration: "30 minutes" }] },
  { id: "supabase", name: "Supabase", provider: "Supabase, Inc.", country: "United States", transfersOutsideEea: true, group: "hosting", consent: "necessary", purpose: "database, authentication and file storage", privacyUrl: "https://supabase.com/privacy", cookies: [] },
  { id: "shopify", name: "Shopify", provider: "Shopify International Limited", country: "Ireland", transfersOutsideEea: true, group: "hosting", consent: "necessary", purpose: "operating our online shop and checkout", privacyUrl: "https://www.shopify.com/legal/privacy", cookies: [{ name: "cart", duration: "2 weeks" }, { name: "_shopify_y", duration: "1 year" }] },

  // Embeds
  { id: "youtube", name: "YouTube embeds", provider: "Google Ireland Limited", country: "Ireland", transfersOutsideEea: true, group: "embeds", consent: "functional", purpose: "displaying embedded videos", privacyUrl: "https://policies.google.com/privacy", cookies: [{ name: "VISITOR_INFO1_LIVE", duration: "6 months" }, { name: "YSC", duration: "session" }] },
  { id: "google-maps", name: "Google Maps", provider: "Google Ireland Limited", country: "Ireland", transfersOutsideEea: true, group: "embeds", consent: "functional", purpose: "displaying interactive maps", privacyUrl: "https://policies.google.com/privacy", cookies: [] },
  { id: "google-fonts", name: "Google Fonts (remotely loaded)", provider: "Google Ireland Limited", country: "Ireland", transfersOutsideEea: true, group: "embeds", consent: "necessary", purpose: "displaying web fonts", privacyUrl: "https://policies.google.com/privacy", cookies: [] },
  { id: "calendly", name: "Calendly", provider: "Calendly LLC", country: "United States", transfersOutsideEea: true, group: "embeds", consent: "functional", purpose: "booking appointments", privacyUrl: "https://calendly.com/privacy", cookies: [] },

  // Forms / monitoring
  { id: "typeform", name: "Typeform", provider: "Typeform SL", country: "Spain", transfersOutsideEea: true, group: "forms", consent: "functional", purpose: "collecting form and survey responses", privacyUrl: "https://www.typeform.com/privacy-policy/", cookies: [] },
  { id: "sentry", name: "Sentry", provider: "Functional Software, Inc.", country: "United States", transfersOutsideEea: true, group: "monitoring", consent: "necessary", purpose: "detecting and fixing technical errors", privacyUrl: "https://sentry.io/privacy/", cookies: [] },
];

export const SERVICE_GROUP_LABELS: Record<ServiceGroup, string> = {
  analytics: "Analytics",
  advertising: "Advertising",
  payments: "Payments",
  email: "Email & newsletters",
  support: "Support & CRM",
  hosting: "Hosting & infrastructure",
  embeds: "Embedded content",
  forms: "Forms",
  monitoring: "Error monitoring",
};

export const CONSENT_LABELS: Record<ConsentCategory, { label: string; description: string }> = {
  necessary: { label: "Strictly necessary", description: "Required for the website to work. These cannot be switched off." },
  functional: { label: "Functional", description: "Enable extra features such as chat, videos and maps." },
  analytics: { label: "Analytics", description: "Help us understand how the website is used so we can improve it." },
  marketing: { label: "Marketing", description: "Used to measure ads and show you relevant advertising." },
};

export function getServices(ids: string[]): ThirdPartyService[] {
  return SERVICES.filter((s) => ids.includes(s.id));
}
