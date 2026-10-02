import Link from "next/link";
import { splitAtSection } from "@/lib/legal/render";

/** Renders a generated document; when `locked`, everything after section 2 is blurred behind a paywall. */
export function DocView({ html, locked, cta }: { html: string; locked?: boolean; cta?: { href: string; label: string } }) {
  if (!locked) return <article className="legal" dangerouslySetInnerHTML={{ __html: html }} />;
  const [visible, rest] = splitAtSection(html, 3);
  // Scramble the locked part so the full text isn't sitting in the page source behind the blur.
  const hidden = rest.replace(/>([^<]+)</g, (_, t: string) => `>${t.replace(/&[a-z#0-9]+;/gi, "x").replace(/[A-Za-z0-9]/g, "x")}<`);
  return (
    <div>
      <article className="legal" dangerouslySetInnerHTML={{ __html: visible }} />
      {hidden && (
        <div className="relative">
          <article aria-hidden className="legal pointer-events-none max-h-[28rem] select-none overflow-hidden blur-[5px]" dangerouslySetInnerHTML={{ __html: hidden }} />
          <div className="absolute inset-0 flex items-start justify-center bg-gradient-to-b from-white/30 to-white pt-16">
            <div className="mx-4 max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xl">
              <p className="font-semibold">The rest of this document is ready.</p>
              <p className="mt-2 text-sm text-slate-600">Unlock the full text, hosted pages that auto-update and the cookie banner. From €15/month.</p>
              {cta && (
                <Link href={cta.href} className="mt-4 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
                  {cta.label}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
