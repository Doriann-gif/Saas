"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { DocView } from "@/components/doc-view";
import { applicableDocs, EMPTY_PROFILE, generateDoc, profileSchema, type DocId, type ProfileInput } from "@/lib/legal";
import { complianceChecklist } from "@/lib/legal/checklist";
import { COUNTRIES, legalFormsFor } from "@/lib/legal/countries";
import type { EntityType } from "@/lib/legal/schema";
import { markdownToHtml } from "@/lib/legal/render";
import { SERVICE_GROUP_LABELS, SERVICES, type ServiceGroup } from "@/lib/legal/services";

export const DRAFT_KEY = "clausely_draft_v1";

type Features = ProfileInput["features"];
type SaveState = { error?: string } | undefined;

const STEPS = [
  { title: "Your business", fields: ["entityType", "businessName", "legalForm", "registered", "registerName", "registrationNumber", "vatId", "shareCapital", "representative", "country", "address", "email", "phone"] },
  { title: "Your website", fields: ["websiteUrl", "hostingProvider", "audience", "microEnterprise", "features"] },
  { title: "Tools you use", fields: ["services"] },
  { title: "Final details", fields: ["withdrawalUrl", "adrEntity", "dpoContact"] },
] as const;

const ENTITY_CHOICES: { value: EntityType; title: string; body: string }[] = [
  { value: "notRegistered", title: "Not registered yet", body: "I'm still setting up my business." },
  { value: "soleTrader", title: "Self-employed", body: "Freelancer, sole trader or micro-entrepreneur. No separate company." },
  { value: "company", title: "A company", body: "A registered company, e.g. a Ltd, GmbH, SARL or BV." },
];

const AUDIENCES = [
  { value: "b2c", title: "Private individuals", body: "Consumers (B2C)" },
  { value: "b2b", title: "Other businesses only", body: "Companies and freelancers (B2B)" },
  { value: "both", title: "Both", body: "Individuals and businesses" },
] as const;

const FEATURES: { key: keyof Features; label: string; hint: string }[] = [
  { key: "contactForm", label: "Send you a message", hint: "There's a contact form on the site" },
  { key: "accounts", label: "Create an account", hint: "Visitors sign up and log in" },
  { key: "newsletter", label: "Sign up for a newsletter", hint: "You collect emails to send news or offers" },
  { key: "payments", label: "Pay online", hint: "Customers pay you on the website (card, PayPal…)" },
  { key: "subscriptions", label: "Pay monthly or yearly", hint: "Recurring payments: software, memberships, coaching…" },
  { key: "physicalGoods", label: "Buy physical products", hint: "You sell items that get shipped" },
  { key: "digitalProducts", label: "Buy digital products", hint: "Downloads, online courses, e-books, licences" },
  { key: "userContent", label: "Post their own content", hint: "Reviews, comments, photos or files" },
];

const OTHER_FORM = "__other";

