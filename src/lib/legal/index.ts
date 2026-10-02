import { buildContext, type DocId } from "./context";
import { accessibilityStatement } from "./docs/accessibility";
import { cookiePolicy } from "./docs/cookies";
import { legalNotice } from "./docs/imprint";
import { privacyPolicy } from "./docs/privacy";
import { termsOfSale } from "./docs/sale";
import { termsOfService } from "./docs/terms";
import { formatDate } from "./md";
import { sellsOnline, sellsToConsumers, type Profile } from "./schema";

export { DOC_IDS, type DocId } from "./context";
export { profileSchema, EMPTY_PROFILE, type Profile, type ProfileInput } from "./schema";

/**
 * Bump when templates change in a way customers should know about. Hosted
 * pages always render from the latest templates, so this date doubles as
 * the "last updated" floor for every document.
 */
export const TEMPLATE_VERSION = "2026-10-01";

export type DocMeta = {
  id: DocId;
  title: string;
  slug: string;
  required: boolean;
  reason: string;
};

const TITLES: Record<DocId, string> = {
  privacy: "Privacy Policy",
  cookies: "Cookie Policy",
  terms: "Terms of Service",
  sale: "Terms of Sale",
  imprint: "Legal Notice",
  accessibility: "Accessibility Statement",
};

const RENDERERS = {
  privacy: privacyPolicy,
  cookies: cookiePolicy,
  terms: termsOfService,
  sale: termsOfSale,
  imprint: legalNotice,
  accessibility: accessibilityStatement,
} satisfies Record<DocId, unknown>;

export function docTitle(id: DocId): string {
  return TITLES[id];
}

/** Which documents this business needs, and why. */
export function applicableDocs(p: Profile): DocMeta[] {
  const docs: DocMeta[] = [
    { id: "privacy", title: TITLES.privacy, slug: "privacy", required: true, reason: "Required by GDPR Art. 13 for any website that processes personal data (even IP addresses)." },
    { id: "cookies", title: TITLES.cookies, slug: "cookies", required: true, reason: "Required by the ePrivacy Directive to inform visitors about cookies and obtain consent." },
    { id: "imprint", title: TITLES.imprint, slug: "imprint", required: true, reason: "Required by the E-Commerce Directive (Art. 5) for commercial websites; strictly enforced in DE, AT and FR." },
    { id: "terms", title: TITLES.terms, slug: "terms", required: p.features.accounts || p.features.userContent, reason: p.features.accounts || p.features.userContent ? "Needed to set the rules for accounts and user content and to limit your liability." : "Recommended to set the rules for using your website and limit your liability." },
  ];

  if (sellsOnline(p)) {
    docs.push({
      id: "sale",
      title: TITLES.sale,
      slug: "sale",
      required: true,
      reason: sellsToConsumers(p)
        ? "Required for online sales to consumers: pre-contractual information, the 14-day withdrawal right, the online withdrawal function (mandatory since 19 June 2026) and the model withdrawal form."
        : "Needed to set payment, delivery, warranty and liability terms with business customers.",
    });
  }

  const eaa = sellsOnline(p) && sellsToConsumers(p);
  docs.push({
    id: "accessibility",
    title: TITLES.accessibility,
    slug: "accessibility",
    required: eaa && !p.microEnterprise,
    reason:
      eaa && !p.microEnterprise
        ? "Required by the European Accessibility Act (applies since 28 June 2025) for e-commerce services to consumers."
        : eaa
          ? "Micro-enterprises are exempt from the European Accessibility Act for services, but publishing one builds trust."
          : "Optional for your business model; recommended good practice.",
  });

  return docs;
}

export type GenerateOptions = {
  /** Date the business profile was last edited. */
  updatedAt: Date;
  /** URLs of sibling documents for cross-linking. */
  links?: Partial<Record<DocId, string>>;
};

export function generateDoc(id: DocId, p: Profile, opts: GenerateOptions): string {
  const floor = new Date(`${TEMPLATE_VERSION}T00:00:00Z`);
  const updated = formatDate(opts.updatedAt > floor ? opts.updatedAt : floor);
  return RENDERERS[id](buildContext(p, updated, opts.links ?? {}));
}

export function isDocId(value: string): value is DocId {
  return value in TITLES;
}
