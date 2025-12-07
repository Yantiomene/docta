-- Create soins table with RLS and staff-only policies
-- Run via Supabase CLI migrations or SQL editor

-- Ensure gen_random_uuid() is available
create extension if not exists pgcrypto;

create table if not exists public.soins (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  title text not null,
  description text,
  scheduled_at timestamptz not null,
  assigned_to_nurse_id uuid references public.profiles(id) on delete set null,
  status text not null check (status in ('scheduled','in_progress','done','missed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- Helpful indexes
create index if not exists soins_patient_status_idx
  on public.soins (patient_id, status);
create index if not exists soins_assigned_nurse_idx
  on public.soins (assigned_to_nurse_id);
create index if not exists soins_scheduled_at_idx
  on public.soins (scheduled_at desc);

-- Maintain updated_at automatically (reuse global helper if present)
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_soins_updated_at on public.soins;
create trigger set_soins_updated_at
before update on public.soins
for each row execute function public.set_updated_at();

-- Enable Row Level Security
alter table public.soins enable row level security;

-- Policies: staff can create/read/update; admin can delete
drop policy if exists allow_insert_by_staff_roles on public.soins;
create policy allow_insert_by_staff_roles on public.soins
as permissive for insert
to authenticated
with check (
  public.has_role(auth.uid(), array['admin','medecin','infirmiere'])
);

drop policy if exists allow_select_by_staff_roles on public.soins;
create policy allow_select_by_staff_roles on public.soins
as permissive for select
to authenticated
using (
  public.has_role(auth.uid(), array['admin','medecin','infirmiere'])
);

drop policy if exists allow_update_by_staff_roles on public.soins;
create policy allow_update_by_staff_roles on public.soins
as permissive for update
to authenticated
using (
  public.has_role(auth.uid(), array['admin','medecin','infirmiere'])
)
with check (
  public.has_role(auth.uid(), array['admin','medecin','infirmiere'])
);

drop policy if exists allow_delete_by_admin_only on public.soins;
create policy allow_delete_by_admin_only on public.soins
as permissive for delete
to authenticated
using (
  public.has_role(auth.uid(), array['admin'])
);