function errorsFor(input: ProfileInput, step: number): Record<string, string> {
  const out: Record<string, string> = {};
  if (step === 0) {
    if (!input.entityType) out.entityType = "Choose the option that fits you";
    if (input.entityType === "company" && !input.legalForm?.trim()) out.legalForm = "Choose your company type";
  }
  const result = profileSchema.safeParse(input);
  if (result.success) return out;
  const fields = STEPS[step].fields as readonly string[];
  for (const issue of result.error.issues) {
    const key = String(issue.path[0]);
    if (fields.includes(key) && !out[key]) out[key] = issue.message;
  }
  return out;
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-800">{label}</span>
      {hint && <span className="mt-0.5 block text-xs text-slate-500">{hint}</span>}
      <div className="mt-1.5">{children}</div>
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

const inputCls =
  "block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10";

export function Wizard({
  mode,
  initial,
  action,
}: {
  mode: "public" | "create" | "edit";
  initial?: ProfileInput;
  action?: (state: SaveState, formData: FormData) => Promise<SaveState>;
}) {
  const [data, setData] = useState<ProfileInput>(initial ?? EMPTY_PROFILE);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [customForm, setCustomForm] = useState(false);
  const [state, formAction, pending] = useActionState<SaveState, FormData>(action ?? (async () => undefined), undefined);

  // Restore and persist the draft so visitors can preview first, sign up, then save without retyping.
  useEffect(() => {
    if (mode === "edit") return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage
      if (raw) setData({ ...EMPTY_PROFILE, ...JSON.parse(raw) });
    } catch {}
  }, [mode]);
  useEffect(() => {
    if (mode === "edit") return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    } catch {}
  }, [data, mode]);

  const clearError = (key: string) =>
    setErrors((e) => {
      if (!(key in e)) return e;
      const rest = { ...e };
      delete rest[key];
      return rest;
    });
  const set = <K extends keyof ProfileInput>(key: K, value: ProfileInput[K]) => {
    setData((d) => ({ ...d, [key]: value }));
    clearError(key);
  };
  const setFeature = (key: keyof Features, value: boolean) => setData((d) => ({ ...d, features: { ...d.features, [key]: value } }));
  const toggleService = (id: string) =>
    setData((d) => {
      const s = new Set(d.services ?? []);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return { ...d, services: [...s] };
    });

  function next() {
    const e = errorsFor(data, step);
    setErrors(e);
    if (Object.keys(e).length) return;
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (mode === "public") {
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  if (done && mode === "public") return <PublicPreview input={data} onBack={() => setDone(false)} />;

  const f = data.features;
  const selling = f.payments || f.subscriptions || f.physicalGoods || f.digitalProducts;
  const last = step === STEPS.length - 1;
  const isCompany = data.entityType === "company";
  const forms = legalFormsFor(data.country ?? "");
  const showCustomForm = customForm || (!!data.legalForm && !forms.includes(data.legalForm));

  const chooseEntity = (value: EntityType) => {
    clearError("entityType");
    setData((d) => ({
      ...d,
      entityType: value,
      registered: value !== "notRegistered",
      // A company type like "GmbH" makes no sense for a person; start clean when switching.
      legalForm: value === d.entityType ? d.legalForm : "",
      shareCapital: value === "company" ? d.shareCapital : "",
    }));
  };

  return (
    <div>
      <ol className="mb-8 grid grid-cols-4 gap-2">
        {STEPS.map((s, i) => (
          <li key={s.title}>
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              className={`h-1.5 w-full rounded-full ${i <= step ? "bg-slate-900" : "bg-slate-200"}`}
              aria-label={`Step ${i + 1}: ${s.title}`}
            />
            <span className={`mt-2 hidden text-xs sm:block ${i === step ? "font-medium text-slate-900" : "text-slate-500"}`}>{s.title}</span>
          </li>
        ))}
      </ol>

      <h2 className="text-2xl font-bold tracking-tight">{STEPS[step].title}</h2>

      <div className="mt-6 space-y-5">
        {step === 0 && (
          <>
            <fieldset>
              <legend className="text-sm font-medium text-slate-800">What best describes you?</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {ENTITY_CHOICES.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => chooseEntity(c.value)}
                    aria-pressed={data.entityType === c.value}
                    className={`rounded-xl border p-3 text-left ${data.entityType === c.value ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 hover:bg-slate-50"}`}
                  >
                    <span className="block text-sm font-semibold">{c.title}</span>
                    <span className={`mt-1 block text-xs ${data.entityType === c.value ? "text-slate-300" : "text-slate-500"}`}>{c.body}</span>
                  </button>
                ))}
              </div>
              {errors.entityType && <span className="mt-1 block text-xs text-red-600">{errors.entityType}</span>}
            </fieldset>

            {data.entityType && (
              <>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Country where the business is based" error={errors.country}>
                    <select className={inputCls} value={data.country} onChange={(e) => set("country", e.target.value)}>
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field
                    label={isCompany ? "Company name" : "Business or brand name"}
                    hint={isCompany ? "As registered, without the company type (\"Acme\", not \"Acme SAS\")" : "The name customers know you by. No brand name? Use your own name."}
                    error={errors.businessName}
                  >
                    <input className={inputCls} value={data.businessName} onChange={(e) => set("businessName", e.target.value)} placeholder="Acme" />
                  </Field>
                </div>

                {isCompany && (
                  <Field
                    label="Company type"
                    hint="The legal structure written after your company name on official papers. This is not your industry or what you sell."
                    error={errors.legalForm}
                  >
                    <select
                      className={inputCls}
                      value={showCustomForm ? OTHER_FORM : (data.legalForm ?? "")}
                      onChange={(e) => {
                        const v = e.target.value;
                        setCustomForm(v === OTHER_FORM);
                        set("legalForm", v === OTHER_FORM ? "" : v);
                      }}
                    >
                      <option value="">Choose…</option>
                      {forms.map((form) => (
                        <option key={form} value={form}>
                          {form}
                        </option>
                      ))}
                      <option value={OTHER_FORM}>Other (type it)</option>
                    </select>
                    {showCustomForm && (
                      <input className={`${inputCls} mt-2`} value={data.legalForm} onChange={(e) => set("legalForm", e.target.value)} placeholder="Your company type" />
                    )}
                  </Field>
                )}
                {data.entityType === "soleTrader" && data.country === "FR" && (
                  <Field label="Legal status (optional)" hint={'In France, sole traders must add "EI" (Entrepreneur Individuel) after their name. Type EI if that\'s you.'}>
                    <input className={inputCls} value={data.legalForm} onChange={(e) => set("legalForm", e.target.value)} placeholder="EI" />
                  </Field>
                )}

                <Field
                  label={isCompany ? "Managing director's full name" : "Your full name"}
                  hint={
                    isCompany
                      ? "The person legally in charge of the company (CEO, director, gérant, Geschäftsführer). If that's you, enter your own name."
                      : "You run the business yourself, so you're the person legally responsible. Your name appears on the legal notice."
                  }
                  error={errors.representative}
                >
                  <input className={inputCls} value={data.representative} onChange={(e) => set("representative", e.target.value)} placeholder="Jane Doe" />
                </Field>

                <Field
                  label={isCompany ? "Registered company address" : "Business address"}
                  hint={isCompany ? undefined : "Where you run the business from. Working from home? Your home address, or a business-address service."}
                  error={errors.address}
                >
                  <textarea className={inputCls} rows={3} value={data.address} onChange={(e) => set("address", e.target.value)} placeholder={"1 Example Street\n10115 Berlin"} />
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Email for customers" hint="Shown in your documents so people can reach you" error={errors.email}>
                    <input className={inputCls} type="email" value={data.email} onChange={(e) => set("email", e.target.value)} />
                  </Field>
                  <Field label="Phone number" hint="Required in Germany and Austria, optional elsewhere">
                    <input className={inputCls} value={data.phone} onChange={(e) => set("phone", e.target.value)} />
                  </Field>
                </div>

                {data.registered && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-800">Registration details</p>
                    <p className="mt-0.5 text-xs text-slate-500">They&apos;re on your registration certificate. Leave empty anything you don&apos;t have; you can add it later.</p>
                    <div className="mt-4 grid gap-5 sm:grid-cols-2">
                      <Field label="Where is it registered?" hint="The official register, e.g. RCS Paris (FR), Amtsgericht Berlin (DE), KvK (NL)">
                        <input className={inputCls} value={data.registerName} onChange={(e) => set("registerName", e.target.value)} />
                      </Field>
                      <Field label="Registration number" hint="e.g. SIREN (FR), HRB 12345 (DE), KvK number (NL)">
                        <input className={inputCls} value={data.registrationNumber} onChange={(e) => set("registrationNumber", e.target.value)} />
                      </Field>
                      <Field label="VAT number" hint="Starts with your country code, e.g. FR12345678901. Empty if you don't charge VAT.">
                        <input className={inputCls} value={data.vatId} onChange={(e) => set("vatId", e.target.value)} />
                      </Field>
                      {isCompany && (
                        <Field label="Share capital" hint="The amount the company was founded with, e.g. €1,000. Required in France.">
                          <input className={inputCls} value={data.shareCapital} onChange={(e) => set("shareCapital", e.target.value)} />
                        </Field>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {step === 1 && (
          <>
            <Field label="Your website address" hint="No website yet? Enter the domain you plan to use." error={errors.websiteUrl}>
              <input className={inputCls} value={data.websiteUrl} onChange={(e) => set("websiteUrl", e.target.value)} placeholder="https://example.com" />
            </Field>
            <Field
              label="Who hosts your website?"
              hint="The service your site runs on, e.g. Shopify, Wix, Squarespace, WordPress.com, OVH. Add its address if you know it (required in France)."
            >
              <input className={inputCls} value={data.hostingProvider} onChange={(e) => set("hostingProvider", e.target.value)} />
            </Field>
            <fieldset>
              <legend className="text-sm font-medium text-slate-800">Who buys from you?</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {AUDIENCES.map((a) => (
                  <button
                    key={a.value}
                    type="button"
                    onClick={() => set("audience", a.value)}
                    aria-pressed={data.audience === a.value}
                    className={`rounded-xl border p-3 text-left ${data.audience === a.value ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 hover:bg-slate-50"}`}
                  >
                    <span className="block text-sm font-semibold">{a.title}</span>
                    <span className={`mt-0.5 block text-xs ${data.audience === a.value ? "text-slate-300" : "text-slate-500"}`}>{a.body}</span>
                  </button>
                ))}
              </div>
            </fieldset>
            <Field label="On your website, visitors can…" hint="Tick everything that applies. Just a simple showcase website? Tick only the first one, or nothing.">
              <div className="grid gap-2 sm:grid-cols-2">
                {FEATURES.map((x) => (
                  <label key={x.key} className={`flex cursor-pointer gap-3 rounded-lg border p-3 ${f[x.key] ? "border-slate-900 bg-slate-50" : "border-slate-200"}`}>
                    <input type="checkbox" className="mt-0.5 h-4 w-4" checked={!!f[x.key]} onChange={(e) => setFeature(x.key, e.target.checked)} />
                    <span>
                      <span className="block text-sm font-medium">{x.label}</span>
                      <span className="block text-xs text-slate-500">{x.hint}</span>
                    </span>
                  </label>
                ))}
              </div>
            </Field>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-0.5 h-4 w-4" checked={data.microEnterprise ?? true} onChange={(e) => set("microEnterprise", e.target.checked)} />
              <span>
                Small business: fewer than 10 people and under €2M revenue per year
                <span className="block text-xs text-slate-500">Very small businesses are exempt from parts of the European Accessibility Act. Leave ticked if unsure.</span>
              </span>
            </label>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-sm text-slate-600">
              Tick the outside services your website uses. They get listed in your privacy and cookie policies, and the cookie banner blocks them until
              visitors agree. Not sure or none? Just continue; you can change this later.
            </p>
            {(Object.keys(SERVICE_GROUP_LABELS) as ServiceGroup[]).map((g) => (
              <fieldset key={g}>
                <legend className="text-sm font-semibold text-slate-800">{SERVICE_GROUP_LABELS[g]}</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {SERVICES.filter((s) => s.group === g).map((s) => {
                    const on = data.services?.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleService(s.id)}
                        aria-pressed={on}
                        className={`rounded-full border px-3 py-1.5 text-sm ${on ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 hover:bg-slate-50"}`}
                      >
                        {s.name}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </>
        )}

        {step === 3 && (
          <>
            {selling && data.audience !== "b2b" && (
              <Field
                label="Link to your “Withdraw from contract” button"
                hint="Since June 2026, EU online sellers must let customers cancel a purchase with one button. Paste the link if you have one. If not, leave it empty and we'll remind you."
                error={errors.withdrawalUrl}
              >
                <input className={inputCls} value={data.withdrawalUrl} onChange={(e) => set("withdrawalUrl", e.target.value)} placeholder="https://example.com/withdraw" />
              </Field>
            )}
            {data.audience !== "b2b" && (
              <Field
                label="Consumer mediator"
                hint="An independent service customers can turn to if you disagree, e.g. CM2C or Medicys in France. Mandatory in France, optional elsewhere. Leave empty if you don't have one."
              >
                <input className={inputCls} value={data.adrEntity} onChange={(e) => set("adrEntity", e.target.value)} placeholder="Name and website" />
              </Field>
            )}
            <Field label="Data protection officer (DPO)" hint="Most small businesses don't have one. Leave empty unless you officially appointed one.">
              <input className={inputCls} value={data.dpoContact} onChange={(e) => set("dpoContact", e.target.value)} />
            </Field>
          </>
        )}
      </div>

      {state?.error && <p className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}

      <div className="mt-10 flex items-center justify-between gap-3">
        <button type="button" onClick={() => setStep(step - 1)} disabled={step === 0} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:invisible">
          Back
        </button>
        {last && mode !== "public" ? (
          <form
            action={formAction}
            onSubmit={(e) => {
              const errs = errorsFor(data, step);
              setErrors(errs);
              if (Object.keys(errs).length) e.preventDefault();
            }}
          >
            <input type="hidden" name="answers" value={JSON.stringify(data)} />
            <button disabled={pending} className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60">
              {pending ? "Saving…" : mode === "edit" ? "Save changes" : "Generate my documents"}
            </button>
          </form>
        ) : (
          <button type="button" onClick={next} className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">
            {last ? "Generate my documents" : "Continue"}
          </button>
        )}
      </div>
    </div>
  );
}

function PublicPreview({ input, onBack }: { input: ProfileInput; onBack: () => void }) {
  const profile = useMemo(() => profileSchema.parse(input), [input]);
  const docs = useMemo(() => applicableDocs(profile), [profile]);
  const checklist = useMemo(() => complianceChecklist(profile), [profile]);
  const [active, setActive] = useState<DocId>("privacy");
  const html = useMemo(() => markdownToHtml(generateDoc(active, profile, { updatedAt: new Date() })), [active, profile]);
  const cta = { href: "/login?next=/dashboard/new", label: "Create my account" };

  return (
    <div>
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="font-semibold text-emerald-900">Your {docs.length} documents are ready.</p>
        <p className="mt-1 text-sm text-emerald-800">Create an account to save them, then publish from €15/month. Your answers are kept on this device.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={cta.href} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
            {cta.label}
          </Link>
          <button type="button" onClick={onBack} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white">
            Edit answers
          </button>
        </div>
      </div>

      {checklist.length > 0 && <Checklist items={checklist} />}

      <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
        {docs.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setActive(d.id)}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm ${active === d.id ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 hover:bg-slate-50"}`}
          >
            {d.title}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm text-slate-500">{docs.find((d) => d.id === active)?.reason}</p>
      <div className="mt-6 rounded-2xl border border-slate-200 p-5 sm:p-8">
        <DocView html={html} locked cta={cta} />
      </div>
    </div>
  );
}

export function Checklist({ items }: { items: ReturnType<typeof complianceChecklist> }) {
  const styles = { error: "bg-red-50 text-red-800 border-red-200", warning: "bg-amber-50 text-amber-900 border-amber-200", tip: "bg-slate-50 text-slate-700 border-slate-200" };
  const labels = { error: "Fix", warning: "Check", tip: "Tip" };
  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-slate-800">Compliance checklist</h3>
      <ul className="mt-2 space-y-2">
        {items.map((i) => (
          <li key={i.message} className={`flex gap-3 rounded-lg border p-3 text-sm ${styles[i.level]}`}>
            <span className="font-semibold">{labels[i.level]}</span>
            <span>{i.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
