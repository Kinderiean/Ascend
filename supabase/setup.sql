-- =============================================================================
-- Ascend — Supabase setup
-- Paste this entire file into Supabase SQL Editor and click "Run".
-- Re-runnable: every statement uses IF NOT EXISTS / OR REPLACE.
-- =============================================================================

-- 1. ADMIN ALLOWLIST ----------------------------------------------------------
-- Two emails get lifetime Plus access for free, forever.
create table if not exists public.admin_allowlist (
  email text primary key,
  granted_at timestamptz not null default now()
);

insert into public.admin_allowlist (email) values
  ('ashutoshjr@gmail.com'),
  ('kinderieangaming@gmail.com')
on conflict (email) do nothing;

alter table public.admin_allowlist enable row level security;

drop policy if exists "no client read of admin allowlist" on public.admin_allowlist;
create policy "no client read of admin allowlist"
  on public.admin_allowlist for select
  using (false);

-- 2. PROFILES -----------------------------------------------------------------
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  entitlement text not null default 'free'
    check (entitlement in ('free', 'ascend_plus', 'ascend_plus_lifetime')),
  rc_app_user_id text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_email_idx on public.profiles(email);
create index if not exists profiles_deleted_at_idx on public.profiles(deleted_at);

alter table public.profiles enable row level security;

drop policy if exists "users can read own profile" on public.profiles;
create policy "users can read own profile"
  on public.profiles for select
  using (auth.uid() = user_id and deleted_at is null);

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id and deleted_at is null)
  with check (auth.uid() = user_id);

-- Block direct inserts/deletes — only the trigger should create profiles.
drop policy if exists "no direct inserts" on public.profiles;
drop policy if exists "no direct deletes" on public.profiles;

-- 3. AUTO-CREATE PROFILE ON SIGNUP --------------------------------------------
-- When a user signs up, create their profile. If their email is in the admin
-- allowlist, grant lifetime Plus immediately.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_entitlement text := 'free';
begin
  if exists (select 1 from public.admin_allowlist where email = new.email) then
    v_entitlement := 'ascend_plus_lifetime';
  end if;

  insert into public.profiles (user_id, email, entitlement)
  values (new.id, new.email, v_entitlement)
  on conflict (user_id) do update
    set email = excluded.email,
        entitlement = case
          when public.profiles.entitlement = 'ascend_plus_lifetime' then 'ascend_plus_lifetime'
          else excluded.entitlement
        end,
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Refresh existing users (in case admin allowlist changed)
update public.profiles p
   set entitlement = 'ascend_plus_lifetime',
       updated_at = now()
  from public.admin_allowlist a
 where p.email = a.email
   and p.entitlement <> 'ascend_plus_lifetime';

-- 4. ACCOUNT DELETION RPC -----------------------------------------------------
-- Soft-deletes the profile. Hard-deletion happens 30 days later via a scheduled
-- job (cron) you can configure later. This lets the user immediately disappear
-- from queries but allows recovery if they sign back in within 30 days.
create or replace function public.request_account_deletion()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
     set deleted_at = now(),
         updated_at = now()
   where user_id = auth.uid();
end;
$$;

revoke all on function public.request_account_deletion() from public;
grant execute on function public.request_account_deletion() to authenticated;

-- 5. UPDATED-AT TRIGGER -------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- =============================================================================
-- Done. Verify with:
--   select * from public.admin_allowlist;
--   select * from public.profiles;
-- After signing up with one of the admin emails, that profile should show
-- entitlement = 'ascend_plus_lifetime'.
-- =============================================================================
