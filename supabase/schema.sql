-- ============================================================
-- CRONIA — Supabase Schema
-- Ejecuta esto en el SQL Editor de tu proyecto Supabase
-- ============================================================

-- Habilitar extensión para UUIDs
create extension if not exists "pgcrypto";

-- ============================================================
-- TABLA: profiles
-- Extiende auth.users con datos de perfil y rol
-- ============================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  role text not null default 'client' check (role in ('admin', 'client')),
  created_at timestamptz default now()
);

-- Trigger: crear perfil automáticamente al registrarse
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    coalesce(new.raw_user_meta_data->>'role', 'client')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- TABLA: invitations
-- Links de invitación únicos que Jorge genera por cliente
-- ============================================================
create table invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  token text not null unique default encode(gen_random_bytes(32), 'hex'),
  used boolean default false,
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '7 days')
);

-- ============================================================
-- TABLA: clients
-- Datos del cliente, vinculados a su user profile
-- ============================================================
create table clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  email text not null,
  plan_price numeric(10,2),
  internal_notes text,
  active boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- TABLA: baselines
-- Horas semanales ANTES de trabajar con Cronia (por cliente)
-- ============================================================
create table baselines (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade unique,
  weekly_email_hours numeric(5,2) default 0,
  weekly_meeting_hours numeric(5,2) default 0,
  weekly_repetitive_hours numeric(5,2) default 0,
  weekly_research_hours numeric(5,2) default 0,
  weekly_content_hours numeric(5,2) default 0,
  created_at timestamptz default now(),
  -- total calculado para referencia rápida
  total_hours numeric(5,2) generated always as (
    weekly_email_hours + weekly_meeting_hours + weekly_repetitive_hours +
    weekly_research_hours + weekly_content_hours
  ) stored
);

-- ============================================================
-- TABLA: check_ins
-- Check-in semanal del cliente (cada viernes)
-- ============================================================
create table check_ins (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  week_date date not null, -- lunes de esa semana
  optimization_score smallint check (optimization_score between 1 and 5),
  biggest_time_drain text,
  felt_control boolean,
  reported_email_hours numeric(5,2) default 0,
  reported_meeting_hours numeric(5,2) default 0,
  reported_repetitive_hours numeric(5,2) default 0,
  created_at timestamptz default now(),
  unique(client_id, week_date)
);

-- ============================================================
-- TABLA: sessions
-- Sesiones agendadas con Jorge
-- ============================================================
create table sessions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  scheduled_at timestamptz not null,
  notes text,
  status text default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
  created_at timestamptz default now()
);

-- ============================================================
-- TABLA: action_items
-- Accionables de lunes a viernes (Jorge los carga post-sesión)
-- ============================================================
create table action_items (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  week_date date not null, -- lunes de esa semana
  day text not null check (day in ('lun', 'mar', 'mie', 'jue', 'vie')),
  title text not null,
  description text,
  estimated_minutes integer,
  prompt_link text,
  completed boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- TABLA: insights
-- Insights semanales escritos por Jorge post-sesión
-- ============================================================
create table insights (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  week_date date not null,
  content text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- TABLA: playbooks
-- Biblioteca de prompts y guías personalizadas por cliente
-- ============================================================
create table playbooks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  title text not null,
  category text not null default 'general',
  description text,
  prompt_content text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Cada cliente solo puede ver SU información
-- ============================================================

alter table profiles enable row level security;
alter table clients enable row level security;
alter table baselines enable row level security;
alter table check_ins enable row level security;
alter table sessions enable row level security;
alter table action_items enable row level security;
alter table insights enable row level security;
alter table playbooks enable row level security;
alter table invitations enable row level security;

-- Helper: obtener el client_id del usuario actual
create or replace function get_my_client_id()
returns uuid as $$
  select id from clients where user_id = auth.uid() limit 1;
$$ language sql security definer;

-- Helper: verificar si el usuario es admin
create or replace function is_admin()
returns boolean as $$
  select exists(
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- profiles: cada quien ve el suyo; admin ve todos
create policy "profiles_select" on profiles
  for select using (id = auth.uid() or is_admin());
create policy "profiles_update" on profiles
  for update using (id = auth.uid() or is_admin());

-- clients: admin ve todos; cliente ve solo el suyo
create policy "clients_select" on clients
  for select using (user_id = auth.uid() or is_admin());
create policy "clients_insert" on clients
  for insert with check (is_admin());
create policy "clients_update" on clients
  for update using (is_admin());

-- baselines
create policy "baselines_select" on baselines
  for select using (client_id = get_my_client_id() or is_admin());
create policy "baselines_all_admin" on baselines
  for all using (is_admin());

-- check_ins: cliente inserta el suyo; admin lee todos
create policy "checkins_select" on check_ins
  for select using (client_id = get_my_client_id() or is_admin());
create policy "checkins_insert" on check_ins
  for insert with check (client_id = get_my_client_id());
create policy "checkins_admin" on check_ins
  for all using (is_admin());

-- sessions
create policy "sessions_select" on sessions
  for select using (client_id = get_my_client_id() or is_admin());
create policy "sessions_admin" on sessions
  for all using (is_admin());

-- action_items
create policy "actions_select" on action_items
  for select using (client_id = get_my_client_id() or is_admin());
create policy "actions_update_complete" on action_items
  for update using (client_id = get_my_client_id())
  with check (client_id = get_my_client_id());
create policy "actions_admin" on action_items
  for all using (is_admin());

-- insights
create policy "insights_select" on insights
  for select using (client_id = get_my_client_id() or is_admin());
create policy "insights_admin" on insights
  for all using (is_admin());

-- playbooks
create policy "playbooks_select" on playbooks
  for select using (client_id = get_my_client_id() or is_admin());
create policy "playbooks_admin" on playbooks
  for all using (is_admin());

-- invitations: solo admin
create policy "invitations_admin" on invitations
  for all using (is_admin());
