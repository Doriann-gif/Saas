import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { appUrl, BRAND } from "@/lib/brand";
import { getPublishedProject } from "@/lib/data";
import { applicableDocs, docTitle, generateDoc, isDocId } from "@/lib/legal";
import { markdownToHtml } from "@/lib/legal/render";
import { ENTITLEMENTS } from "@/lib/plans";

// Hosted pages are cached briefly; edits and template updates show up within 5 minutes.
export const revalidate = 300;

async function load(publicId: string, doc: string) {
  if (!isDocId(doc)) return null;
  const found = await getPublishedProject(publicId);
  if (!found || !ENTITLEMENTS[found.plan].publish) return null;
  const docs = applicableDocs(found.project.answers);
  if (!docs.some((d) => d.id === doc)) return null;
  return { ...found, doc, docs };
}

export async function generateMetadata({ params }: PageProps<"/p/[publicId]/[doc]">): Promise<Metadata> {
  const { publicId, doc } = await params;
  const data = await load(publicId, doc);
  if (!data) return { title: "Not found" };
  return {
    title: { absolute: `${docTitle(data.doc)} · ${data.project.answers.businessName}` },
    robots: { index: false, follow: true },
  };
}

export default async function HostedDocPage({ params }: PageProps<"/p/[publicId]/[doc]">) {
  const { publicId, doc } = await params;
  const data = await load(publicId, doc);
  if (!data) notFound();

  const { project, plan, docs } = data;
  const links = Object.fromEntries(docs.map((d) => [d.id, `./${d.id}`]));
  const html = markdownToHtml(generateDoc(data.doc, project.answers, { updatedAt: new Date(project.updated_at), links }));

  return (
    <div className="flex min-h-full flex-1 flex-col bg-white">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4">
          <a href={project.answers.websiteUrl} className="font-semibold text-slate-900 hover:underline">
            ← {project.answers.businessName}
          </a>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:py-14">
        <article className="legal" dangerouslySetInnerHTML={{ __html: html }} />
      </main>
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex flex-wrap gap-x-4 gap-y-2">
            {docs.map((d) => (
              <Link key={d.id} href={`/p/${publicId}/${d.id}`} className={d.id === doc ? "font-medium text-slate-900" : "text-slate-500 hover:text-slate-900"}>
                {d.title}
              </Link>
            ))}
          </nav>
          {ENTITLEMENTS[plan].badge && (
            <a href={`${appUrl()}/?ref=${publicId}`} className="whitespace-nowrap text-xs text-slate-400 hover:text-slate-600">
              Legal pages by {BRAND.name}
            </a>
          )}
        </div>
      </footer>
    </div>
  );
}
