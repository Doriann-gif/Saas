"use client";

import { useEffect, useState } from "react";
import { DRAFT_KEY } from "@/components/wizard";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium hover:bg-slate-50"
    >
      {copied ? "Copied" : label}
    </button>
  );
}

/** Clears the saved wizard draft once a project has been created from it. */
export function ClearDraft() {
  useEffect(() => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
  }, []);
  return null;
}
