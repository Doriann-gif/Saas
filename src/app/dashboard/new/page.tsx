import { Wizard } from "@/components/wizard";
import { createProject } from "../actions";

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-10">
      <Wizard mode="create" action={createProject} />
    </div>
  );
}
