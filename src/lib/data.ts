import "server-only";
import { randomBytes } from "node:crypto";
import { cache } from "react";
import { profileSchema, type Profile } from "@/lib/legal";
import { effectivePlan, type PlanId } from "@/lib/plans";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";

export type Project = {
  id: string;
  user_id: string;
  public_id: string;
  name: string;
  answers: Profile;
  created_at: string;
  updated_at: string;
};

export type Subscription = {
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: string | null;
  status: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
};

function parseProject(row: Omit<Project, "answers"> & { answers: unknown }): Project | null {
  const answers = profileSchema.safeParse(row.answers);
  return answers.success ? { ...row, answers: answers.data } : null;
}

export const getUser = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
});

export const getSubscription = cache(async (): Promise<Subscription | null> => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("subscriptions").select("*").maybeSingle();
  return data;
});

export async function getPlan(): Promise<PlanId> {
  return effectivePlan(await getSubscription());
}

export async function getProjects(): Promise<Project[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("projects").select("*").order("created_at");
  if (error) throw error;
  return (data ?? []).map(parseProject).filter((p): p is Project => p !== null);
}

export async function getProject(id: string): Promise<Project | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
  return data ? parseProject(data) : null;
}

export async function countRecentConsents(projectId: string, days: number): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("consent_logs")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId)
    .gte("created_at", since);
  return count ?? 0;
}

/** Public lookup for hosted pages and the banner: project plus the owner's current plan. */
export const getPublishedProject = cache(async (publicId: string): Promise<{ project: Project; plan: PlanId } | null> => {
  if (!/^[A-Za-z0-9]{8,32}$/.test(publicId)) return null;
  const admin = createSupabaseAdminClient();
  const { data } = await admin.from("projects").select("*").eq("public_id", publicId).maybeSingle();
  const project = data ? parseProject(data) : null;
  if (!project) return null;
  const { data: sub } = await admin.from("subscriptions").select("plan,status").eq("user_id", project.user_id).maybeSingle();
  return { project, plan: effectivePlan(sub) };
});

export function newPublicId(): string {
  const alphabet = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(randomBytes(12), (b) => alphabet[b % alphabet.length]).join("");
}
