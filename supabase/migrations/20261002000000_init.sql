-- Websites/businesses a customer generates documents for.
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  public_id text not null unique,
  name text not null check (char_length(name) between 1 and 120),
  answers jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index projects_user_id_idx on public.projects (user_id);

-- One row per customer, written only by the Stripe webhook (service role).
create table public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  plan text check (plan in ('starter', 'pro')),
  status text,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Proof-of-consent records from the embedded cookie banner (Pro plan).
-- No IP addresses are stored; the consent id is a random per-browser identifier.
create table public.consent_logs (
  id bigint generated always as identity primary key,
  project_id uuid not null references public.projects (id) on delete cascade,
  consent_id text not null check (char_length(consent_id) <= 64),
  choices jsonb not null,
  config_version text not null check (char_length(config_version) <= 32),
  user_agent text check (char_length(user_agent) <= 300),
  created_at timestamptz not null default now()
);
create index consent_logs_project_created_idx on public.consent_logs (project_id, created_at desc);

-- Keep updated_at fresh.
create function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
create trigger projects_touch before update on public.projects
  for each row execute function public.touch_updated_at();
create trigger subscriptions_touch before update on public.subscriptions
  for each row execute function public.touch_updated_at();

-- Row level security: users only ever see their own rows.
alter table public.projects enable row level security;
alter table public.subscriptions enable row level security;
alter table public.consent_logs enable row level security;

create policy "own projects: select" on public.projects
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "own projects: insert" on public.projects
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own projects: update" on public.projects
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own projects: delete" on public.projects
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "own subscription: select" on public.subscriptions
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "own consent logs: select" on public.consent_logs
  for select to authenticated using (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.uid()))
  );
