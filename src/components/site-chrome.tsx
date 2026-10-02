import Link from "next/link";
import { BRAND } from "@/lib/brand";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-slate-900">
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-900 text-sm font-bold text-white">§</span>
      {BRAND.name}
    </Link>
  );
}

export function SiteHeader({ loggedIn = false }: { loggedIn?: boolean }) {
  return (
    <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />
        <nav className="flex items-center gap-1 text-sm sm:gap-4">
          <Link href="/#pricing" className="hidden px-2 py-1 text-slate-600 hover:text-slate-900 sm:block">
            Pricing
          </Link>
          <Link href="/#faq" className="hidden px-2 py-1 text-slate-600 hover:text-slate-900 sm:block">
            FAQ
          </Link>
          {loggedIn ? (
            <Link href="/dashboard" className="rounded-lg bg-slate-900 px-3 py-2 font-medium text-white hover:bg-slate-700">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="px-2 py-1 text-slate-600 hover:text-slate-900">
                Log in
              </Link>
              <Link href="/start" className="rounded-lg bg-slate-900 px-3 py-2 font-medium text-white hover:bg-slate-700">
                Generate free
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {BRAND.name}. Templates, not legal advice. For complex cases, consult a lawyer.
        </p>
        <a href={`mailto:${BRAND.supportEmail}`} className="hover:text-slate-900">
          {BRAND.supportEmail}
        </a>
      </div>
    </footer>
  );
}
