-- ============================================================================
-- FLOW Dashboard — Migration 0002: Clients, client users, tasks & activity (Phase 2)
-- ============================================================================

do $$ begin
  create type client_status as enum ('lead', 'active', 'paused', 'churned');
exception when duplicate_object then null; end $$;

do $$ begin
  create type task_status as enum ('todo', 'in_progress', 'blocked', 'review', 'done');
exception when duplicate_object then null; end $$;

do $$ begin
  create type task_priority as enum ('low', 'medium', 'high', 'urgent');
exception when duplicate_object then null; end $$;

-- ── Tables ──────────────────────────────────────────────────────────────────
create table if not exists public.clients (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,              -- subdomain
  name        text not null,
  logo_url    text,
  brand_color text default '#143C28',
  status      client_status not null default 'lead',
  health      smallint default 100,              -- 0-100 health score
  notes       text,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

create table if not exists public.client_users (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references public.clients(id) on delete cascade,
  user_id         uuid references auth.users(id) on delete set null,  -- set once they sign up
  full_name       text not null,
  email           text not null,
  role_at_company text,
  status          text not null default 'active',
  created_at      timestamptz not null default now(),
  unique (client_id, email)
);

create table if not exists public.tasks (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references public.clients(id) on delete cascade,
  title        text not null,
  description  text,
  status       task_status not null default 'todo',
  stage        text,                              -- free-form pipeline stage
  next_step    text,
  priority     task_priority not null default 'medium',
  assignee_id  uuid references public.profiles(id) on delete set null,
  created_by   uuid references public.profiles(id) on delete set null,
  start_date   date,
  due_date     date,
  completed_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.task_activity (
  id         uuid primary key default gen_random_uuid(),
  task_id    uuid not null references public.tasks(id) on delete cascade,
  actor_id   uuid references public.profiles(id) on delete set null,
  action     text not null,                       -- 'created' | 'status_changed' | ...
  detail     jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_tasks_client   on public.tasks(client_id);
create index if not exists idx_tasks_assignee on public.tasks(assignee_id);
create index if not exists idx_tasks_status    on public.tasks(status);
create index if not exists idx_activity_task   on public.task_activity(task_id);

-- ── updated_at maintenance ──────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists trg_tasks_touch on public.tasks;
create trigger trg_tasks_touch before update on public.tasks
  for each row execute function public.touch_updated_at();

-- ── Portal helper: the client_id the current auth user belongs to ───────────
create or replace function public.current_client_id(uid uuid)
returns uuid language sql stable security definer set search_path = public as $$
  select client_id from public.client_users where user_id = uid limit 1;
$$;

-- ── Row-Level Security ──────────────────────────────────────────────────────
alter table public.clients      enable row level security;
alter table public.client_users enable row level security;
alter table public.tasks        enable row level security;
alter table public.task_activity enable row level security;

-- clients: internal (clients.view) sees all; a client user sees their own client
drop policy if exists clients_select on public.clients;
create policy clients_select on public.clients for select using (
  public.has_permission(auth.uid(), 'clients.view')
  or id = public.current_client_id(auth.uid())
);
drop policy if exists clients_insert on public.clients;
create policy clients_insert on public.clients for insert
  with check (public.has_permission(auth.uid(), 'clients.create'));
drop policy if exists clients_update on public.clients;
create policy clients_update on public.clients for update
  using (public.has_permission(auth.uid(), 'clients.edit'))
  with check (public.has_permission(auth.uid(), 'clients.edit'));
drop policy if exists clients_delete on public.clients;
create policy clients_delete on public.clients for delete
  using (public.has_permission(auth.uid(), 'clients.delete'));

-- client_users: internal manages; a client user sees their own company's users
drop policy if exists client_users_select on public.client_users;
create policy client_users_select on public.client_users for select using (
  public.has_permission(auth.uid(), 'clients.view')
  or client_id = public.current_client_id(auth.uid())
);
drop policy if exists client_users_write on public.client_users;
create policy client_users_write on public.client_users for all
  using (public.has_permission(auth.uid(), 'clients.edit'))
  with check (public.has_permission(auth.uid(), 'clients.edit'));

-- tasks: internal (tasks.view) sees all; a client user sees their client's tasks
drop policy if exists tasks_select on public.tasks;
create policy tasks_select on public.tasks for select using (
  public.has_permission(auth.uid(), 'tasks.view')
  or client_id = public.current_client_id(auth.uid())
);
drop policy if exists tasks_insert on public.tasks;
create policy tasks_insert on public.tasks for insert
  with check (public.has_permission(auth.uid(), 'tasks.create'));
drop policy if exists tasks_update on public.tasks;
create policy tasks_update on public.tasks for update
  using (public.has_permission(auth.uid(), 'tasks.edit'))
  with check (public.has_permission(auth.uid(), 'tasks.edit'));
drop policy if exists tasks_delete on public.tasks;
create policy tasks_delete on public.tasks for delete
  using (public.has_permission(auth.uid(), 'tasks.delete'));

-- task_activity: internal reads (tasks.view); inserts by task editors
drop policy if exists task_activity_select on public.task_activity;
create policy task_activity_select on public.task_activity for select using (
  public.has_permission(auth.uid(), 'tasks.view')
  or exists (
    select 1 from public.tasks t
    where t.id = task_activity.task_id and t.client_id = public.current_client_id(auth.uid())
  )
);
drop policy if exists task_activity_insert on public.task_activity;
create policy task_activity_insert on public.task_activity for insert
  with check (public.has_permission(auth.uid(), 'tasks.edit'));
