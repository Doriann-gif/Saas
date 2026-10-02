import { startCheckout } from "@/app/dashboard/actions";
import { Pricing } from "@/components/pricing";

export function Upgrade({ title = "Publish your documents" }: { title?: string }) {
  return (
    <section id="upgrade" className="scroll-mt-20">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-slate-600">Unlock full documents, hosted pages, downloads and the cookie banner. Cancel anytime.</p>
      <div className="mt-6">
        <Pricing
          action={(plan) => (
            <div className="grid gap-2 sm:grid-cols-2">
              {(["month", "year"] as const).map((interval) => (
                <form key={interval} action={startCheckout}>
                  <input type="hidden" name="plan" value={plan} />
                  <input type="hidden" name="interval" value={interval} />
                  <button
                    className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold ${interval === "month" ? "bg-slate-900 text-white hover:bg-slate-700" : "border border-slate-300 bg-white hover:bg-slate-50"}`}
                  >
                    {interval === "month" ? "Pay monthly" : "Pay yearly"}
                  </button>
                </form>
              ))}
            </div>
          )}
        />
      </div>
    </section>
  );
}
