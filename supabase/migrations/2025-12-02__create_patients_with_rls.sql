-- Create patients table with required gender and optional blood type
-- Run this in Supabase (SQL editor or CLI migrations)

-- Ensure gen_random_uuid() is available
create extension if not exists pgcrypto;

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  dob date,
  gender text not null check (gender in ('male','female','other')),
  blood_type text check (blood_type in ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- Helpful index for lookups
create index if not exists patients_last_name_idx on public.patients (last_name);

-- Maintain updated_at automatically
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_patients_updated_at on public.patients;
create trigger set_patients_updated_at
before update on public.patients
for each row execute function public.set_updated_at();

-- Enable Row Level Security
alter table public.patients enable row level security;

-- Only staff roles (admin, medecin, infirmiere) may INSERT (create dossiers)
create policy allow_insert_by_staff_roles on public.patients
as permissive for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin','medecin','infirmiere')
  )
);

-- Allow SELECT for staff roles (adjust as needed)
create policy allow_select_by_staff_roles on public.patients
as permissive for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin','medecin','infirmiere')
  )
);

