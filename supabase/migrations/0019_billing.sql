-- ============================================================================
-- FLOW Dashboard — Migration 0019: Online payments & automatic monthly billing
-- ============================================================================
-- Clients pay invoices inside the portal through a hosted gateway (Kashier) and
-- monthly invoices are created from each contract's package phases.
--
--   invoices.billing_period + source   one auto invoice per client per month,
--                                      enforced by a unique index so the daily
--                                      job can never double-bill;
--   payments.gateway / gateway_ref     the gateway's transaction id, unique, so
--                                      a webhook that arrives twice (or races
--                                      the browser redirect) records ONE payment;
--   checkout_sessions                  one row per attempt to pay online;
--   client_billing                     saved-card state for auto-renew. The card
--                                      TOKEN is never readable by any browser
--                                      user: table access is revoked and only
--                                      the harmless columns are granted back.
-- Everything here is written by the server (service role); the policies only
-- grant reads.

-- ── Invoices & payments ─────────────────────────────────────────────────────
alter table public.invoices
  add column if not exists billing_period date,                          -- first day of the month billed
  add column if not exists source text not null default 'manual'
    check (source in ('manual', 'auto'));

create unique index if not exists uq_invoices_client_period
  on public.invoices (client_id, billing_period) where billing_period is not null;

alter table public.payments
  add column if not exists gateway     text,                              -- 'kashier' | 'mock'
  add column if not exists gateway_ref text;                              -- the gateway's transaction id

create unique index if not exists uq_payments_gateway_ref
  on public.payments (gateway, gateway_ref) where gateway_ref is not null;

-- ── Checkout attempts ───────────────────────────────────────────────────────
create table if not exists public.checkout_sessions (
  id                  uuid primary key default gen_random_uuid(),
  invoice_id          uuid not null references public.invoices(id) on delete cascade,
  client_id           uuid not null references public.clients(id) on delete cascade,
  provider            text not null,
  provider_session_id text,
  merchant_order_id   text not null unique,                               -- OUR reference, sent to the gateway
  amount              numeric(12, 2) not null check (amount > 0),
  currency            text not null default 'EGP',
  status              text not null default 'created'
                        check (status in ('created', 'paid', 'failed', 'expired')),
  save_card           boolean not null default false,
  session_url         text,
  failure_reason      text,
  created_at          timestamptz not null default now(),
  paid_at             timestamptz
);
create index if not exists idx_checkout_sessions_invoice on public.checkout_sessions(invoice_id);
create index if not exists idx_checkout_sessions_client  on public.checkout_sessions(client_id, created_at desc);

alter table public.checkout_sessions enable row level security;
drop policy if exists checkout_sessions_select on public.checkout_sessions;
create policy checkout_sessions_select on public.checkout_sessions for select using (
  public.has_permission(auth.uid(), 'finance.view')
  or client_id = public.current_client_id(auth.uid())
);

-- ── Saved card / auto-renew ─────────────────────────────────────────────────
create table if not exists public.client_billing (
  client_id      uuid primary key references public.clients(id) on delete cascade,
  auto_renew     boolean not null default false,
  provider       text,
  card_token     text,                                                    -- SECRET: server only
  agreement_id   text,                                                    -- SECRET: server only
  card_brand     text,
  card_last4     text,
  status         text not null default 'none'
                   check (status in ('none', 'active', 'failed', 'canceled')),
  failure_count  int not null default 0,
  last_charge_at timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

drop trigger if exists trg_client_billing_touch on public.client_billing;
create trigger trg_client_billing_touch before update on public.client_billing
  for each row execute function public.touch_updated_at();

alter table public.client_billing enable row level security;
drop policy if exists client_billing_select on public.client_billing;
create policy client_billing_select on public.client_billing for select using (
  public.has_permission(auth.uid(), 'finance.view')
  or client_id = public.current_client_id(auth.uid())
);

-- No browser user may ever read the token or agreement id: revoke the whole
-- table, then grant back only the safe columns. The service role is unaffected.
revoke all on public.client_billing from anon, authenticated;
grant select (client_id, auto_renew, provider, card_brand, card_last4, status, failure_count, last_charge_at, updated_at)
  on public.client_billing to authenticated;
