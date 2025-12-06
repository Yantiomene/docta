-- Create hospitalizations table with RLS and staff-only policies
-- Run via Supabase CLI migrations or SQL editor

-- Ensure gen_random_uuid() is available
create extension if not exists pgcrypto;

create table if not exists public.hospitalizations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  ward text,
  room text,
  bed text,
  admitted_at timestamptz not null,
  discharged_at timestamptz,
  status text not null check (status in ('active','discharged','planned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- Helpful indexes
create index if not exists hospitalizations_patient_status_idx
  on public.hospitalizations (patient_id, status);
create index if not exists hospitalizations_admitted_at_idx
  on public.hospitalizations (admitted_at desc);

-- Maintain updated_at automatically (reuse global helper if present)
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_hospitalizations_updated_at on public.hospitalizations;
create trigger set_hospitalizations_updated_at
before update on public.hospitalizations
for each row execute function public.set_updated_at();

-- Enable Row Level Security
alter table public.hospitalizations enable row level security;

-- Policies: staff can create/read/update; admin can delete
drop policy if exists allow_insert_by_staff_roles on public.hospitalizations;
create policy allow_insert_by_staff_roles on public.hospitalizations
as permissive for insert
to authenticated
with check (
  public.has_role(auth.uid(), array['admin','medecin','infirmiere'])
);

drop policy if exists allow_select_by_staff_roles on public.hospitalizations;
create policy allow_select_by_staff_roles on public.hospitalizations
as permissive for select
to authenticated
using (
  public.has_role(auth.uid(), array['admin','medecin','infirmiere'])
);

drop policy if exists allow_update_by_staff_roles on public.hospitalizations;
create policy allow_update_by_staff_roles on public.hospitalizations
as permissive for update
to authenticated
using (
  public.has_role(auth.uid(), array['admin','medecin','infirmiere'])
)
with check (
  public.has_role(auth.uid(), array['admin','medecin','infirmiere'])
);

drop policy if exists allow_delete_by_admin_only on public.hospitalizations;
create policy allow_delete_by_admin_only on public.hospitalizations
as permissive for delete
to authenticated
using (
  public.has_role(auth.uid(), array['admin'])
);

