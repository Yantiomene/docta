-- Create SECURITY DEFINER helper functions to avoid RLS recursion when checking roles
-- and update patients policies to use these helpers instead of subqueries to profiles.

-- Helper: check if a user has any role in the provided list
create or replace function public.has_role(u uuid, allowed text[])
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = u
      and p.role = any(allowed)
  );
$$;

-- Optional wrapper for patient role
create or replace function public.is_patient(u uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select public.has_role(u, array['patient']);
$$;

-- Ensure everyone can invoke these role-check helpers
grant execute on function public.has_role(uuid, text[]) to authenticated, anon;
grant execute on function public.is_patient(uuid) to authenticated, anon;

-- Recreate patients policies using the helpers to prevent recursion

-- Insert by staff roles
drop policy if exists allow_insert_by_staff_roles on public.patients;
create policy allow_insert_by_staff_roles on public.patients
as permissive for insert
to authenticated
with check (
  public.has_role(auth.uid(), array['admin','medecin','infirmiere'])
);

-- Select by staff roles
drop policy if exists allow_select_by_staff_roles on public.patients;
create policy allow_select_by_staff_roles on public.patients
as permissive for select
to authenticated
using (
  public.has_role(auth.uid(), array['admin','medecin','infirmiere'])
);

-- Insert by patient self
drop policy if exists allow_insert_by_patient_self on public.patients;
create policy allow_insert_by_patient_self on public.patients
as permissive for insert
to authenticated
with check (
  public.is_patient(auth.uid())
  and user_id = auth.uid()
);

-- Select by patient self
drop policy if exists allow_select_by_patient_self on public.patients;
create policy allow_select_by_patient_self on public.patients
as permissive for select
to authenticated
using (
  public.is_patient(auth.uid())
  and user_id = auth.uid()
);

-- Update by staff roles
drop policy if exists allow_update_by_staff_roles on public.patients;
create policy allow_update_by_staff_roles on public.patients
as permissive for update
to authenticated
using (
  public.has_role(auth.uid(), array['admin','medecin','infirmiere'])
)
with check (
  public.has_role(auth.uid(), array['admin','medecin','infirmiere'])
);

-- Update by patient self (respect managed_by_staff lock)
drop policy if exists allow_update_by_patient_self on public.patients;
create policy allow_update_by_patient_self on public.patients
as permissive for update
to authenticated
using (
  public.is_patient(auth.uid())
  and user_id = auth.uid()
  and managed_by_staff = false
)
with check (
  public.is_patient(auth.uid())
  and user_id = auth.uid()
  and managed_by_staff = false
);

-- Delete by admin only
drop policy if exists allow_delete_by_admin_only on public.patients;
create policy allow_delete_by_admin_only on public.patients
as permissive for delete
to authenticated
using (
  public.has_role(auth.uid(), array['admin'])
);

