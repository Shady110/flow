-- ============================================================================
-- FLOW Dashboard — Migration 0011: anonymous website visitors
-- ============================================================================
-- One row per consenting browser, so a sales call starts with context:
-- "you configured Growth for 120 products and read pricing three times".
--
-- Deliberately NOT the `leads` table. A cookie yields an anonymous id and
-- behaviour — never a name or a phone number — so these people are not
-- callable. Writing them into `leads` would flood the pipeline board with rows
-- nobody can action, and `leads.name` is NOT NULL anyway. A visitor is promoted
-- by setting `lead_id` at the moment they actually identify themselves through
-- the contact form or the chatbot.
--
-- Nothing is written before the visitor accepts the cookie banner: this is
-- analytics, not strictly-necessary storage, so Egypt's PDPL (Law 151/2018) and
-- GDPR both require consent first.

create table if not exists public.site_visitors (
  id            uuid primary key default gen_random_uuid(),
  visitor_id    uuid not null unique,          -- the flow_vid cookie
  first_seen    timestamptz not null default now(),
  last_seen     timestamptz not null default now(),
  page_views    int not null default 0,
  referrer      text,
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  locale        text,
  user_agent    text,
  -- Append-only trail: {t, type, ...}. A jsonb column rather than an events
  -- table because a marketing site produces a handful of events per visit.
  -- ponytail: split into site_visitor_events if a single row ever gets large.
  activity      jsonb not null default '[]'::jsonb,
  lead_id       uuid references public.leads(id) on delete set null,
  created_at    timestamptz not null default now()
);

create index if not exists idx_site_visitors_last_seen on public.site_visitors(last_seen desc);
create index if not exists idx_site_visitors_lead      on public.site_visitors(lead_id);

-- ── Row-Level Security ──────────────────────────────────────────────────────
-- No policy grants INSERT or UPDATE: /api/track writes with the service-role
-- client, exactly like the public contact form does. Anyone who can see leads
-- can see the journey behind them.
alter table public.site_visitors enable row level security;

drop policy if exists site_visitors_select on public.site_visitors;
create policy site_visitors_select on public.site_visitors for select
  using (public.has_permission(auth.uid(), 'leads.view'));
