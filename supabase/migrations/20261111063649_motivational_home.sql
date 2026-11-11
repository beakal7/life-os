-- Personal tracker configuration uses the existing owner-only profiles RLS.
alter table public.profiles
  add column if not exists home_settings jsonb;
alter table public.profiles
  add constraint profiles_home_settings_object
  check (home_settings is null or (jsonb_typeof(home_settings) = 'object' and char_length(home_settings::text) <= 40000));
