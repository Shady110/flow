-- ============================================================================
-- FLOW Dashboard — Migration 0023: Roles, three departments, client assignment
-- ============================================================================
-- The new access model:
--   · Three departments: Sales, Content, Account Management. The CEO is in none.
--   · Roles: ceo, and a director + employee per department. A person can hold
--     several roles (profile_roles) and gets the union of their permissions.
--   · The CEO sees insights and runs the company; it holds no "action" keys.
--   · Account Management employees see only the clients assigned to them
--     (client_assignments); the Account director sees and assigns all.
--   · The co-founder bypass is gone: every role has explicit permissions.
-- profiles.role_id / department_key / level stay (rollback) but are no longer
-- the source of truth: roles + profile_roles are.
-- Safe to run twice.

-- ── Departments: only three ─────────────────────────────────────────────────
update public.profiles set department_key = null where department_key in ('management', 'finance');
delete from public.departments where key in ('management', 'finance');
update public.departments set name_en = 'Account Management', name_ar = 'إدارة الحسابات' where key = 'accounts';

-- ── Roles carry a department and a rank ─────────────────────────────────────
alter table public.roles
  add column if not exists department_key text references public.departments(key) on update cascade,
  add column if not exists rank text check (rank in ('director', 'employee'));

update public.roles set name = 'ceo', description = 'Runs the company: insights across every department, team, roles and settings. Does not do the departments'' day-to-day work.'
 where name = 'co-founder';

insert into public.roles (name, description, is_system, department_key, rank) values
  ('sales-director',    'Runs Sales: leads, deals, contracts and sales insights.',                      true, 'sales',    'director'),
  ('sales-employee',    'Works Sales: leads, deals and contracts.',                                     true, 'sales',    'employee'),
  ('content-director',  'Runs Content: listings, photography, social and content insights.',            true, 'content',  'director'),
  ('content-employee',  'Works Content: listings, photography and social.',                             true, 'content',  'employee'),
  ('accounts-director', 'Runs Account Management: all clients, assigns clients, tickets and insights.', true, 'accounts', 'director'),
  ('accounts-employee', 'Account manager: sees and works only the clients assigned to them.',           true, 'accounts', 'employee')
on conflict (name) do update
  set description = excluded.description, is_system = true,
      department_key = excluded.department_key, rank = excluded.rank;

-- ── New permission keys ─────────────────────────────────────────────────────
insert into public.permissions (key, label, category) values
  ('insights.sales',    'See Sales insights',              'Insights'),
  ('insights.content',  'See Content insights',            'Insights'),
  ('insights.accounts', 'See Account Management insights', 'Insights'),
  ('accounts.assign',   'Assign clients to account managers', 'Accounts'),
  ('tickets.view',      'View account tickets (read only)', 'Accounts')
on conflict (key) do update set label = excluded.label, category = excluded.category;
update public.permissions set label = 'See the company overview (CEO home)' where key = 'ops.overview';

-- ── Several roles per person ────────────────────────────────────────────────
create table if not exists public.profile_roles (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role_id    uuid not null references public.roles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, role_id)
);
create index if not exists idx_profile_roles_role on public.profile_roles(role_id);

insert into public.profile_roles (profile_id, role_id)
select id, role_id from public.profiles where role_id is not null
on conflict do nothing;

-- A profile created with a role_id (invitations, first sign-up) gets the row too.
create or replace function public.sync_profile_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role_id is not null then
    insert into public.profile_roles (profile_id, role_id) values (new.id, new.role_id) on conflict do nothing;
  end if;
  return new;
end $$;
drop trigger if exists trg_profiles_sync_role on public.profiles;
create trigger trg_profiles_sync_role after insert or update of role_id on public.profiles
  for each row execute function public.sync_profile_role();

alter table public.profile_roles enable row level security;
drop policy if exists profile_roles_select on public.profile_roles;
create policy profile_roles_select on public.profile_roles for select using (public.is_internal(auth.uid()));
drop policy if exists profile_roles_manage on public.profile_roles;
create policy profile_roles_manage on public.profile_roles for all
  using (public.has_permission(auth.uid(), 'users.manage'))
  with check (public.has_permission(auth.uid(), 'users.manage'));

-- ── has_permission: the union over all of a person's roles, no bypass ───────
create or replace function public.has_permission(uid uuid, perm text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.profiles p
    join public.profile_roles pr on pr.profile_id = p.id
    join public.role_permissions rp on rp.role_id = pr.role_id
    where p.id = uid and p.status = 'active' and rp.permission_key = perm
  );
$$;

