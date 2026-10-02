"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { DocView } from "@/components/doc-view";
import { applicableDocs, EMPTY_PROFILE, generateDoc, profileSchema, type DocId, type ProfileInput } from "@/lib/legal";
import { complianceChecklist } from "@/lib/legal/checklist";
import { COUNTRIES } from "@/lib/legal/countries";
import { markdownToHtml } from "@/lib/legal/render";
import { SERVICE_GROUP_LABELS, SERVICES, type ServiceGroup } from "@/lib/legal/services";

export const DRAFT_KEY = "clausely_draft_v1";

type Features = ProfileInput["features"];
type SaveState = { error?: string } | undefined;

const STEPS = [
  { title: "Your business", fields: ["businessName", "legalForm", "registered", "registerName", "registrationNumber", "vatId", "shareCapital", "representative", "country", "address", "email", "phone"] },
  { title: "Your website", fields: ["websiteUrl", "hostingProvider", "audience", "microEnterprise", "features"] },
  { title: "Tools you use", fields: ["services"] },
  { title: "Final details", fields: ["withdrawalUrl", "adrEntity", "dpoContact"] },
] as const;

const FEATURES: { key: keyof Features; label: string; hint: string }[] = [
  { key: "contactForm", label: "Contact form", hint: "Visitors can send you messages" },
  { key: "accounts", label: "User accounts", hint: "People sign up and log in" },
  { key: "newsletter", label: "Newsletter", hint: "You collect emails for marketing" },
  { key: "payments", label: "Online payments", hint: "You take payments on the site" },
  { key: "subscriptions", label: "Subscriptions", hint: "Recurring billing (SaaS, memberships)" },
  { key: "physicalGoods", label: "Physical products", hint: "You ship goods" },
  { key: "digitalProducts", label: "Digital products", hint: "Downloads, courses, licences" },
  { key: "userContent", label: "User content", hint: "Users post reviews, files, comments" },
];

function errorsFor(input: ProfileInput, step: number): Record<string, string> {
  const result = profileSchema.safeParse(input);
  if (result.success) return {};
  const fields = STEPS[step].fields as readonly string[];
  const out: Record<string, string> = {};
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

  const set = <K extends keyof ProfileInput>(key: K, value: ProfileInput[K]) => setData((d) => ({ ...d, [key]: value }));
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
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Business name" error={errors.businessName}>
                <input className={inputCls} value={data.businessName} onChange={(e) => set("businessName", e.target.value)} placeholder="Acme" />
              </Field>
              <Field label="Legal form" hint="e.g. GmbH, SAS, BV, sole trader">
                <input className={inputCls} value={data.legalForm} onChange={(e) => set("legalForm", e.target.value)} />
              </Field>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Country of establishment" error={errors.country}>
                <select className={inputCls} value={data.country} onChange={(e) => set("country", e.target.value)}>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Owner / managing director" error={errors.representative}>
                <input className={inputCls} value={data.representative} onChange={(e) => set("representative", e.target.value)} />
              </Field>
            </div>
            <Field label="Business address" error={errors.address}>
              <textarea className={inputCls} rows={3} value={data.address} onChange={(e) => set("address", e.target.value)} placeholder={"1 Example Street\n10115 Berlin"} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Contact email" error={errors.email}>
                <input className={inputCls} type="email" value={data.email} onChange={(e) => set("email", e.target.value)} />
              </Field>
              <Field label="Phone" hint="Required for the imprint in Germany and Austria">
                <input className={inputCls} value={data.phone} onChange={(e) => set("phone", e.target.value)} />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!data.registered} onChange={(e) => set("registered", !e.target.checked)} className="h-4 w-4" />
              My business isn&apos;t registered yet
            </label>
            {data.registered && (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Register" hint="e.g. Amtsgericht Berlin, RCS Paris, KvK">
                  <input className={inputCls} value={data.registerName} onChange={(e) => set("registerName", e.target.value)} />
                </Field>
                <Field label="Registration number">
                  <input className={inputCls} value={data.registrationNumber} onChange={(e) => set("registrationNumber", e.target.value)} />
                </Field>
                <Field label="VAT number" hint="Leave empty if not VAT-registered">
                  <input className={inputCls} value={data.vatId} onChange={(e) => set("vatId", e.target.value)} />
                </Field>
                <Field label="Share capital" hint="Optional, required in some countries (e.g. FR)">
                  <input className={inputCls} value={data.shareCapital} onChange={(e) => set("shareCapital", e.target.value)} />
                </Field>
              </div>
            )}
          </>
        )}

        {step === 1 && (
          <>
            <Field label="Website URL" error={errors.websiteUrl}>
              <input className={inputCls} value={data.websiteUrl} onChange={(e) => set("websiteUrl", e.target.value)} placeholder="https://example.com" />
            </Field>
            <Field label="Hosting provider" hint="Name and address. Mandatory in France (e.g. Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA)">
              <input className={inputCls} value={data.hostingProvider} onChange={(e) => set("hostingProvider", e.target.value)} />
            </Field>
            <Field label="Who are your customers?">
              <div className="grid gap-2 sm:grid-cols-3">
                {(
                  [
                    ["b2c", "Consumers"],
                    ["b2b", "Businesses only"],
                    ["both", "Both"],
                  ] as const
                ).map(([v, l]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => set("audience", v)}
                    className={`rounded-lg border px-3 py-2 text-sm ${data.audience === v ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 hover:bg-slate-50"}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="What does your website do?">
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
                Fewer than 10 employees and under €2M turnover
                <span className="block text-xs text-slate-500">Micro-enterprises are exempt from parts of the European Accessibility Act.</span>
              </span>
            </label>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-sm text-slate-600">Tick every third-party tool on your website. They are listed in your privacy and cookie policies, and the banner blocks them until consent.</p>
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
                label="URL of your “Withdraw from contract here” page"
                hint="Mandatory for online sales to consumers since 19 June 2026. Leave empty if you haven't built it yet: your checklist will remind you."
                error={errors.withdrawalUrl}
              >
                <input className={inputCls} value={data.withdrawalUrl} onChange={(e) => set("withdrawalUrl", e.target.value)} placeholder="https://example.com/withdraw" />
              </Field>
            )}
            {data.audience !== "b2b" && (
              <Field label="Consumer mediator / ADR body" hint="Mandatory in France. Optional elsewhere. Name and website.">
                <input className={inputCls} value={data.adrEntity} onChange={(e) => set("adrEntity", e.target.value)} />
              </Field>
            )}
            <Field label="Data Protection Officer contact" hint="Only if you have appointed one">
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
