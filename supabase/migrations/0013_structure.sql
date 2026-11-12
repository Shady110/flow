-- ============================================================================
-- FLOW Dashboard — Migration 0013: Company structure & staged pipeline
-- ============================================================================
-- The company now has three sections (CEO, Content, Sales) and every client
-- moves through one staged flow:
--
--   clients.stage             group_created → paperwork → onboarded
--   client_platforms.stage    platform_creation → listing → pushing → managing
--
-- Platform stages are tracked PER client × platform (Amazon can be "managing"
-- while Noon is still "listing"), and `stages` lists which of the four apply to
-- that account — a client who already has an Amazon seller account skips
-- platform_creation, a management-only client skips listing.
--
-- The rules live in triggers, not in app code, so no API call can skip them:
--   · the CEO (pipeline.manage) moves anything;
--   · Content moves listing → next, AM moves pushing → next (own accounts);
--   · moving forward into a stage re-checks its gate (requirements, contract).
-- The gate functions return NULL here ("no gate"); 0014 / 0015 replace them.
--
-- Visibility follows the stage: the content director can see a client only
-- while one of its platforms is at `listing`; an account manager only while it
-- is at pushing/managing and assigned to them. See can_see_client().
--
-- NB: updates to client_platforms by non-CEO users must not use `.select()` /
-- RETURNING — the row may legitimately leave their view as it advances.

-- ── Enums ───────────────────────────────────────────────────────────────────
do $$ begin
  create type client_stage as enum ('group_created', 'paperwork', 'onboarded');
exception when duplicate_object then null; end $$;

-- Declared in flow order: enum comparison (s > current) gives "the next stage".
do $$ begin
  create type platform_stage as enum ('platform_creation', 'listing', 'pushing', 'managing');
exception when duplicate_object then null; end $$;

do $$ begin
  create type account_status as enum ('not_created', 'active', 'at_risk', 'suspended', 'deactivated');
exception when duplicate_object then null; end $$;

-- ── Permissions ─────────────────────────────────────────────────────────────
insert into public.permissions (key, label, category) values
  ('ops.overview',         'See the company overview',            'Operations'),
  ('pipeline.manage',      'Manage the client pipeline',          'Operations'),
  ('settings.company',     'Edit company settings',               'Operations'),
  ('requirements.manage',  'Manage requirement templates',        'Operations'),
  ('contracts.manage',     'Create and send contracts',           'Operations'),
  ('sales.workspace',      'Use the sales workspace',             'Sales'),
  ('content.workspace',    'Use the content workspace',           'Content'),
  ('accounts.workspace',   'Manage platform accounts',            'Accounts'),
  ('accounts.view_all',    'See every platform account',          'Accounts'),
  ('tickets.manage',       'Handle account tickets',              'Accounts')
on conflict (key) do update set label = excluded.label, category = excluded.category;

-- Co-founders hold every permission implicitly (has_permission, 0003).
insert into public.roles (name, description, is_system) values
  ('content-director', 'Runs content: listing and photography. Also an account manager.', true),
  ('sales-director',   'Runs sales: leads and deals. Also an account manager.',           true)
on conflict (name) do nothing;

insert into public.role_permissions (role_id, permission_key)
select r.id, p.key
from public.roles r
join (values
  ('content-director', 'content.workspace'), ('content-director', 'accounts.workspace'),
  ('content-director', 'tickets.manage'),    ('content-director', 'chat.access'),
  ('content-director', 'products.view'),     ('content-director', 'products.manage'),
  ('content-director', 'automation.run'),    ('content-director', 'social.view'),
  ('content-director', 'social.create'),
  ('sales-director', 'sales.workspace'),     ('sales-director', 'accounts.workspace'),
  ('sales-director', 'tickets.manage'),      ('sales-director', 'chat.access'),
  ('sales-director', 'leads.view'),          ('sales-director', 'leads.create'),
  ('sales-director', 'leads.edit'),          ('sales-director', 'leads.convert')
) as p(role_name, key) on p.role_name = r.name
on conflict do nothing;

-- The existing `admin` role keeps landing on the overview, as before.
insert into public.role_permissions (role_id, permission_key)
select r.id, 'ops.overview' from public.roles r where r.name = 'admin'
on conflict do nothing;

