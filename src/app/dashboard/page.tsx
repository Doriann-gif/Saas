import Link from "next/link";
import { Upgrade } from "@/components/upgrade";
import { getPlan, getProjects } from "@/lib/data";
import { ENTITLEMENTS } from "@/lib/plans";
import { openBillingPortal } from "./actions";

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const [{ checkout }, plan, projects] = await Promise.all([searchParams, getPlan(), getProjects()]);
  const canAdd = projects.length < ENTITLEMENTS[plan].sites;

  return (
    <div className="space-y-12">
      {checkout === "success" && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Payment received. It can take a few seconds for your plan to activate; refresh if your documents still show as locked.
        </p>
      )}

      <section>
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Your websites</h1>
          {canAdd ? (
            <Link href="/dashboard/new" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
              Add website
            </Link>
          ) : (
            <span className="text-sm text-slate-500">
              {projects.length}/{ENTITLEMENTS[plan].sites} websites used
            </span>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="font-medium">No website yet</p>
            <p className="mt-1 text-sm text-slate-600">Answer a few questions and get every legal document your business needs.</p>
            <Link href="/dashboard/new" className="mt-5 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
              Get started
            </Link>
          </div>
        ) : (
          <ul className="mt-6 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {projects.map((p) => (
              <li key={p.id}>
                <Link href={`/dashboard/${p.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50">
                  <span>
                    <span className="block font-medium">{p.name}</span>
                    <span className="block text-sm text-slate-500">{new URL(p.answers.websiteUrl).hostname}</span>
                  </span>
                  <span className="text-slate-400">→</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {plan === "free" && <Upgrade />}
      {plan === "starter" && !canAdd && (
        <form action={openBillingPortal} className="text-sm text-slate-600">
          Need more websites?{" "}
          <button className="font-medium text-brand-700 underline">Switch to Pro</button> for 5 websites and consent logs.
        </form>
      )}
    </div>
  );
}
