-- Owner-lock for AutoHQ — заменяет открытые "allow all" / using(true) политики
-- на доступ только для владельца. Запусти в Supabase SQL Editor.
--
-- Идентификация владельца — по GitHub-логину из JWT (user_metadata.user_name).
-- Если поменяешь GitHub-аккаунт владельца, поменяй и значение ниже.
-- service_role (вебхук n8n) обходит RLS всегда — его эти политики не трогают.

-- Хелпер: текущий пользователь — владелец?
create or replace function public.is_owner()
returns boolean
language sql
stable
as $$
  select lower(coalesce(
    auth.jwt() -> 'user_metadata' ->> 'user_name',
    auth.jwt() -> 'user_metadata' ->> 'preferred_username',
    ''
  )) = lower('CredoRevolution')
$$;

-- jobs
drop policy if exists "Authenticated users can read jobs"   on jobs;
drop policy if exists "Authenticated users can insert jobs"  on jobs;
drop policy if exists "Authenticated users can update jobs"  on jobs;
drop policy if exists "Authenticated users can delete jobs"  on jobs;
drop policy if exists "owner only" on jobs;
create policy "owner only" on jobs
  for all to authenticated
  using (public.is_owner()) with check (public.is_owner());

-- profile
drop policy if exists "allow all" on profile;
drop policy if exists "owner only" on profile;
create policy "owner only" on profile
  for all to authenticated
  using (public.is_owner()) with check (public.is_owner());

-- app_config
drop policy if exists "allow all" on app_config;
drop policy if exists "owner only" on app_config;
create policy "owner only" on app_config
  for all to authenticated
  using (public.is_owner()) with check (public.is_owner());

-- source_settings
drop policy if exists "allow all" on source_settings;
drop policy if exists "owner only" on source_settings;
create policy "owner only" on source_settings
  for all to authenticated
  using (public.is_owner()) with check (public.is_owner());
