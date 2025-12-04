-- Extend patients RLS: add user_id and broader policies

-- Add a link to the authenticated user (one dossier per user)
alter table public.patients
  add column if not exists user_id uuid unique;

create index if not exists patients_user_id_idx on public.patients(user_id);

-- Insert allowed for patient to create their own dossier
create policy allow_insert_by_patient_self on public.patients
as permissive for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'patient'
  )
  and user_id = auth.uid()
);

-- Select broadened: patient can read own dossier
-- NOTE: staff SELECT policy already created in initial migration; do not recreate here

create policy allow_select_by_patient_self on public.patients
as permissive for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'patient'
  )
  and user_id = auth.uid()
);

-- Update allowed for staff on all rows
create policy allow_update_by_staff_roles on public.patients
as permissive for update
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin','medecin','infirmiere')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin','medecin','infirmiere')
  )
);

-- Update allowed for patient on their own dossier
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
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'patient'
  )
  and user_id = auth.uid()
);

-- Delete allowed for staff roles (adjust to admin-only if desired)
create policy allow_delete_by_staff_roles on public.patients
as permissive for delete
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin','medecin','infirmiere')
  )
);