-- ── Permission sets of the seven system roles (replaced on every run) ───────
drop table if exists pg_temp._grants;
create temporary table _grants (role_name text, key text);
insert into _grants (role_name, key) values
  -- CEO: insights + running the company. No action keys (leads.edit, tasks.*, content/accounts workspace, ...).
  ('ceo','ops.overview'),('ceo','insights.sales'),('ceo','insights.content'),('ceo','insights.accounts'),
  ('ceo','clients.view'),('ceo','leads.view'),('ceo','finance.view'),('ceo','tasks.view'),('ceo','products.view'),('ceo','social.view'),
  ('ceo','accounts.view_all'),('ceo','tickets.view'),('ceo','team.view'),
  ('ceo','users.invite'),('ceo','users.manage'),('ceo','roles.manage'),('ceo','settings.company'),('ceo','settings.manage'),('ceo','content.manage'),
  -- Sales
  ('sales-director','sales.workspace'),('sales-director','insights.sales'),('sales-director','team.view'),
  ('sales-director','leads.view'),('sales-director','leads.create'),('sales-director','leads.edit'),('sales-director','leads.delete'),('sales-director','leads.convert'),
  ('sales-director','clients.view'),('sales-director','clients.create'),('sales-director','clients.edit'),
  ('sales-director','contracts.manage'),('sales-director','pipeline.manage'),('sales-director','chat.access'),
  ('sales-director','tasks.view'),('sales-director','tasks.create'),('sales-director','tasks.edit'),('sales-director','tasks.assign'),
  ('sales-employee','sales.workspace'),
  ('sales-employee','leads.view'),('sales-employee','leads.create'),('sales-employee','leads.edit'),('sales-employee','leads.convert'),
  ('sales-employee','clients.view'),('sales-employee','chat.access'),
  ('sales-employee','tasks.view'),('sales-employee','tasks.create'),('sales-employee','tasks.edit'),
  -- Content
  ('content-director','content.workspace'),('content-director','insights.content'),('content-director','team.view'),
  ('content-director','products.view'),('content-director','products.manage'),('content-director','automation.run'),
  ('content-director','social.view'),('content-director','social.create'),('content-director','social.publish'),
  ('content-director','chat.access'),
  ('content-director','tasks.view'),('content-director','tasks.create'),('content-director','tasks.edit'),('content-director','tasks.assign'),
  ('content-employee','content.workspace'),
  ('content-employee','products.view'),('content-employee','products.manage'),('content-employee','automation.run'),
  ('content-employee','social.view'),('content-employee','social.create'),('content-employee','chat.access'),
  ('content-employee','tasks.view'),('content-employee','tasks.create'),('content-employee','tasks.edit'),
  -- Account Management (the director also owns manual invoicing)
  ('accounts-director','accounts.workspace'),('accounts-director','accounts.view_all'),('accounts-director','accounts.assign'),
  ('accounts-director','insights.accounts'),('accounts-director','team.view'),
  ('accounts-director','tickets.manage'),('accounts-director','tickets.view'),
  ('accounts-director','clients.view'),('accounts-director','clients.edit'),
  ('accounts-director','pipeline.manage'),('accounts-director','requirements.manage'),
  ('accounts-director','finance.view'),('accounts-director','finance.manage'),('accounts-director','invoices.issue'),
  ('accounts-director','products.view'),('accounts-director','chat.access'),
  ('accounts-director','tasks.view'),('accounts-director','tasks.create'),('accounts-director','tasks.edit'),('accounts-director','tasks.assign'),
  ('accounts-employee','accounts.workspace'),('accounts-employee','tickets.manage'),('accounts-employee','tickets.view'),
  ('accounts-employee','products.view'),('accounts-employee','chat.access'),
  ('accounts-employee','tasks.view'),('accounts-employee','tasks.create'),('accounts-employee','tasks.edit');

delete from public.role_permissions rp using public.roles r
 where rp.role_id = r.id and r.name in (select distinct role_name from _grants);
insert into public.role_permissions (role_id, permission_key)
select r.id, g.key from _grants g join public.roles r on r.name = g.role_name
on conflict do nothing;
drop table if exists pg_temp._grants;

