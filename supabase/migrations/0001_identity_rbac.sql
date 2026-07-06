-- ============================================================================
-- FLOW Dashboard — Migration 0001: Identity & dynamic RBAC (Phase 1)
-- Roles, permissions, role_permissions, profiles, invitations + RLS.
-- ============================================================================

create extension if not exists pgcrypto;

-- ── Enums ───────────────────────────────────────────────────────────────────
do $$ begin
  create type profile_status as enum ('invited', 'active', 'disabled');
exception when duplicate_object then null; end $$;

-- ── Tables ──────────────────────────────────────────────────────────────────
create table if not exists public.roles (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  description text,
  is_system   boolean not null default false,   -- system roles cannot be deleted
  created_at  timestamptz not null default now()
);

create table if not exists public.permissions (
  key         text primary key,                 -- e.g. 'clients.create'
  label       text not null,
  category    text not null                      -- grouping for the UI
);

create table if not exists public.role_permissions (
  role_id        uuid not null references public.roles(id) on delete cascade,
  permission_key text not null references public.permissions(key) on delete cascade,
  primary key (role_id, permission_key)
);

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role_id     uuid references public.roles(id) on delete set null,
  full_name   text,
  avatar_url  text,
  status      profile_status not null default 'active',
  created_at  timestamptz not null default now()
);

create table if not exists public.invitations (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  role_id     uuid references public.roles(id) on delete set null,
  token       text not null unique,
  invited_by  uuid references public.profiles(id) on delete set null,
  accepted_at timestamptz,
  expires_at  timestamptz not null default (now() + interval '7 days'),
  created_at  timestamptz not null default now()
);

-- ── Helper functions (SECURITY DEFINER to bypass RLS during checks) ─────────
create or replace function public.is_internal(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = uid and p.status = 'active'
  );
$$;

create or replace function public.has_permission(uid uuid, perm text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.profiles p
    join public.role_permissions rp on rp.role_id = p.role_id
    where p.id = uid and p.status = 'active' and rp.permission_key = perm
  );
$$;

-- ── Seed permission catalog ─────────────────────────────────────────────────
insert into public.permissions (key, label, category) values
  ('clients.view',    'View clients',              'Clients'),
  ('clients.create',  'Create clients',            'Clients'),
  ('clients.edit',    'Edit clients',              'Clients'),
  ('clients.delete',  'Delete clients',            'Clients'),
  ('tasks.view',      'View tasks',                'Tasks'),
  ('tasks.create',    'Create tasks',              'Tasks'),
  ('tasks.edit',      'Edit tasks',                'Tasks'),
  ('tasks.delete',    'Delete tasks',              'Tasks'),
  ('tasks.assign',    'Assign tasks',              'Tasks'),
  ('team.view',       'View team analytics',       'Team'),
  ('finance.view',    'View finances',             'Finance'),
  ('finance.manage',  'Manage payments',           'Finance'),
  ('invoices.issue',  'Issue invoices',            'Finance'),
  ('chat.access',     'Access client chat',        'Chat'),
  ('automation.run',  'Run automations',           'Automation'),
  ('roles.manage',    'Manage roles & permissions','Administration'),
  ('users.invite',    'Invite admins',             'Administration'),
  ('users.manage',    'Manage admin accounts',     'Administration'),
  ('settings.manage', 'Manage settings',           'Administration')
on conflict (key) do update set label = excluded.label, category = excluded.category;

-- ── Seed system roles ───────────────────────────────────────────────────────
insert into public.roles (name, description, is_system) values
  ('co-founder', 'Full access. Can manage roles and admin accounts.', true),
  ('admin',      'Standard team member. Customizable permissions.',   true)
on conflict (name) do nothing;

-- co-founder gets every permission
insert into public.role_permissions (role_id, permission_key)
select r.id, p.key from public.roles r cross join public.permissions p
where r.name = 'co-founder'
on conflict do nothing;

-- admin gets a sensible default subset
insert into public.role_permissions (role_id, permission_key)
select r.id, p.key from public.roles r
join public.permissions p on p.key in (
  'clients.view','clients.create','clients.edit',
  'tasks.view','tasks.create','tasks.edit','tasks.assign',
  'team.view','finance.view','chat.access','automation.run'
)
where r.name = 'admin'
on conflict do nothing;

-- ── Row-Level Security ──────────────────────────────────────────────────────
alter table public.roles            enable row level security;
alter table public.permissions      enable row level security;
alter table public.role_permissions enable row level security;
alter table public.profiles         enable row level security;
alter table public.invitations      enable row level security;

-- roles: any internal user reads; roles.manage writes
drop policy if exists roles_select on public.roles;
create policy roles_select on public.roles for select using (public.is_internal(auth.uid()));
drop policy if exists roles_write on public.roles;
create policy roles_write on public.roles for all
  using (public.has_permission(auth.uid(), 'roles.manage'))
  with check (public.has_permission(auth.uid(), 'roles.manage'));

-- permissions: internal reads only (seeded, no writes)
drop policy if exists permissions_select on public.permissions;
create policy permissions_select on public.permissions for select using (public.is_internal(auth.uid()));

-- role_permissions: internal reads; roles.manage writes
drop policy if exists role_permissions_select on public.role_permissions;
create policy role_permissions_select on public.role_permissions for select using (public.is_internal(auth.uid()));
drop policy if exists role_permissions_write on public.role_permissions;
create policy role_permissions_write on public.role_permissions for all
  using (public.has_permission(auth.uid(), 'roles.manage'))
  with check (public.has_permission(auth.uid(), 'roles.manage'));

-- profiles: a user always sees their own; internal users see all; users.manage writes
drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self on public.profiles for select
  using (id = auth.uid() or public.is_internal(auth.uid()));
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists profiles_manage on public.profiles;
create policy profiles_manage on public.profiles for all
  using (public.has_permission(auth.uid(), 'users.manage'))
  with check (public.has_permission(auth.uid(), 'users.manage'));

-- invitations: users.invite manages
drop policy if exists invitations_manage on public.invitations;
create policy invitations_manage on public.invitations for all
  using (public.has_permission(auth.uid(), 'users.invite'))
  with check (public.has_permission(auth.uid(), 'users.invite'));

-- ── New-user handling ───────────────────────────────────────────────────────
-- Fires when a Supabase auth user is created. Grants an INTERNAL profile only:
--   1. to the very first user ever (bootstrap co-founder), or
--   2. to a user whose email matches a pending admin invitation.
-- Client-portal users get NO internal profile (they stay tenant-scoped).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public, auth as $$
declare
  has_any boolean;
  invite  public.invitations%rowtype;
  target_role uuid;
begin
  select exists(select 1 from public.profiles) into has_any;

  if not has_any then
    select id into target_role from public.roles where name = 'co-founder';
    insert into public.profiles (id, role_id, full_name, status)
    values (new.id, target_role, coalesce(new.raw_user_meta_data->>'full_name', new.email), 'active');
    return new;
  end if;

  select * into invite from public.invitations
  where lower(email) = lower(new.email) and accepted_at is null and expires_at > now()
  order by created_at desc limit 1;

  if found then
    insert into public.profiles (id, role_id, full_name, status)
    values (new.id, invite.role_id, coalesce(new.raw_user_meta_data->>'full_name', new.email), 'active');
    update public.invitations set accepted_at = now() where id = invite.id;
  end if;

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
