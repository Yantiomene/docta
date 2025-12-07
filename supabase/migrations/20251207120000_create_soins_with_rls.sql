
create extension if not exists pgcrypto;

-- Create table if missing; otherwise, progressively ensure required columns exist
create table if not exists public.soins (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  scheduled_at timestamptz,
  status text,
  created_at timestamptz default now(),
  updated_at timestamptz
);

-- Add required columns if they do not exist
alter table public.soins
  add column if not exists patient_id uuid,
  add column if not exists assigned_to_nurse_id uuid,
  add column if not exists title text,
  add column if not exists description text,
  add column if not exists scheduled_at timestamptz,
  add column if not exists status text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint c
    where c.conname = 'soins_patient_fk'
      and c.conrelid = 'public.soins'::regclass
  ) then
    execute 'alter table public.soins add constraint soins_patient_fk foreign key (patient_id) references public.patients(id) on delete cascade';
  end if;
  if not exists (
    select 1 from pg_constraint c
    where c.conname = 'soins_assigned_nurse_fk'
      and c.conrelid = 'public.soins'::regclass
  ) then
    execute 'alter table public.soins add constraint soins_assigned_nurse_fk foreign key (assigned_to_nurse_id) references public.profiles(id) on delete set null';
  end if;
end$$;

-- Ensure status is constrained to expected values (guarded)
do $$
begin
  if not exists (
    select 1 from pg_constraint c
    where c.conname = 'soins_status_check'
      and c.conrelid = 'public.soins'::regclass
  ) then
    execute 'alter table public.soins add constraint soins_status_check check (status in (''scheduled'',''in_progress'',''done'',''missed''))';
  end if;
end$$;

-- Helpful indexes (only if related columns exist)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'soins' and column_name = 'patient_id'
  ) and exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'soins' and column_name = 'status'
  ) then
    execute 'create index if not exists soins_patient_status_idx on public.soins (patient_id, status)';
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'soins' and column_name = 'assigned_to_nurse_id'
  ) then
    execute 'create index if not exists soins_assigned_nurse_idx on public.soins (assigned_to_nurse_id)';
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'soins' and column_name = 'scheduled_at'
  ) then
    execute 'create index if not exists soins_scheduled_at_idx on public.soins (scheduled_at desc)';
  end if;
end$$;

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