-- ── Client assignment (per client, all of its marketplaces) ─────────────────
create table if not exists public.client_assignments (
  client_id  uuid not null references public.clients(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (client_id, profile_id)
);
create index if not exists idx_client_assignments_profile on public.client_assignments(profile_id);

-- Carry over who managed each platform account until now.
insert into public.client_assignments (client_id, profile_id)
select distinct client_id, account_manager_id from public.client_platforms where account_manager_id is not null
on conflict do nothing;

alter table public.client_assignments enable row level security;
drop policy if exists client_assignments_select on public.client_assignments;
create policy client_assignments_select on public.client_assignments for select using (public.is_internal(auth.uid()));
drop policy if exists client_assignments_write on public.client_assignments;
create policy client_assignments_write on public.client_assignments for all
  using (public.has_permission(auth.uid(), 'accounts.assign'))
  with check (public.has_permission(auth.uid(), 'accounts.assign'));

create or replace function public.is_assigned(uid uuid, cid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.client_assignments where profile_id = uid and client_id = cid);
$$;

-- ── Visibility now follows assignments, not the platform's account manager ──
-- (the third argument is the client id; it used to be the account manager).
drop policy if exists client_platforms_select on public.client_platforms;
drop function if exists public.platform_visible(uuid, platform_stage, uuid);
create or replace function public.platform_visible(uid uuid, st platform_stage, cid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_permission(uid, 'clients.view')
      or (public.has_permission(uid, 'content.workspace') and st = 'listing')
      or (public.has_permission(uid, 'accounts.workspace')
          and st in ('pushing', 'managing')
          and (public.has_permission(uid, 'accounts.view_all') or public.is_assigned(uid, cid)));
$$;

create or replace function public.can_see_client(uid uuid, cid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_permission(uid, 'clients.view')
      or public.is_assigned(uid, cid)
      or exists (
        select 1 from public.client_platforms cp
        where cp.client_id = cid and public.platform_visible(uid, cp.stage, cp.client_id)
      );
$$;

drop policy if exists client_platforms_select on public.client_platforms;
create policy client_platforms_select on public.client_platforms for select using (
  public.platform_visible(auth.uid(), stage, client_id)
  or client_id = public.current_client_id(auth.uid())
);

-- Platform setup and any stage: pipeline.manage (Sales and Account directors).
drop policy if exists client_platforms_staff_update on public.client_platforms;
create policy client_platforms_staff_update on public.client_platforms for update
  using (
    (public.has_permission(auth.uid(), 'content.workspace') and stage = 'listing')
    or (public.has_permission(auth.uid(), 'accounts.workspace')
        and stage in ('pushing', 'managing') and public.is_assigned(auth.uid(), client_id))
  )
  with check (
    public.has_permission(auth.uid(), 'content.workspace')
    or public.has_permission(auth.uid(), 'accounts.workspace')
  );

create or replace function public.enforce_platform_rules()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  uid  uuid := auth.uid();
  ceo  boolean;   -- "moves anything": pipeline.manage (the directors now)
  nxt  platform_stage;
  gate text;
begin
  if uid is null then return new; end if;
  ceo := public.has_permission(uid, 'pipeline.manage');

  if not ceo then
    if new.client_id <> old.client_id or new.platform <> old.platform or new.stages <> old.stages then
      raise exception 'Only a director can change a platform''s setup.';
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
            and public.is_assigned(uid, old.client_id))
      ) then
        raise exception 'This stage is not yours to move.';
      end if;
    end if;

    if new.stage > old.stage then
      gate := public.platform_stage_gate(old.id, new.stage);
      if gate is not null then raise exception '%', gate; end if;
    end if;
  end if;
  return new;
end $$;

-- ── Tickets: work needs tickets.manage, read-only needs tickets.view ────────
create or replace function public.ticket_scope(uid uuid, pid uuid, assignee uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_permission(uid, 'clients.view')
      or public.has_permission(uid, 'accounts.view_all')
      or assignee = uid
      or exists (
        select 1 from public.client_platforms cp
        where cp.id = pid and public.is_assigned(uid, cp.client_id)
          and public.has_permission(uid, 'accounts.workspace')
      );
$$;

create or replace function public.can_see_ticket(uid uuid, pid uuid, assignee uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_permission(uid, 'tickets.manage') and public.ticket_scope(uid, pid, assignee);
$$;

create or replace function public.can_view_ticket(uid uuid, pid uuid, assignee uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select (public.has_permission(uid, 'tickets.manage') or public.has_permission(uid, 'tickets.view'))
         and public.ticket_scope(uid, pid, assignee);
$$;

drop policy if exists tickets_select on public.tickets;
create policy tickets_select on public.tickets for select using (
  public.can_view_ticket(auth.uid(), platform_id, assignee_id)
  or client_id = public.current_client_id(auth.uid())
);

-- A new ticket goes to the first person assigned to the client.
create or replace function public.enforce_ticket_rules()
returns trigger language plpgsql security definer set search_path = public as $$
declare plat public.client_platforms%rowtype;
begin
  if tg_op = 'INSERT' then
    select * into plat from public.client_platforms where id = new.platform_id;
    if not found or plat.client_id <> new.client_id then
      raise exception 'That platform account doesn''t belong to this client.';
    end if;
    if auth.uid() is not null and public.current_client_id(auth.uid()) is not null
       and plat.stage <> 'managing' then
      raise exception 'Tickets open once your account is live on the platform.';
    end if;
    if new.assignee_id is null then
      select profile_id into new.assignee_id from public.client_assignments
       where client_id = new.client_id order by created_at limit 1;
    end if;
  end if;

  if new.status in ('resolved', 'closed') then
    new.resolved_at := coalesce(new.resolved_at, now());
  else
    new.resolved_at := null;
  end if;
  new.updated_at := now();
  return new;
end $$;

-- ── Tasks: only those of clients you can see, or that are yours ─────────────
drop policy if exists tasks_select on public.tasks;
create policy tasks_select on public.tasks for select using (
  (public.has_permission(auth.uid(), 'tasks.view')
     and (client_id is null
          or public.can_see_client(auth.uid(), client_id)
          or exists (select 1 from public.task_assignees ta where ta.task_id = tasks.id and ta.profile_id = auth.uid())))
  or client_id = public.current_client_id(auth.uid())
);

-- ── First sign-up becomes the CEO ───────────────────────────────────────────
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
    select id into target_role from public.roles where name = 'ceo';
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

-- ── Existing people: department and level now come from roles ───────────────
-- Anyone on the legacy "admin" role keeps its permissions; edit it under
-- Settings → Roles, or move them to a department role on the Team page.
