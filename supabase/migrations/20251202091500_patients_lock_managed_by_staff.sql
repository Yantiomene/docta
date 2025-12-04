-- Add a flag to prevent patient from modifying staff-managed dossiers
alter table public.patients
  add column if not exists managed_by_staff boolean not null default false;

-- Ensure patient cannot UPDATE when dossier is managed by staff
drop policy if exists allow_update_by_patient_self on public.patients;
create policy allow_update_by_patient_self on public.patients
as permissive for update
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'patient'
  )
  and user_id = auth.uid()
  and managed_by_staff = false
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'patient'
  )
  and user_id = auth.uid()
  and managed_by_staff = false
);

