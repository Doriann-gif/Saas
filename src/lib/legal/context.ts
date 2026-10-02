import { getCountry, type Country } from "./countries";
import { esc, link } from "./md";
import type { Profile } from "./schema";
import { getServices, type ThirdPartyService } from "./services";

export const DOC_IDS = ["privacy", "cookies", "terms", "sale", "imprint", "accessibility"] as const;
export type DocId = (typeof DOC_IDS)[number];

export type DocContext = {
  p: Profile;
  country: Country;
  services: ThirdPartyService[];
  /** Escaped "Acme SAS" style name for use in prose. */
  company: string;
  /** Hostname of the website, e.g. example.com. */
  site: string;
  updated: string;
  links: Partial<Record<DocId, string>>;
};

export function buildContext(p: Profile, updated: string, links: Partial<Record<DocId, string>>): DocContext {
  const legalName = [p.businessName, p.legalForm].filter(Boolean).join(" ");
  return {
    p,
    country: getCountry(p.country),
    services: getServices(p.services),
    company: esc(legalName),
    site: esc(new URL(p.websiteUrl).hostname),
    updated,
    links,
  };
}

/** Link to a sibling document, or its plain title when no URL is known. */
export function docLink(ctx: DocContext, id: DocId, label: string): string {
  const url = ctx.links[id];
  return url ? link(label, url) : label;
}
