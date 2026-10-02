import { NextResponse, type NextRequest } from "next/server";
import { getPlan, getProject } from "@/lib/data";
import { applicableDocs, docTitle, generateDoc, isDocId } from "@/lib/legal";
import { markdownToHtml } from "@/lib/legal/render";
import { ENTITLEMENTS } from "@/lib/plans";
import { hostedDocLinks } from "@/lib/urls";

export async function GET(request: NextRequest, { params }: RouteContext<"/dashboard/[id]/doc/[doc]/download">) {
  const { id, doc } = await params;
  if (!isDocId(doc)) return new NextResponse("Not found", { status: 404 });
  const [project, plan] = await Promise.all([getProject(id), getPlan()]);
  if (!project) return new NextResponse("Not found", { status: 404 });
  if (!ENTITLEMENTS[plan].publish) return new NextResponse("Upgrade to download documents", { status: 402 });

  const docs = applicableDocs(project.answers).map((d) => d.id);
  const md = generateDoc(doc, project.answers, { updatedAt: new Date(project.updated_at), links: hostedDocLinks(project.public_id, docs) });
  const format = request.nextUrl.searchParams.get("format") === "md" ? "md" : "html";
  const filename = `${docTitle(doc).toLowerCase().replace(/\s+/g, "-")}.${format}`;

  const body =
    format === "md"
      ? md
      : `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>${docTitle(doc)}</title>\n</head>\n<body>\n${markdownToHtml(md)}</body>\n</html>\n`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": format === "md" ? "text/markdown; charset=utf-8" : "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
