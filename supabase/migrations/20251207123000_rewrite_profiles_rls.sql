-- Rewrite RLS policies on public.profiles to avoid infinite recursion
-- This migration removes policies that depend on has_role() (which queries profiles),
-- and replaces them with JWT-claim-based policies, breaking the recursive cycle.

-- Create a helper to read the 'role' claim from the JWT in a safe way
create or replace function public.jwt_role()
returns text
language sql
stable
as $$
  select coalesce(((current_setting('request.jwt.claims', true))::jsonb ->> 'role'), null);
$$;

-- Ensure RLS is enabled (not forced) on profiles so the service role can bypass when needed
alter table if exists public.profiles enable row level security;

-- Drop all existing policies on public.profiles to remove recursive definitions
do $$
declare r record;
begin
  for r in
    select policyname from pg_policies where schemaname = 'public' and tablename = 'profiles'
  loop
    execute format('drop policy if exists %I on public.profiles', r.policyname);
  end loop;
end $$;

-- Self-access policies: a user can read and update their own profile
create policy profiles_self_read
  on public.profiles
  as permissive
  for select
  to authenticated
  using (id = auth.uid());

create policy profiles_self_update
  on public.profiles
  as permissive
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Staff visibility: allow staff roles (admin, medecin, infirmiere) to read all profiles
create policy profiles_staff_read
  on public.profiles
  as permissive
  for select
  to authenticated
  using (public.jwt_role() in ('admin','medecin','infirmiere'));

-- Admin management: only admins can update any profile
create policy profiles_admin_update
  on public.profiles
  as permissive
  for update
  to authenticated
  using (public.jwt_role() = 'admin')
  with check (public.jwt_role() = 'admin');
