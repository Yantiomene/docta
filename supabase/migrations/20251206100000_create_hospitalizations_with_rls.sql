-- Create hospitalizations table with RLS and staff-only policies
-- Run via Supabase CLI migrations or SQL editor

-- Ensure gen_random_uuid() is available
create extension if not exists pgcrypto;

create table if not exists public.hospitalisations (
  id uuid primary key default gen_random_uuid(),
  dossier_patient_id uuid not null references public.dossiers_patients(id) on delete cascade,
  medecin_responsable_id uuid references public.profiles(id),
  service text not null,
  chambre text,
  lit text,
  date_admission timestamptz not null,
  date_sortie_prevue timestamptz,
  date_sortie_reelle timestamptz,
  diagnostic_admission text,
  statut text not null check (statut in ('en_cours','sortie','transfere')),
  created_at timestamptz not null default now(),
  updated_at timestamptz default now()
);

-- Helpful indexes
create index if not exists hospitalisations_dossier_statut_idx
  on public.hospitalisations (dossier_patient_id, statut);
create index if not exists hospitalisations_admission_idx
  on public.hospitalisations (date_admission desc);
create index if not exists idx_hospitalisations_statut
  on public.hospitalisations using btree (statut) where (statut = 'en_cours');

-- Maintain updated_at automatically (reuse global helper if present)
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_hospitalisations_updated_at on public.hospitalisations;
create trigger set_hospitalisations_updated_at
before update on public.hospitalisations
for each row execute function public.set_updated_at();

-- Enable Row Level Security
alter table public.hospitalisations enable row level security;

-- Policies: staff can create/read/update; admin can delete
drop policy if exists allow_insert_by_staff_roles on public.hospitalisations;
create policy allow_insert_by_staff_roles on public.hospitalisations
as permissive for insert
to authenticated
with check (
  public.has_role(auth.uid(), array['admin','medecin','infirmiere'])
);

drop policy if exists allow_select_by_staff_roles on public.hospitalisations;
create policy allow_select_by_staff_roles on public.hospitalisations
as permissive for select
to authenticated
using (
  public.has_role(auth.uid(), array['admin','medecin','infirmiere'])
);

drop policy if exists allow_update_by_staff_roles on public.hospitalisations;
create policy allow_update_by_staff_roles on public.hospitalisations
as permissive for update
to authenticated
using (
  public.has_role(auth.uid(), array['admin','medecin','infirmiere'])
)
with check (
  public.has_role(auth.uid(), array['admin','medecin','infirmiere'])
);

drop policy if exists allow_delete_by_admin_only on public.hospitalisations;
create policy allow_delete_by_admin_only on public.hospitalisations
as permissive for delete
to authenticated
using (
  public.has_role(auth.uid(), array['admin'])
);
