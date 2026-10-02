import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/site-chrome";
import { getPlan, getUser } from "@/lib/data";
import { PLANS } from "@/lib/plans";
import { openBillingPortal } from "./actions";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const user = await getUser();
  if (!user) redirect("/login");
  const plan = await getPlan();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-4">
            <Logo />
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${plan === "free" ? "bg-slate-100 text-slate-600" : "bg-brand-50 text-brand-700"}`}>
              {plan === "free" ? "Free preview" : PLANS[plan].name}
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm sm:gap-3">
            <Link href="/dashboard" className="hidden px-2 py-1 text-slate-600 hover:text-slate-900 sm:block">
              Websites
            </Link>
            {plan === "free" ? (
              <Link href="/dashboard#upgrade" className="px-2 py-1 font-medium text-brand-700 hover:text-brand-600">
                Upgrade
              </Link>
            ) : (
              <form action={openBillingPortal}>
                <button className="px-2 py-1 text-slate-600 hover:text-slate-900">Billing</button>
              </form>
            )}
            <form action="/auth/signout" method="post">
              <button className="px-2 py-1 text-slate-600 hover:text-slate-900">Log out</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">{children}</main>
    </div>
  );
}
