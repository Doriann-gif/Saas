import Link from "next/link";
import { PLANS, type PaidPlanId } from "@/lib/plans";

function Check() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden className="mt-0.5 h-4 w-4 flex-none text-brand-600">
      <path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0Z" clipRule="evenodd" />
    </svg>
  );
}

/** Marketing pricing cards. In the dashboard, `action` renders the checkout buttons instead of links. */
export function Pricing({ action }: { action?: (plan: PaidPlanId) => React.ReactNode }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {(Object.keys(PLANS) as PaidPlanId[]).map((id) => {
        const plan = PLANS[id];
        const featured = id === "pro";
        return (
          <div
            key={id}
            className={`flex flex-col rounded-2xl border bg-white p-6 sm:p-8 ${featured ? "border-slate-900 shadow-xl shadow-slate-900/10" : "border-slate-200"}`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              {featured && <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-medium text-white">Most popular</span>}
            </div>
            <p className="mt-1 text-sm text-slate-500">{plan.blurb}</p>
            <p className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tight">€{plan.price.month}</span>
              <span className="text-slate-500">/month</span>
            </p>
            <p className="mt-1 text-sm text-slate-500">or €{plan.price.year}/year (2 months free) · VAT may apply</p>
            <ul className="mt-6 flex-1 space-y-3 text-sm">
              {plan.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <Check />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              {action ? (
                action(id)
              ) : (
                <Link
                  href="/start"
                  className={`block rounded-lg px-4 py-2.5 text-center font-medium ${featured ? "bg-slate-900 text-white hover:bg-slate-700" : "border border-slate-300 hover:bg-slate-50"}`}
                >
                  Start free, pay when you publish
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
