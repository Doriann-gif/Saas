import { Marked } from "marked";

const marked = new Marked({
  gfm: true,
  async: false,
  renderer: {
    // Defence in depth: templates escape user input, but never pass raw HTML through.
    html({ text }) {
      return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    },
    link({ href, tokens }) {
      const label = this.parser.parseInline(tokens);
      if (href.startsWith("#cookie-settings")) {
        return `<a href="#cookie-settings" data-cly-open>${label}</a>`;
      }
      if (!/^(https?:|mailto:|#|\.\/)/.test(href)) return label;
      const external = /^https?:/.test(href);
      const safe = href.replace(/"/g, "%22");
      return `<a href="${safe}"${external ? ' rel="noopener noreferrer" target="_blank"' : ""}>${label}</a>`;
    },
  },
});

export function markdownToHtml(markdown: string): string {
  return marked.parse(markdown) as string;
}

/** Splits rendered HTML at the n-th <h2>, used to blur the paywalled part of a preview. */
export function splitAtSection(html: string, n: number): [string, string] {
  let idx = -1;
  for (let i = 0; i < n; i++) {
    idx = html.indexOf("<h2", idx + 1);
    if (idx === -1) return [html, ""];
  }
  return [html.slice(0, idx), html.slice(idx)];
}
