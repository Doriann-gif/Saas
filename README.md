# Clausely

GDPR legal pages + cookie banner for small EU businesses and startups (including ones not registered yet).
€15/month (Starter) or €29/month (Pro).

**What it does**

- 20-question wizard → generates up to 6 documents tailored to the business and its EU country:
  Privacy Policy, Cookie Policy, Terms of Service, Terms of Sale, Legal Notice/Impressum, Accessibility Statement.
- Free preview without an account (answers kept in localStorage), paywall after section 2.
- Hosted pages (`/p/<id>/<doc>`) always render from the latest templates, so template updates reach every customer.
- Embeddable consent banner (`/b/<id>`): blocks `type="text/plain" data-consent="…"` scripts and `data-src` iframes
  until consent, equal-weight Reject button, Google Consent Mode v2.
- Pro: consent logs (proof of consent, GDPR Art. 7(1)) with CSV export.
- Compliance checklist per country (FR mediator, DE phone, withdrawal button, Google Fonts, …).

**Stack:** Next.js 16 (App Router) · Supabase (auth + Postgres with RLS) · Stripe Checkout/Billing Portal · Tailwind 4.

## Setup

1. `npm install`
2. Create a Supabase project, run `supabase/migrations/20261002000000_init.sql` (SQL editor or `supabase db push`).
   In Auth → URL Configuration, set the site URL and add `<APP_URL>/auth/callback` as a redirect URL.
3. In Stripe, create 2 products (Starter €15/mo + €150/yr, Pro €29/mo + €290/yr). Enable the Billing Portal
   (allow plan switching between the 4 prices). Add a webhook to `<APP_URL>/api/stripe/webhook` with events
   `checkout.session.completed` and `customer.subscription.*`.
4. `cp .env.example .env.local` and fill it in.
5. `npm run dev`

Local webhooks: `stripe listen --forward-to localhost:3000/api/stripe/webhook`.

## Scripts

- `npm test`: generator tests (applicability, country rules, XSS escaping, section numbering)
- `npm run typecheck`, `npm run lint`, `npm run build`

## Code map

- `src/lib/legal/`: the product. Country data, third-party service catalog, document templates, checklist.
  Bump `TEMPLATE_VERSION` in `index.ts` when templates change.
- `src/lib/banner/script.ts`: the consent banner runtime.
- `src/app/dashboard/`: customer app. `src/app/p/` hosted docs. `src/app/b/` banner script. `src/app/api/`: consent log + Stripe webhook.

## Before launch

- Have an EU lawyer review the templates once (the whole business rests on their quality). Keep the "not legal advice" disclaimer.
- Generate Clausely's own legal pages with Clausely.
- Add rate limiting to `/api/consent` (e.g. Upstash) before Pro customers have high-traffic sites.
