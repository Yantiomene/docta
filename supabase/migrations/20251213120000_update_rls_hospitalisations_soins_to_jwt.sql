-- Use JWT claim-based role checks for RLS on hospitalisations and soins

alter table if exists public.hospitalisations enable row level security;
alter table if exists public.soins enable row level security;

do $$
begin
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'hospitalisations' and policyname = 'allow_insert_by_staff_roles') then
    execute 'drop policy allow_insert_by_staff_roles on public.hospitalisations';
  end if;
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'hospitalisations' and policyname = 'allow_select_by_staff_roles') then
    execute 'drop policy allow_select_by_staff_roles on public.hospitalisations';
  end if;
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'hospitalisations' and policyname = 'allow_update_by_staff_roles') then
    execute 'drop policy allow_update_by_staff_roles on public.hospitalisations';
  end if;
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'hospitalisations' and policyname = 'allow_delete_by_admin_only') then
    execute 'drop policy allow_delete_by_admin_only on public.hospitalisations';
  end if;
end $$;

create policy allow_insert_by_staff_roles on public.hospitalisations
as permissive for insert
to authenticated
with check (public.jwt_role() in ('admin','medecin','infirmiere'));

create policy allow_select_by_staff_roles on public.hospitalisations
as permissive for select
to authenticated
using (public.jwt_role() in ('admin','medecin','infirmiere'));

create policy allow_update_by_staff_roles on public.hospitalisations
as permissive for update
to authenticated
using (public.jwt_role() in ('admin','medecin','infirmiere'))
with check (public.jwt_role() in ('admin','medecin','infirmiere'));

create policy allow_delete_by_admin_only on public.hospitalisations
as permissive for delete
to authenticated
using (public.jwt_role() = 'admin');

do $$
begin
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'soins' and policyname = 'allow_insert_by_staff_roles') then
    execute 'drop policy allow_insert_by_staff_roles on public.soins';
  end if;
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'soins' and policyname = 'allow_select_by_staff_roles') then
    execute 'drop policy allow_select_by_staff_roles on public.soins';
  end if;
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'soins' and policyname = 'allow_update_by_staff_roles') then
    execute 'drop policy allow_update_by_staff_roles on public.soins';
  end if;
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'soins' and policyname = 'allow_delete_by_admin_only') then
    execute 'drop policy allow_delete_by_admin_only on public.soins';
  end if;
end $$;

create policy allow_insert_by_staff_roles on public.soins
as permissive for insert
to authenticated
with check (public.jwt_role() in ('admin','medecin','infirmiere'));

create policy allow_select_by_staff_roles on public.soins
as permissive for select
to authenticated
using (public.jwt_role() in ('admin','medecin','infirmiere'));

create policy allow_update_by_staff_roles on public.soins
as permissive for update
to authenticated
using (public.jwt_role() in ('admin','medecin','infirmiere'))
with check (public.jwt_role() in ('admin','medecin','infirmiere'));

create policy allow_delete_by_admin_only on public.soins
as permissive for delete
to authenticated
using (public.jwt_role() = 'admin');
