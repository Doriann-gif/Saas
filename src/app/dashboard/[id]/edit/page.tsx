import Link from "next/link";
import { notFound } from "next/navigation";
import { Wizard } from "@/components/wizard";
import { getProject } from "@/lib/data";
import { updateProject } from "../../actions";

export default async function EditProjectPage({ params }: PageProps<"/dashboard/[id]/edit">) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={`/dashboard/${id}`} className="text-sm text-slate-500 hover:text-slate-900">
        ← {project.name}
      </Link>
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 sm:p-10">
        <Wizard mode="edit" initial={project.answers} action={updateProject.bind(null, id)} />
      </div>
    </div>
  );
}
