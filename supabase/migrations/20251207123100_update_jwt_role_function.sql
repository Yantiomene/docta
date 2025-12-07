-- Improve jwt_role() to read role from top-level, user_metadata, or app_metadata
create or replace function public.jwt_role()
returns text
language plpgsql
stable
as $$
declare claims_json jsonb;
begin
  claims_json := (current_setting('request.jwt.claims', true))::jsonb;
  return coalesce(
    claims_json ->> 'role',
    claims_json -> 'user_metadata' ->> 'role',
    claims_json -> 'app_metadata' ->> 'role'
  );
end;
$$;

