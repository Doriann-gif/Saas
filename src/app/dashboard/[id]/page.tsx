import Link from "next/link";
import { notFound } from "next/navigation";
import { ClearDraft, CopyButton } from "@/components/copy-button";
import { Upgrade } from "@/components/upgrade";
import { Checklist } from "@/components/wizard";
import { countRecentConsents, getPlan, getProject } from "@/lib/data";
import { applicableDocs } from "@/lib/legal";
import { complianceChecklist } from "@/lib/legal/checklist";
import { ENTITLEMENTS } from "@/lib/plans";
import { bannerScriptUrl, hostedDocUrl } from "@/lib/urls";
import { deleteProject } from "../actions";

export default async function ProjectPage({ params, searchParams }: PageProps<"/dashboard/[id]">) {
  const [{ id }, { created }] = await Promise.all([params, searchParams]);
  const [project, plan] = await Promise.all([getProject(id), getPlan()]);
  if (!project) notFound();

  const p = project.answers;
  const docs = applicableDocs(p);
  const checklist = complianceChecklist(p);
  const ent = ENTITLEMENTS[plan];

  const consentCount = ent.consentLog ? await countRecentConsents(id, 30) : null;

  const snippet = `<script src="${bannerScriptUrl(project.public_id)}"></script>`;
  const tagExample = `<script type="text/plain" data-consent="analytics" src="https://www.googletagmanager.com/gtag/js?id=G-XXXX"></script>`;

  return (
    <div className="space-y-10">
      {created && <ClearDraft />}
      <div>
        <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-900">
          ← Websites
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
            <a href={p.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-500 hover:underline">
              {p.websiteUrl}
            </a>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/${id}/edit`} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50">
              Edit answers
            </Link>
            <form action={deleteProject}>
              <input type="hidden" name="id" value={id} />
              <button className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">Delete</button>
            </form>
          </div>
        </div>
      </div>

      {checklist.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <Checklist items={checklist} />
        </div>
      )}

      <section>
        <h2 className="text-lg font-semibold">Documents</h2>
        <ul className="mt-4 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {docs.map((d) => (
            <li key={d.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{d.title}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${d.required ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600"}`}>
                    {d.required ? "Required" : "Recommended"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">{d.reason}</p>
                {ent.publish && (
                  <div className="mt-2 flex min-w-0 items-center gap-2">
                    <code className="truncate rounded bg-slate-100 px-2 py-1 text-xs">{hostedDocUrl(project.public_id, d.id)}</code>
                    <CopyButton text={hostedDocUrl(project.public_id, d.id)} />
                  </div>
                )}
              </div>
              <div className="flex flex-none gap-2">
                <Link href={`/dashboard/${id}/doc/${d.id}`} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50">
                  {ent.publish ? "View" : "Preview"}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {ent.publish ? (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="text-lg font-semibold">Cookie banner</h2>
            <ol className="mt-3 list-decimal space-y-4 pl-5 text-sm text-slate-700">
              <li>
                Paste this as the <strong>first</strong> tag inside <code>&lt;head&gt;</code> on every page:
                <div className="mt-2 flex items-center gap-2">
                  <code className="block min-w-0 flex-1 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">{snippet}</code>
                  <CopyButton text={snippet} />
                </div>
              </li>
              <li>
                Block trackers until consent by changing their <code>type</code> and adding a category (<code>functional</code>, <code>analytics</code> or{" "}
                <code>marketing</code>):
                <code className="mt-2 block overflow-x-auto rounded-lg bg-slate-100 p-3 text-xs">{tagExample}</code>
                For iframes (YouTube, Maps), use <code>data-src</code> instead of <code>src</code> plus <code>data-consent</code>.
              </li>
              <li>
                Add a footer link so visitors can change their choice: <code>&lt;a href=&quot;#cookie-settings&quot;&gt;Cookie settings&lt;/a&gt;</code>
              </li>
            </ol>
            <p className="mt-4 text-xs text-slate-500">Google Consent Mode v2 signals are sent automatically when you use Google Analytics or Google Ads.</p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="text-lg font-semibold">Consent logs</h2>
            {consentCount !== null ? (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-slate-700">
                  <strong className="text-2xl">{consentCount.toLocaleString("en")}</strong> consent records in the last 30 days.
                </p>
                <a href={`/dashboard/${id}/consents`} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50">
                  Export CSV
                </a>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-600">
                Under GDPR Art. 7(1) you must be able to <strong>prove</strong> consent. Pro stores every banner choice, ready to export for an audit.{" "}
                Upgrade from the <strong>Billing</strong> menu.
              </p>
            )}
          </section>
        </>
      ) : (
        <Upgrade title="Publish these documents" />
      )}
    </div>
  );
}
