-- Rode este SQL no SQL Editor do SEU projeto Supabase.

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  favorite boolean not null default false,
  archived boolean not null default false,
  brief jsonb not null default '{}'::jsonb,
  offer jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.offers to authenticated;
grant all on public.offers to service_role;

alter table public.offers enable row level security;

drop policy if exists "Users manage their own offers" on public.offers;
create policy "Users manage their own offers" on public.offers
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists offers_set_updated_at on public.offers;
create trigger offers_set_updated_at before update on public.offers
  for each row execute function public.set_updated_at();

-- ============================================================
-- DIAGNÓSTICO: erro "Database error saving new user" no cadastro
-- Rode isto para ver triggers instalados em auth.users:
--
--   select tgname, pg_get_triggerdef(t.oid)
--   from pg_trigger t
--   where tgrelid = 'auth.users'::regclass and not tgisinternal;
--
-- Se existir um trigger antigo (ex.: on_auth_user_created ->
-- handle_new_user) apontando para uma tabela que não existe mais,
-- remova-o:
--
--   drop trigger if exists on_auth_user_created on auth.users;
--   drop function if exists public.handle_new_user();
-- ============================================================
