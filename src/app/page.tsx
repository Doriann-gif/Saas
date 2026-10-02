import Link from "next/link";
import { Pricing } from "@/components/pricing";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { BRAND } from "@/lib/brand";

const DOCS = [
  { title: "Privacy Policy", body: "GDPR Art. 13 compliant. Lists every tool you use, legal bases, retention, transfers and your national authority." },
  { title: "Cookie Policy + banner", body: "Blocks trackers until consent, equal-weight Reject button, Google Consent Mode v2 built in." },
  { title: "Terms of Service", body: "Accounts, acceptable use, user content (DSA notice-and-action), liability with consumer carve-outs." },
  { title: "Terms of Sale", body: "14-day withdrawal right, model form and the online withdrawal button required since June 2026." },
  { title: "Legal Notice / Impressum", body: "Country-specific: § 5 DDG for Germany, LCEN for France, LSSI for Spain, E-Commerce Directive elsewhere." },
  { title: "Accessibility Statement", body: "For the European Accessibility Act (in force since June 2025): EN 301 549 / WCAG 2.1 AA." },
];

const EDGE = [
  { title: "One flat price, every document", body: "Others charge per document and per add-on. You get all six plus the banner." },
  { title: "Built for 2026 EU rules", body: "Withdrawal button (Directive 2023/2673), Accessibility Act, Consent Mode v2, TDDDG. Already in." },
  { title: "27 countries, not one", body: "Right supervisory authority, digital-consent age, imprint statute and mediator rules per country." },
  { title: "Proof of consent", body: "GDPR says you must be able to prove consent. Pro logs every choice, ready for an audit." },
];

const FAQ = [
  {
    q: "Is this legal advice?",
    a: "No. We provide professionally structured templates tailored to your answers. They cover the standard situations for small EU businesses. If you process sensitive data (health, biometrics), operate in a regulated sector, or are unsure, have a lawyer review them.",
  },
  {
    q: "My business isn't registered yet. Can I still use it?",
    a: "Yes. That's exactly when you should set this up. Tick \"not registered yet\" and your legal notice says so; add your registration details later and every hosted page updates instantly.",
  },
  {
    q: "What happens when the law changes?",
    a: "We update the templates and your hosted pages update automatically. No re-generating, no copy-pasting. That's what the subscription pays for.",
  },
  {
    q: "Do I really need a cookie banner?",
    a: "If you use Google Analytics, Meta Pixel, YouTube embeds, a chat widget or anything similar: yes, under the ePrivacy Directive. If you only use cookieless tools like Plausible, the banner stays hidden automatically.",
  },
  {
    q: "What if I cancel?",
    a: "You keep access until the end of your billing period. Download your documents as HTML or Markdown before that. Hosted pages and the banner stop working after cancellation.",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(60rem_30rem_at_50%_-10%,#e0e7ff,transparent)]" />
          <div className="mx-auto max-w-4xl px-4 pb-20 pt-16 text-center sm:pt-24">
            <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Updated for the June 2026 withdrawal-button rule
            </p>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
              Your website&apos;s legal pages, done in 5 minutes.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
              Privacy policy, cookie banner, terms, terms of sale, legal notice and accessibility statement, tailored to your business and
              your EU country. Hosted, auto-updated when the law changes. <strong className="text-slate-900">From €15/month.</strong>
            </p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/start" className="rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-700">
                Generate my documents (free preview)
              </Link>
              <Link href="#pricing" className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-900 hover:bg-slate-50">
                See pricing
              </Link>
            </div>
            <p className="mt-6 text-sm text-slate-500">No credit card to preview · 27 EU countries · GDPR · ePrivacy · Consumer Rights · Accessibility Act</p>
          </div>
        </section>

        {/* Pain */}
        <section className="border-y border-slate-200 bg-slate-50">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:grid-cols-3">
            <div>
              <p className="text-3xl font-bold">€20M / 4%</p>
              <p className="mt-2 text-sm text-slate-600">Maximum GDPR fine. Regulators have fined small businesses for missing privacy notices and cookie consent too.</p>
            </div>
            <div>
              <p className="text-3xl font-bold">€500+</p>
              <p className="mt-2 text-sm text-slate-600">Typical cost of a single German cease-and-desist letter over a missing Impressum or unlawful Google Fonts embed.</p>
            </div>
            <div>
              <p className="text-3xl font-bold">€1,500</p>
              <p className="mt-2 text-sm text-slate-600">What a lawyer typically charges to draft this document set once, before it goes out of date.</p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-center text-3xl font-bold tracking-tight">How it works</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              ["1", "Answer 20 questions", "Your company, your country, what you sell and which tools you use. Takes about 5 minutes."],
              ["2", "Get your documents", "Every document your business needs, with the reason it's required and a checklist of anything missing."],
              ["3", "Publish & forget", "Link to the hosted pages and paste one line for the cookie banner. We keep them up to date."],
            ].map(([n, t, b]) => (
              <div key={n} className="rounded-2xl border border-slate-200 p-6">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 font-semibold text-brand-700">{n}</span>
                <h3 className="mt-4 font-semibold">{t}</h3>
                <p className="mt-2 text-sm text-slate-600">{b}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Docs */}
        <section className="bg-slate-900 text-white">
          <div className="mx-auto max-w-6xl px-4 py-20">
            <h2 className="text-3xl font-bold tracking-tight">Six documents. One subscription.</h2>
            <p className="mt-3 max-w-2xl text-slate-300">Each one is written from your answers, so it only contains what applies to you.</p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {DOCS.map((d) => (
                <div key={d.title} className="rounded-xl border border-white/10 bg-white/5 p-5">
                  <h3 className="font-semibold">{d.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{d.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Edge */}
        <section className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-3xl font-bold tracking-tight">Why {BRAND.name}</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            {EDGE.map((e) => (
              <div key={e.title}>
                <h3 className="font-semibold">{e.title}</h3>
                <p className="mt-2 text-slate-600">{e.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="scroll-mt-16 border-t border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-4xl px-4 py-20">
            <h2 className="text-center text-3xl font-bold tracking-tight">Simple pricing</h2>
            <p className="mt-3 text-center text-slate-600">Preview everything for free. Pay only when you publish. Cancel anytime.</p>
            <div className="mt-12">
              <Pricing />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-3xl scroll-mt-16 px-4 py-20">
          <h2 className="text-3xl font-bold tracking-tight">Questions</h2>
          <div className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                  {f.q}
                  <span className="text-slate-400 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
          <div className="mt-14 rounded-2xl bg-brand-50 p-8 text-center">
            <h3 className="text-xl font-semibold">Get compliant before your first customer does the checking.</h3>
            <Link href="/start" className="mt-5 inline-block rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-700">
              Generate my documents
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
