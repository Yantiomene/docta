-- Restrict delete on patients to admin only

-- Drop previous delete policy if exists
drop policy if exists allow_delete_by_staff_roles on public.patients;

-- Create admin-only delete policy
create policy allow_delete_by_admin_only on public.patients
as permissive for delete
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

