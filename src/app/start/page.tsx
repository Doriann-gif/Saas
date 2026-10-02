import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { Wizard } from "@/components/wizard";

export const metadata: Metadata = { title: "Generate your legal documents" };

export default function StartPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-12">
        <p className="text-sm font-medium text-brand-700">Free preview · No account needed</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Let&apos;s build your legal pages</h1>
        <p className="mt-2 text-slate-600">About 5 minutes. Your answers stay in your browser until you create an account.</p>
        <div className="mt-10">
          <Wizard mode="public" />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
