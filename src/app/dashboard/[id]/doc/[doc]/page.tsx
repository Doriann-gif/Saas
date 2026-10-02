import Link from "next/link";
import { notFound } from "next/navigation";
import { DocView } from "@/components/doc-view";
import { getPlan, getProject } from "@/lib/data";
import { applicableDocs, generateDoc, isDocId } from "@/lib/legal";
import { markdownToHtml } from "@/lib/legal/render";
import { ENTITLEMENTS } from "@/lib/plans";
import { hostedDocLinks } from "@/lib/urls";

export default async function DocPage({ params }: PageProps<"/dashboard/[id]/doc/[doc]">) {
  const { id, doc } = await params;
  if (!isDocId(doc)) notFound();
  const [project, plan] = await Promise.all([getProject(id), getPlan()]);
  if (!project) notFound();

  const docs = applicableDocs(project.answers);
  const meta = docs.find((d) => d.id === doc);
  if (!meta) notFound();

  const html = markdownToHtml(
    generateDoc(doc, project.answers, {
      updatedAt: new Date(project.updated_at),
      links: hostedDocLinks(project.public_id, docs.map((d) => d.id)),
    }),
  );
  const paid = ENTITLEMENTS[plan].publish;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href={`/dashboard/${id}`} className="text-sm text-slate-500 hover:text-slate-900">
          ← {project.name}
        </Link>
        {paid && (
          <div className="flex gap-2">
            <a href={`/dashboard/${id}/doc/${doc}/download?format=html`} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50">
              Download HTML
            </a>
            <a href={`/dashboard/${id}/doc/${doc}/download?format=md`} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50">
              Download Markdown
            </a>
          </div>
        )}
      </div>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {docs.map((d) => (
          <Link
            key={d.id}
            href={`/dashboard/${id}/doc/${d.id}`}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm ${d.id === doc ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white hover:bg-slate-50"}`}
          >
            {d.title}
          </Link>
        ))}
      </div>
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-10">
        <DocView html={html} locked={!paid} cta={{ href: `/dashboard/${id}#upgrade`, label: "See plans" }} />
      </div>
    </div>
  );
}
