-- ============================================================================
-- FLOW Dashboard — Migration 0014: Requirement templates & document collection
-- ============================================================================
-- The CEO defines reusable checklists:
--   · client_document      what the CLIENT must hand over (national ID, commercial
--                          register, tax card ... — differs per platform/action);
--   · content_deliverable  what CONTENT must hand in before an account is pushed
--                          (photos, listing sheet ...).
-- Applying a template to a client COPIES its items into client_requirements, so
-- editing a template later never rewrites what a client was already asked for.
--
-- Each requirement is one file slot with a status:
--   pending → submitted → approved | rejected (→ submitted again) ; or waived.
-- Gates (replacing the no-op functions from 0013):
--   · paperwork → onboarded needs every required client_document approved/waived;
--   · reaching `pushing` needs every required content_deliverable for that
--     platform submitted/approved/waived.
-- Files live in the private `client-files` bucket and are only ever reached
-- through signed URLs the server hands out after an RLS-checked read.

-- ── Templates ───────────────────────────────────────────────────────────────
create table if not exists public.requirement_templates (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  kind       text not null check (kind in ('client_document', 'content_deliverable')),
  platform   text check (platform in ('amazon', 'noon', 'jumia')),   -- optional: applies to one marketplace
  created_at timestamptz not null default now()
);

create table if not exists public.requirement_template_items (
  id          uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.requirement_templates(id) on delete cascade,
  label_en    text not null,
  label_ar    text,
  hint        text,
  required    boolean not null default true,
  position    int not null default 0
);
create index if not exists idx_req_template_items on public.requirement_template_items(template_id, position);

