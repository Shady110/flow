-- ============================================================================
-- FLOW Dashboard — Migration 0020: Auth module
-- ============================================================================
-- Two dashboards (team and client), no client name in any address:
--
--   app_metadata.kind     every auth user is tagged 'staff' or 'client' so the
--                         proxy can tell them apart from the session token alone
--                         (fixes the redirect loop when someone opens the wrong
--                         dashboard). Backfilled here; new users are tagged when
--                         they are created.
--   auth_events           sign-in activity log (success, failure, password
--                         changes and resets). Written by the server only.
--   client_users          one login = one client: unique email and user id.
--   clients.slug          no longer an address, so it may be empty.
--   handle_new_user       a client login must never become the first co-founder.

-- ── Tag existing accounts ───────────────────────────────────────────────────
update auth.users u
   set raw_app_meta_data = coalesce(u.raw_app_meta_data, '{}'::jsonb) || '{"kind":"staff"}'::jsonb
 where exists (select 1 from public.profiles p where p.id = u.id);

update auth.users u
   set raw_app_meta_data = coalesce(u.raw_app_meta_data, '{}'::jsonb) || '{"kind":"client"}'::jsonb
 where exists (select 1 from public.client_users c where c.user_id = u.id);

-- ── One login, one client ───────────────────────────────────────────────────
create unique index if not exists uq_client_users_email on public.client_users (lower(email));
create unique index if not exists uq_client_users_user  on public.client_users (user_id) where user_id is not null;

-- ── The slug stays as an internal label only ────────────────────────────────
alter table public.clients alter column slug drop not null;

-- ── A client login never becomes the founder ────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public, auth as $$
declare
  has_any boolean;
  invite  public.invitations%rowtype;
  target_role uuid;
  is_client boolean := coalesce(new.raw_user_meta_data->>'client_user', '') = 'true'
                    or coalesce(new.raw_app_meta_data->>'kind', '') = 'client';
begin
  if is_client then return new; end if;

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

-- ── Sign-in activity log ────────────────────────────────────────────────────
create table if not exists public.auth_events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete set null,
  email      text,
  kind       text check (kind in ('staff', 'client')),
  event      text not null check (event in (
               'sign_in', 'sign_in_failed', 'wrong_address', 'sign_out',
               'password_changed', 'reset_requested', 'reset_by_admin')),
  actor_id   uuid references auth.users(id) on delete set null,   -- who did it, when an admin did
  host       text,
  ip         text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index if not exists idx_auth_events_user  on public.auth_events (user_id, created_at desc);
create index if not exists idx_auth_events_email on public.auth_events (lower(email), created_at desc);

alter table public.auth_events enable row level security;
drop policy if exists auth_events_select on public.auth_events;
create policy auth_events_select on public.auth_events for select using (
  user_id = auth.uid() or public.has_permission(auth.uid(), 'users.manage')
);
-- No insert/update/delete policies: only the server (service role) writes.
