-- ============================================================================
-- FLOW Dashboard — Migration 0015: Contracts (create → send → client accepts)
-- ============================================================================
-- The CEO writes contract templates with {{placeholders}}, generates a contract
-- per client (text rendered from the client's deal, still editable), and sends
-- it. Sending FREEZES the text and stores its SHA-256; the client then reads it
-- in the portal and accepts by typing their name and ticking "I agree".
-- Acceptance is written by the server with the service role (so the IP and
-- user agent can't be forged from the browser) — clients get read access only.
--
-- A contract can also be marked accepted OFFLINE (signed on paper / WhatsApp);
-- that is recorded as such, with who did it.
--
-- Gate: moving a client from `paperwork` to `onboarded` now needs, besides the
-- approved documents (0014), at least one ACCEPTED contract and no contract
-- still waiting for the client's signature.

create table if not exists public.contract_templates (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  locale     text not null default 'en' check (locale in ('en', 'ar')),
  body       text not null,                  -- plain text with {{placeholders}}; blank line = new paragraph
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contracts (
  id               uuid primary key default gen_random_uuid(),
  client_id        uuid not null references public.clients(id) on delete cascade,
  template_id      uuid references public.contract_templates(id) on delete set null,
  title            text not null,
  locale           text not null default 'en' check (locale in ('en', 'ar')),
  body             text not null,            -- final rendered text; frozen once sent
  body_sha256      text,                     -- set when sent
  terms            jsonb,                    -- the deal this contract states (lib/deals.ts)
  start_date       date,
  status           text not null default 'draft'
                     check (status in ('draft', 'sent', 'accepted', 'void')),
  sent_at          timestamptz,
  accepted_at      timestamptz,
  accepted_name    text,
  accepted_ip      text,
  accepted_ua      text,
  accepted_by      uuid references public.client_users(id) on delete set null,
  accepted_offline boolean not null default false,
  created_by       uuid references public.profiles(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists idx_contracts_client on public.contracts(client_id, created_at desc);

drop trigger if exists trg_contract_templates_touch on public.contract_templates;
create trigger trg_contract_templates_touch before update on public.contract_templates
  for each row execute function public.touch_updated_at();
drop trigger if exists trg_contracts_touch on public.contracts;
create trigger trg_contracts_touch before update on public.contracts
  for each row execute function public.touch_updated_at();

-- A sent or accepted contract's text never changes (that is what was agreed).
create or replace function public.freeze_contract()
returns trigger language plpgsql as $$
begin
  if old.status in ('sent', 'accepted')
     and (new.body is distinct from old.body or new.terms is distinct from old.terms
          or new.client_id <> old.client_id) then
    raise exception 'A sent contract can''t be edited. Void it and create a new one.';
  end if;
  return new;
end $$;

drop trigger if exists trg_contracts_freeze on public.contracts;
create trigger trg_contracts_freeze before update on public.contracts
  for each row execute function public.freeze_contract();

-- ── Row-level security ──────────────────────────────────────────────────────
alter table public.contract_templates enable row level security;
alter table public.contracts          enable row level security;

drop policy if exists contract_templates_select on public.contract_templates;
create policy contract_templates_select on public.contract_templates for select
  using (public.is_internal(auth.uid()));
drop policy if exists contract_templates_write on public.contract_templates;
create policy contract_templates_write on public.contract_templates for all
  using (public.has_permission(auth.uid(), 'contracts.manage'))
  with check (public.has_permission(auth.uid(), 'contracts.manage'));

-- Clients see their own contract only once it has been sent (never drafts).
drop policy if exists contracts_select on public.contracts;
create policy contracts_select on public.contracts for select using (
  public.has_permission(auth.uid(), 'contracts.manage')
  or (client_id = public.current_client_id(auth.uid()) and status in ('sent', 'accepted'))
);
drop policy if exists contracts_write on public.contracts;
create policy contracts_write on public.contracts for all
  using (public.has_permission(auth.uid(), 'contracts.manage'))
  with check (public.has_permission(auth.uid(), 'contracts.manage'));

-- ── Gate: onboarding needs documents (0014) AND an accepted contract ────────
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

    if exists (select 1 from public.contracts c where c.client_id = cid and c.status = 'sent') then
      return 'A contract is still waiting for the client to accept it.';
    end if;
    if not exists (select 1 from public.contracts c where c.client_id = cid and c.status = 'accepted') then
      return 'No contract has been accepted yet. Send one from Contracts (or mark a signed copy as accepted).';
    end if;
  end if;
  return null;
end $$;
