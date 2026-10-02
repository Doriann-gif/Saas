import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BRAND, appUrl } from "@/lib/brand";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(appUrl()),
  title: { default: `${BRAND.name}: GDPR legal pages & cookie banner for EU businesses`, template: `%s · ${BRAND.name}` },
  description:
    "Generate your privacy policy, cookie policy, terms, terms of sale, legal notice and accessibility statement in 5 minutes. Hosted, auto-updated, with a GDPR cookie banner. From €15/month.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
