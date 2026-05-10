-- ============================================================
-- ARVEST PILOT — Schéma Supabase
-- Coller et exécuter dans Supabase > SQL Editor
-- ============================================================

-- ─── 1. TABLE PROFILES (étend auth.users) ────────────────────────────────────

create table if not exists public.profiles (
  id            uuid        references auth.users(id) on delete cascade primary key,
  email         text,
  name          text,
  company       text        default 'Mon entreprise',
  phone         text        default '',
  fonction      text        default '',
  role          text        default 'user',
  is_admin      boolean     default false,
  is_authorized boolean     default false,
  requested_at  timestamptz,
  created_at    timestamptz default now()
);

alter table public.profiles enable row level security;

-- Chaque utilisateur lit et modifie son propre profil
create policy "own_profile_read"   on public.profiles for select using (auth.uid() = id);
create policy "own_profile_update" on public.profiles for update using (auth.uid() = id);

-- ─── Trigger : créer le profil automatiquement à l'inscription ────────────────

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  admin_email text := 'arvest-conseil@outlook.com';
begin
  insert into public.profiles (id, email, name, company, is_admin, is_authorized)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'company', 'Mon entreprise'),
    lower(new.email) = admin_email,
    lower(new.email) = admin_email
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Fonctions admin (SECURITY DEFINER = s'exécutent en tant que superuser) ───

-- Lister tous les profils (uniquement si l'appelant est admin)
create or replace function public.get_all_profiles()
returns setof public.profiles
language sql security definer set search_path = public
as $$
  select * from public.profiles
  where exists (
    select 1 from public.profiles where id = auth.uid() and is_admin = true
  )
  order by created_at desc;
$$;

-- Autoriser / bloquer un utilisateur
create or replace function public.admin_set_authorized(target_id uuid, authorized boolean)
returns void
language sql security definer set search_path = public
as $$
  update public.profiles
  set is_authorized = authorized
  where id = target_id
    and exists (
      select 1 from public.profiles where id = auth.uid() and is_admin = true
    );
$$;

-- ─── 2. TABLE SALES ───────────────────────────────────────────────────────────

create table if not exists public.sales (
  id          uuid    default gen_random_uuid() primary key,
  user_id     uuid    references auth.users(id) on delete cascade not null,
  client      text    default '',
  date        text    default '',
  due_date    text,
  description text    default '',
  ht          numeric default 0,
  tva         numeric default 0,
  ttc         numeric default 0,
  status      text    default 'pending',
  category    text    default '',
  note        text,
  created_at  timestamptz default now()
);

alter table public.sales enable row level security;

-- Chaque utilisateur gère uniquement ses propres ventes
create policy "own_sales" on public.sales
  for all using (auth.uid() = user_id);

-- ─── 3. TABLE EXPENSES ───────────────────────────────────────────────────────

create table if not exists public.expenses (
  id          uuid    default gen_random_uuid() primary key,
  user_id     uuid    references auth.users(id) on delete cascade not null,
  supplier    text    default '',
  date        text    default '',
  due_date    text,
  description text    default '',
  ht          numeric default 0,
  tva         numeric default 0,
  ttc         numeric default 0,
  type        text    default 'variable',
  category    text    default '',
  note        text,
  created_at  timestamptz default now()
);

alter table public.expenses enable row level security;

-- Chaque utilisateur gère uniquement ses propres charges
create policy "own_expenses" on public.expenses
  for all using (auth.uid() = user_id);

-- ─── FIN ──────────────────────────────────────────────────────────────────────
-- Vérifier que Supabase Auth est activé dans Authentication > Settings
-- Activer "Email confirmations" selon votre besoin (désactiver pour dev rapide)
