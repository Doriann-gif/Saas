import type { Metadata } from "next";
import { Logo } from "@/components/site-chrome";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, error } = await searchParams;
  const safeNext = typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-slate-50 px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <Logo />
        </div>
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-xl font-semibold">Log in or create an account</h1>
          <p className="mt-1 text-sm text-slate-600">We&apos;ll email you a magic link. No password needed.</p>
          {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">That link is invalid or has expired. Please request a new one.</p>}
          <LoginForm next={safeNext} />
        </div>
      </div>
    </main>
  );
}
