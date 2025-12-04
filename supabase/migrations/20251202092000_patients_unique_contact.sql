-- Enforce uniqueness on email and phone when provided
-- Allow multiple NULLs; enforce uniqueness only when not null

create unique index if not exists patients_unique_email
  on public.patients (email)
  where email is not null;

create unique index if not exists patients_unique_phone
  on public.patients (phone)
  where phone is not null;