-- ── Company settings (key/value) ────────────────────────────────────────────
create table if not exists public.app_settings (
  key        text primary key,
  value      jsonb not null,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

-- Clients Sales may close per calendar month; enforced on leads in 0016.
insert into public.app_settings (key, value) values ('monthly_client_cap', '10'::jsonb)
on conflict (key) do nothing;

alter table public.app_settings enable row level security;
drop policy if exists app_settings_select on public.app_settings;
create policy app_settings_select on public.app_settings for select
  using (public.is_internal(auth.uid()));
drop policy if exists app_settings_write on public.app_settings;
create policy app_settings_write on public.app_settings for all
  using (public.has_permission(auth.uid(), 'settings.company'))
  with check (public.has_permission(auth.uid(), 'settings.company'));

-- ── Clients: stage, money, deal ─────────────────────────────────────────────
-- Existing clients are already working with us → they start as `onboarded`;
-- new ones start at `group_created`.
alter table public.clients
  add column if not exists stage client_stage not null default 'onboarded',
  add column if not exists budget numeric(12, 2),            -- what the client will spend
  add column if not exists estimated_cost numeric(12, 2),    -- what we expect it to cost us
  add column if not exists target_live_date date,
  add column if not exists deal jsonb;                       -- see lib/deals.ts
alter table public.clients alter column stage set default 'group_created';

-- ── Platform accounts: one row per client × marketplace ─────────────────────
create table if not exists public.client_platforms (
  id                 uuid primary key default gen_random_uuid(),
  client_id          uuid not null references public.clients(id) on delete cascade,
  platform           text not null check (platform in ('amazon', 'noon', 'jumia')),
  stages             platform_stage[] not null
                       default array['platform_creation', 'listing', 'pushing', 'managing']::platform_stage[],
  stage              platform_stage not null default 'platform_creation',
  account_manager_id uuid references public.profiles(id) on delete set null,
  account_status     account_status not null default 'not_created',
  store_name         text,
  seller_id          text,                                   -- filled by the SP-API sync later
  status_note        text,
  checked_at         timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (client_id, platform),
  check (cardinality(stages) > 0),
  check (stage = any (stages))
);

create index if not exists idx_client_platforms_client on public.client_platforms(client_id);
create index if not exists idx_client_platforms_stage  on public.client_platforms(stage);
create index if not exists idx_client_platforms_am     on public.client_platforms(account_manager_id);

drop trigger if exists trg_client_platforms_touch on public.client_platforms;
create trigger trg_client_platforms_touch before update on public.client_platforms
  for each row execute function public.touch_updated_at();

-- ── Stage history ("what has been done for this client") ────────────────────
create table if not exists public.stage_events (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.clients(id) on delete cascade,
  platform_id uuid references public.client_platforms(id) on delete cascade,  -- null = client-level stage
  from_stage  text,
  to_stage    text not null,
  actor_id    uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index if not exists idx_stage_events_client on public.stage_events(client_id, created_at desc);

-- ── Visibility ──────────────────────────────────────────────────────────────
-- Can `uid` see a platform account at this stage / managed by this person?
create or replace function public.platform_visible(uid uuid, st platform_stage, am uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_permission(uid, 'clients.view')
      or (public.has_permission(uid, 'content.workspace') and st = 'listing')
      or (public.has_permission(uid, 'accounts.workspace')
          and st in ('pushing', 'managing')
          and (am = uid or public.has_permission(uid, 'accounts.view_all')));
$$;

create or replace function public.can_see_client(uid uuid, cid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_permission(uid, 'clients.view')
      or exists (
        select 1 from public.client_platforms cp
        where cp.client_id = cid and public.platform_visible(uid, cp.stage, cp.account_manager_id)
      );
$$;

-- Clients: staff who can see the client (by role OR by stage), or the client itself.
drop policy if exists clients_select on public.clients;
create policy clients_select on public.clients for select using (
  public.can_see_client(auth.uid(), id)
  or id = public.current_client_id(auth.uid())
);

alter table public.client_platforms enable row level security;
alter table public.stage_events     enable row level security;

drop policy if exists client_platforms_select on public.client_platforms;
create policy client_platforms_select on public.client_platforms for select using (
  public.platform_visible(auth.uid(), stage, account_manager_id)
  or client_id = public.current_client_id(auth.uid())
);

-- The CEO writes everything.
drop policy if exists client_platforms_ceo on public.client_platforms;
create policy client_platforms_ceo on public.client_platforms for all
  using (public.has_permission(auth.uid(), 'pipeline.manage'))
  with check (public.has_permission(auth.uid(), 'pipeline.manage'));

-- Content / account managers may update accounts they currently own. The
-- trigger below decides WHICH columns and transitions; WITH CHECK is loose on
-- purpose because the new row (e.g. stage = pushing) is no longer "theirs".
drop policy if exists client_platforms_staff_update on public.client_platforms;
create policy client_platforms_staff_update on public.client_platforms for update
  using (
    (public.has_permission(auth.uid(), 'content.workspace') and stage = 'listing')
    or (public.has_permission(auth.uid(), 'accounts.workspace')
        and stage in ('pushing', 'managing') and account_manager_id = auth.uid())
  )
  with check (
    public.has_permission(auth.uid(), 'content.workspace')
    or public.has_permission(auth.uid(), 'accounts.workspace')
  );

drop policy if exists stage_events_select on public.stage_events;
create policy stage_events_select on public.stage_events for select using (
  public.can_see_client(auth.uid(), client_id)
  or client_id = public.current_client_id(auth.uid())
);

-- ── Gates (replaced by 0014 / 0015) ─────────────────────────────────────────
-- Return NULL when the move is fine, otherwise a human-readable reason.
create or replace function public.client_stage_gate(cid uuid, to_stage client_stage)
returns text language sql stable security definer set search_path = public as $$
  select null::text;
$$;

create or replace function public.platform_stage_gate(pid uuid, to_stage platform_stage)
returns text language sql stable security definer set search_path = public as $$
  select null::text;
$$;

-- ── Enforcement: platform stage ─────────────────────────────────────────────
create or replace function public.enforce_platform_rules()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  uid  uuid := auth.uid();
  ceo  boolean;
  nxt  platform_stage;
  gate text;
begin
  -- Service role / SQL editor: no auth user, no restrictions.
  if uid is null then return new; end if;
  ceo := public.has_permission(uid, 'pipeline.manage');

  if not ceo then
    if new.client_id <> old.client_id or new.platform <> old.platform
       or new.stages <> old.stages
       or new.account_manager_id is distinct from old.account_manager_id then
      raise exception 'Only the CEO can change a platform''s setup or account manager.';
    end if;
  end if;

  if new.stage is distinct from old.stage then
    if not ceo then
      select min(s) into nxt from unnest(old.stages) s where s > old.stage;
      if new.stage is distinct from nxt then
        raise exception 'You can only move an account to its next stage.';
      end if;
      if not (
        (old.stage = 'listing' and public.has_permission(uid, 'content.workspace'))
        or (old.stage = 'pushing' and public.has_permission(uid, 'accounts.workspace')
            and old.account_manager_id = uid)
      ) then
        raise exception 'This stage is not yours to move.';
      end if;
    end if;

    -- Gates apply to everyone, CEO included, but only when moving forward.
    if new.stage > old.stage then
      gate := public.platform_stage_gate(old.id, new.stage);
      if gate is not null then raise exception '%', gate; end if;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_client_platforms_rules on public.client_platforms;
create trigger trg_client_platforms_rules before update on public.client_platforms
  for each row execute function public.enforce_platform_rules();

-- ── Enforcement: client stage (CEO only) ────────────────────────────────────
create or replace function public.enforce_client_stage()
returns trigger language plpgsql security definer set search_path = public as $$
declare gate text;
begin
  if auth.uid() is null or new.stage is not distinct from old.stage then return new; end if;
  if not public.has_permission(auth.uid(), 'pipeline.manage') then
    raise exception 'Only the CEO can move a client between onboarding stages.';
  end if;
  if new.stage > old.stage then
    gate := public.client_stage_gate(old.id, new.stage);
    if gate is not null then raise exception '%', gate; end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_clients_stage_rules on public.clients;
create trigger trg_clients_stage_rules before update of stage on public.clients
  for each row execute function public.enforce_client_stage();

-- ── History log ─────────────────────────────────────────────────────────────
create or replace function public.log_stage_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_table_name = 'clients' then
    if tg_op = 'UPDATE' and new.stage is distinct from old.stage then
      insert into public.stage_events (client_id, from_stage, to_stage, actor_id)
      values (new.id, old.stage::text, new.stage::text, auth.uid());
    end if;
  else
    if tg_op = 'INSERT' then
      insert into public.stage_events (client_id, platform_id, from_stage, to_stage, actor_id)
      values (new.client_id, new.id, null, new.stage::text, auth.uid());
    elsif new.stage is distinct from old.stage then
      insert into public.stage_events (client_id, platform_id, from_stage, to_stage, actor_id)
      values (new.client_id, new.id, old.stage::text, new.stage::text, auth.uid());
    end if;
  end if;
  return null;
end $$;

drop trigger if exists trg_clients_stage_log on public.clients;
create trigger trg_clients_stage_log after update of stage on public.clients
  for each row execute function public.log_stage_change();

drop trigger if exists trg_client_platforms_log on public.client_platforms;
create trigger trg_client_platforms_log after insert or update of stage on public.client_platforms
  for each row execute function public.log_stage_change();
