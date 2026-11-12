-- ============================================================================
-- FLOW Dashboard — Migration 0016: Sales workspace
-- ============================================================================
-- Sales (the sales director) works leads, not clients, so this adds what a
-- lead needs to be worked properly:
--   · lead_activities  a contact log — every call / WhatsApp / meeting, with the
--                      method, what happened and the status it left the lead in;
--   · leads.deal       what the lead is interested in: marketplaces, contract
--                      length and package PHASES ("3 months Basic, then 3
--                      Premium" — shape in lib/deals.ts). Copied to the client
--                      on conversion;
--   · leads.won_at     when it was won, to count wins per calendar month.
--
-- Monthly cap: the CEO sets `monthly_client_cap` (app_settings, 0013). Once that
-- many leads have been won this month (Cairo time), further `won` changes are
-- refused by the database for everyone except the CEO (pipeline.manage). Sales
-- can keep adding and following up leads; only closing is blocked.

alter table public.leads
  add column if not exists deal   jsonb,
  add column if not exists won_at timestamptz;

-- Wins that predate this migration: best guess is their last update.
update public.leads set won_at = updated_at where status = 'won' and won_at is null;

create index if not exists idx_leads_won_at on public.leads(won_at) where won_at is not null;

-- ── Contact log ─────────────────────────────────────────────────────────────
create table if not exists public.lead_activities (
  id           uuid primary key default gen_random_uuid(),
  lead_id      uuid not null references public.leads(id) on delete cascade,
  method       text not null check (method in ('call', 'whatsapp', 'sms', 'email', 'meeting', 'other')),
  note         text,
  status_after lead_status,                      -- the lead's status once this contact was logged
  created_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now()
);
create index if not exists idx_lead_activities_lead on public.lead_activities(lead_id, created_at desc);

alter table public.lead_activities enable row level security;

drop policy if exists lead_activities_select on public.lead_activities;
create policy lead_activities_select on public.lead_activities for select
  using (public.has_permission(auth.uid(), 'leads.view'));
drop policy if exists lead_activities_insert on public.lead_activities;
create policy lead_activities_insert on public.lead_activities for insert
  with check (public.has_permission(auth.uid(), 'leads.edit') and created_by = auth.uid());
drop policy if exists lead_activities_delete on public.lead_activities;
create policy lead_activities_delete on public.lead_activities for delete
  using (public.has_permission(auth.uid(), 'leads.delete'));

-- ── Monthly cap ─────────────────────────────────────────────────────────────
create or replace function public.leads_won_this_month()
returns int language sql stable security definer set search_path = public as $$
  select count(*)::int from public.leads
  where status = 'won'
    and (won_at at time zone 'Africa/Cairo') >= date_trunc('month', now() at time zone 'Africa/Cairo');
$$;

create or replace function public.enforce_lead_cap()
returns trigger language plpgsql security definer set search_path = public as $$
declare cap int; won int; becoming_won boolean := false;
begin
  -- `old` doesn't exist on INSERT, so branch instead of relying on short-circuiting.
  if tg_op = 'INSERT' then
    becoming_won := new.status = 'won';
  else
    becoming_won := new.status = 'won' and old.status <> 'won';
    if old.status = 'won' and new.status <> 'won' then new.won_at := null; end if;
  end if;

  if becoming_won then
    new.won_at := now();
    -- The CEO and the service role are exempt; everyone else is held to the cap.
    if auth.uid() is not null and not public.has_permission(auth.uid(), 'pipeline.manage') then
      select (value #>> '{}')::int into cap from public.app_settings where key = 'monthly_client_cap';
      won := public.leads_won_this_month();
      if cap is not null and won >= cap then
        raise exception 'Monthly client limit reached (% of %). Ask the CEO to raise it.', won, cap;
      end if;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_leads_cap on public.leads;
create trigger trg_leads_cap before insert or update of status on public.leads
  for each row execute function public.enforce_lead_cap();
