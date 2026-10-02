"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { appUrl } from "@/lib/brand";
import { getPlan, getProjects, getSubscription, getUser, newPublicId } from "@/lib/data";
import { profileSchema } from "@/lib/legal";
import { ENTITLEMENTS, priceIdFor, type Interval, type PaidPlanId } from "@/lib/plans";
import { stripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SaveState = { error?: string } | undefined;

function parseAnswers(formData: FormData) {
  try {
    return profileSchema.safeParse(JSON.parse(String(formData.get("answers") ?? "")));
  } catch {
    return profileSchema.safeParse(null);
  }
}

async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

export async function createProject(_: SaveState, formData: FormData): Promise<SaveState> {
  const user = await requireUser();
  const parsed = parseAnswers(formData);
  if (!parsed.success) return { error: "Some answers are missing or invalid. Go back and check each step." };

  const [plan, projects] = await Promise.all([getPlan(), getProjects()]);
  if (projects.length >= ENTITLEMENTS[plan].sites) {
    return { error: `Your plan includes ${ENTITLEMENTS[plan].sites} website${ENTITLEMENTS[plan].sites > 1 ? "s" : ""}. Upgrade to Pro for up to 5.` };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({ user_id: user.id, public_id: newPublicId(), name: parsed.data.businessName, answers: parsed.data })
    .select("id")
    .single();
  if (error) return { error: "Could not save. Please try again." };
  redirect(`/dashboard/${data.id}?created=1`);
}

export async function updateProject(id: string, _: SaveState, formData: FormData): Promise<SaveState> {
  await requireUser();
  const parsed = parseAnswers(formData);
  if (!parsed.success) return { error: "Some answers are missing or invalid. Go back and check each step." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("projects").update({ name: parsed.data.businessName, answers: parsed.data }).eq("id", id);
  if (error) return { error: "Could not save. Please try again." };
  revalidatePath(`/dashboard/${id}`);
  revalidatePath("/p/[publicId]/[doc]", "page");
  redirect(`/dashboard/${id}`);
}

export async function deleteProject(formData: FormData) {
  await requireUser();
  const supabase = await createSupabaseServerClient();
  await supabase.from("projects").delete().eq("id", String(formData.get("id")));
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function startCheckout(formData: FormData) {
  const user = await requireUser();
  const plan = formData.get("plan") === "pro" ? "pro" : ("starter" satisfies PaidPlanId);
  const interval: Interval = formData.get("interval") === "year" ? "year" : "month";
  const sub = await getSubscription();

  // Existing subscribers change plan in the billing portal, not via a second subscription.
  if (sub?.stripe_subscription_id && sub.status && ["active", "trialing", "past_due"].includes(sub.status)) {
    return openBillingPortal();
  }

  const trialDays = Number(process.env.STRIPE_TRIAL_DAYS ?? 0);
  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceIdFor(plan, interval), quantity: 1 }],
    client_reference_id: user.id,
    ...(sub?.stripe_customer_id
      ? { customer: sub.stripe_customer_id, customer_update: { name: "auto", address: "auto" } }
      : { customer_email: user.email }),
    subscription_data: {
      metadata: { user_id: user.id },
      ...(trialDays > 0 ? { trial_period_days: trialDays } : {}),
    },
    metadata: { user_id: user.id },
    allow_promotion_codes: true,
    billing_address_collection: "required",
    tax_id_collection: { enabled: true },
    automatic_tax: { enabled: process.env.STRIPE_AUTOMATIC_TAX === "true" },
    success_url: `${appUrl()}/dashboard?checkout=success`,
    cancel_url: `${appUrl()}/dashboard?checkout=cancelled`,
  });
  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  redirect(session.url);
}

export async function openBillingPortal() {
  await requireUser();
  const sub = await getSubscription();
  if (!sub?.stripe_customer_id) redirect("/dashboard#upgrade");
  const portal = await stripe().billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${appUrl()}/dashboard`,
  });
  redirect(portal.url);
}
