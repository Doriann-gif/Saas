"use server";

import { z } from "zod";
import { appUrl } from "@/lib/brand";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type LoginState = { sent?: boolean; email?: string; error?: string } | undefined;

export async function sendMagicLink(_: LoginState, formData: FormData): Promise<LoginState> {
  const email = z.email().safeParse(formData.get("email"));
  if (!email.success) return { error: "Enter a valid email address." };
  const next = String(formData.get("next") ?? "/dashboard");
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: email.data,
    options: { emailRedirectTo: `${appUrl()}/auth/callback?next=${encodeURIComponent(safeNext)}` },
  });
  if (error) return { error: "We couldn't send the email. Please try again in a minute." };
  return { sent: true, email: email.data };
}