-- ── Per-client requirements ─────────────────────────────────────────────────
create table if not exists public.client_requirements (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references public.clients(id) on delete cascade,
  platform_id  uuid references public.client_platforms(id) on delete cascade,  -- set for deliverables
  kind         text not null check (kind in ('client_document', 'content_deliverable')),
  label_en     text not null,
  label_ar     text,
  hint         text,
  required     boolean not null default true,
  position     int not null default 0,
  status       text not null default 'pending'
                 check (status in ('pending', 'submitted', 'approved', 'rejected', 'waived')),
  file_path    text,
  file_name    text,
  note         text,                                   -- reviewer's reason when rejecting
  uploaded_by  uuid references auth.users(id) on delete set null,
  submitted_at timestamptz,
  reviewed_by  uuid references public.profiles(id) on delete set null,
  reviewed_at  timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists idx_client_requirements_client   on public.client_requirements(client_id);
create index if not exists idx_client_requirements_platform on public.client_requirements(platform_id);

drop trigger if exists trg_client_requirements_touch on public.client_requirements;
create trigger trg_client_requirements_touch before update on public.client_requirements
  for each row execute function public.touch_updated_at();

-- ── Row-level security ──────────────────────────────────────────────────────
alter table public.requirement_templates      enable row level security;
alter table public.requirement_template_items enable row level security;
alter table public.client_requirements        enable row level security;

drop policy if exists req_templates_select on public.requirement_templates;
create policy req_templates_select on public.requirement_templates for select
  using (public.is_internal(auth.uid()));
drop policy if exists req_templates_write on public.requirement_templates;
create policy req_templates_write on public.requirement_templates for all
  using (public.has_permission(auth.uid(), 'requirements.manage'))
  with check (public.has_permission(auth.uid(), 'requirements.manage'));

drop policy if exists req_template_items_select on public.requirement_template_items;
create policy req_template_items_select on public.requirement_template_items for select
  using (public.is_internal(auth.uid()));
drop policy if exists req_template_items_write on public.requirement_template_items;
create policy req_template_items_write on public.requirement_template_items for all
  using (public.has_permission(auth.uid(), 'requirements.manage'))
  with check (public.has_permission(auth.uid(), 'requirements.manage'));

-- Documents: the CEO side (clients.view) and the client itself.
-- Deliverables: whoever can see the client by stage (content at `listing`, AMs...).
-- Portal users never see deliverables — they're our work product until pushed.
drop policy if exists client_requirements_select on public.client_requirements;
create policy client_requirements_select on public.client_requirements for select using (
  (kind = 'client_document'
     and (public.has_permission(auth.uid(), 'clients.view')
          or client_id = public.current_client_id(auth.uid())))
  or (kind = 'content_deliverable' and public.can_see_client(auth.uid(), client_id))
);

drop policy if exists client_requirements_manage on public.client_requirements;
create policy client_requirements_manage on public.client_requirements for all
  using (public.has_permission(auth.uid(), 'requirements.manage'))
  with check (public.has_permission(auth.uid(), 'requirements.manage'));

-- Content submits deliverables; the client submits its own documents.
-- The trigger below limits WHAT they may change (a file + 'submitted' only).
drop policy if exists client_requirements_content_update on public.client_requirements;
create policy client_requirements_content_update on public.client_requirements for update
  using (kind = 'content_deliverable'
         and public.has_permission(auth.uid(), 'content.workspace')
         and public.can_see_client(auth.uid(), client_id))
  with check (kind = 'content_deliverable' and public.has_permission(auth.uid(), 'content.workspace'));

drop policy if exists client_requirements_client_update on public.client_requirements;
create policy client_requirements_client_update on public.client_requirements for update
  using (kind = 'client_document' and client_id = public.current_client_id(auth.uid()))
  with check (kind = 'client_document' and client_id = public.current_client_id(auth.uid()));

-- ── Enforcement ─────────────────────────────────────────────────────────────
create or replace function public.enforce_requirement_rules()
returns trigger language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then return new; end if;

  -- Reviewers (requirements.manage): stamp who accepted / rejected / waived.
  if public.has_permission(uid, 'requirements.manage') then
    if new.status is distinct from old.status and new.status in ('approved', 'rejected', 'waived') then
      new.reviewed_by := uid;
      new.reviewed_at := now();
    end if;
    if new.status = 'submitted' and new.file_path is distinct from old.file_path then
      new.uploaded_by := uid;
      new.submitted_at := now();
    end if;
    return new;
  end if;

  -- Everyone else: attach a file, nothing more.
  if new.client_id <> old.client_id or new.kind <> old.kind
     or new.platform_id is distinct from old.platform_id
     or new.label_en <> old.label_en or new.label_ar is distinct from old.label_ar
     or new.hint is distinct from old.hint or new.required <> old.required
     or new.position <> old.position or new.note is distinct from old.note
     or new.reviewed_by is distinct from old.reviewed_by then
    raise exception 'You can only upload a file for this requirement.';
  end if;
  if old.status in ('approved', 'waived') then
    raise exception 'This requirement was already accepted.';
  end if;
  if new.status <> 'submitted' or new.file_path is null then
    raise exception 'Upload a file to submit this requirement.';
  end if;
  new.uploaded_by := uid;
  new.submitted_at := now();
  return new;
end $$;

drop trigger if exists trg_client_requirements_rules on public.client_requirements;
create trigger trg_client_requirements_rules before update on public.client_requirements
  for each row execute function public.enforce_requirement_rules();

-- ── Gates (replace the no-op versions from 0013) ────────────────────────────
-- 0015 extends client_stage_gate with "contract accepted".
create or replace function public.client_stage_gate(cid uuid, to_stage client_stage)
returns text language plpgsql stable security definer set search_path = public as $$
declare missing int;
begin
  if to_stage >= 'onboarded' then
    select count(*) into missing from public.client_requirements r
    where r.client_id = cid and r.kind = 'client_document' and r.required
      and r.status not in ('approved', 'waived');
    if missing > 0 then
      return missing || ' required document(s) still need to be approved before this client can be onboarded.';
    end if;
  end if;
  return null;
end $$;

create or replace function public.platform_stage_gate(pid uuid, to_stage platform_stage)
returns text language plpgsql stable security definer set search_path = public as $$
declare missing int;
begin
  if to_stage >= 'pushing' then
    select count(*) into missing from public.client_requirements r
    where r.platform_id = pid and r.kind = 'content_deliverable' and r.required
      and r.status not in ('submitted', 'approved', 'waived');
    if missing > 0 then
      return missing || ' required deliverable(s) are still missing, so this account can''t be pushed yet.';
    end if;
  end if;
  return null;
end $$;

-- ── Private bucket (reached only through server-issued signed URLs) ─────────
insert into storage.buckets (id, name, public, file_size_limit)
values ('client-files', 'client-files', false, 20971520)   -- 20 MB per file
on conflict (id) do nothing;
