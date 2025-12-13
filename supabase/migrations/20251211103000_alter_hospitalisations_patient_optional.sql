-- Allow hospitalisations for patients without linked user profile or dossier
alter table public.hospitalisations
  add column if not exists patient_id uuid references public.patients(id) on delete cascade;

alter table public.hospitalisations
  alter column dossier_patient_id drop not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint c
    where c.conname = 'hospitalisations_patient_or_dossier'
      and c.conrelid = 'public.hospitalisations'::regclass
  ) then
    execute 'alter table public.hospitalisations add constraint hospitalisations_patient_or_dossier check (patient_id is not null or dossier_patient_id is not null)';
  end if;
end$$;

create index if not exists hospitalisations_patient_statut_idx
  on public.hospitalisations (patient_id, statut);
