/**
 * Tiny Markdown builder. Every user-supplied value MUST go through `esc`
 * before being interpolated, so hosted pages can't be used for XSS and
 * stray `*` or `_` in a company name don't turn into formatting.
 */

export function esc(value: string | number | undefined | null): string {
  return String(value ?? "")
    .replace(/[\r\n]+/g, " ")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/([\\`*_{}[\]()#+!|~])/g, "\\$1");
}

/** Multi-line user value (e.g. a postal address) rendered as hard line breaks. */
export function escLines(value: string): string {
  return value
    .split(/\r?\n/)
    .map((l) => esc(l.trim()))
    .filter(Boolean)
    .join("  \n");
}

export function link(label: string, url: string): string {
  if (!/^(https?:\/\/|mailto:|#|\.\/)/.test(url)) return esc(label);
  return `[${esc(label)}](${url.replace(/[()\s]/g, encodeURIComponent)})`;
}

export function mail(address: string): string {
  return link(address, `mailto:${address}`);
}

export const h1 = (t: string) => `# ${t}`;
export const h2 = (t: string) => `## ${t}`;
export const h3 = (t: string) => `### ${t}`;

/** Returns an h2 builder that numbers sections in the order they are created. */
export function numbered(): (t: string) => string {
  let i = 0;
  return (t) => h2(`${++i}. ${t}`);
}

export function ul(items: (string | false | null | undefined)[]): string {
  return items
    .filter((i): i is string => Boolean(i))
    .map((i) => `- ${i}`)
    .join("\n");
}

export function table(headers: string[], rows: string[][]): string {
  if (rows.length === 0) return "";
  // Cells are either escaped user input (pipes already escaped by `esc`) or our own copy.
  const line = (cells: string[]) => `| ${cells.join(" | ")} |`;
  return [line(headers), line(headers.map(() => "---")), ...rows.map(line)].join("\n");
}

/** Joins blocks with blank lines, dropping empty/false ones. */
export function doc(blocks: (string | false | null | undefined)[]): string {
  return blocks.filter((b): b is string => Boolean(b && b.trim())).join("\n\n") + "\n";
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export function listJoin(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
