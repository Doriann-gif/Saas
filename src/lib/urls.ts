import { appUrl } from "@/lib/brand";
import type { DocId } from "@/lib/legal";

export function hostedDocUrl(publicId: string, doc: DocId): string {
  return `${appUrl()}/p/${publicId}/${doc}`;
}

export function hostedDocLinks(publicId: string, docs: DocId[]): Partial<Record<DocId, string>> {
  return Object.fromEntries(docs.map((d) => [d, hostedDocUrl(publicId, d)]));
}

export function bannerScriptUrl(publicId: string): string {
  return `${appUrl()}/b/${publicId}`;
}
