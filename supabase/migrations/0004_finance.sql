-- ============================================================================
-- FLOW Dashboard — Migration 0004: Finance — invoices, payments & expenses (Phase 4)
-- ============================================================================

do $$ begin
  create type invoice_status as enum ('draft', 'sent', 'paid', 'void');
exception when duplicate_object then null; end $$;

-- Sequential, human-friendly invoice numbers: FLOW-0001, FLOW-0002, …
create sequence if not exists public.invoice_number_seq start 1;

-- ── Tables ──────────────────────────────────────────────────────────────────
create table if not exists public.invoices (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.clients(id) on delete cascade,
  number      text not null unique default ('FLOW-' || lpad(nextval('public.invoice_number_seq')::text, 4, '0')),
  status      invoice_status not null default 'draft',
  currency    text not null default 'EGP',
  issue_date  date not null default current_date,
  due_date    date,
  notes       text,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.invoice_items (
  id          uuid primary key default gen_random_uuid(),
  invoice_id  uuid not null references public.invoices(id) on delete cascade,
  description text not null,
  quantity    numeric(12, 2) not null default 1,
  unit_price  numeric(12, 2) not null default 0,
  position    int not null default 0
);

create table if not exists public.payments (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.clients(id) on delete cascade,
  invoice_id  uuid references public.invoices(id) on delete set null,
  amount      numeric(12, 2) not null,
  method      text,                              -- cash | bank | instapay | …
  paid_at     date not null default current_date,
  notes       text,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- Agency costs, used to derive profit. Clients never see these.
create table if not exists public.expenses (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid references public.clients(id) on delete set null,
  category    text,
  description text,
  amount      numeric(12, 2) not null,
  incurred_on date not null default current_date,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_invoice_items_invoice on public.invoice_items(invoice_id);
create index if not exists idx_invoices_client on public.invoices(client_id);
create index if not exists idx_payments_client on public.payments(client_id);
create index if not exists idx_payments_invoice on public.payments(invoice_id);

drop trigger if exists trg_invoices_touch on public.invoices;
create trigger trg_invoices_touch before update on public.invoices
  for each row execute function public.touch_updated_at();

-- ── Row-Level Security ──────────────────────────────────────────────────────
alter table public.invoices      enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payments      enable row level security;
alter table public.expenses      enable row level security;

-- invoices: internal (finance.view) sees all; a client sees their own
drop policy if exists invoices_select on public.invoices;
create policy invoices_select on public.invoices for select using (
  public.has_permission(auth.uid(), 'finance.view')
  or client_id = public.current_client_id(auth.uid())
);
drop policy if exists invoices_insert on public.invoices;
create policy invoices_insert on public.invoices for insert
  with check (public.has_permission(auth.uid(), 'invoices.issue'));
drop policy if exists invoices_update on public.invoices;
create policy invoices_update on public.invoices for update
  using (public.has_permission(auth.uid(), 'finance.manage') or public.has_permission(auth.uid(), 'invoices.issue'))
  with check (public.has_permission(auth.uid(), 'finance.manage') or public.has_permission(auth.uid(), 'invoices.issue'));
drop policy if exists invoices_delete on public.invoices;
create policy invoices_delete on public.invoices for delete
  using (public.has_permission(auth.uid(), 'finance.manage'));

-- invoice_items: visible with the parent invoice; writable by finance managers
drop policy if exists invoice_items_select on public.invoice_items;
create policy invoice_items_select on public.invoice_items for select using (
  exists (
    select 1 from public.invoices i
    where i.id = invoice_items.invoice_id
      and (public.has_permission(auth.uid(), 'finance.view') or i.client_id = public.current_client_id(auth.uid()))
  )
);
drop policy if exists invoice_items_write on public.invoice_items;
create policy invoice_items_write on public.invoice_items for all
  using (public.has_permission(auth.uid(), 'finance.manage') or public.has_permission(auth.uid(), 'invoices.issue'))
  with check (public.has_permission(auth.uid(), 'finance.manage') or public.has_permission(auth.uid(), 'invoices.issue'));

-- payments: internal (finance.view) sees all; a client sees their own
drop policy if exists payments_select on public.payments;
create policy payments_select on public.payments for select using (
  public.has_permission(auth.uid(), 'finance.view')
  or client_id = public.current_client_id(auth.uid())
);
drop policy if exists payments_write on public.payments;
create policy payments_write on public.payments for all
  using (public.has_permission(auth.uid(), 'finance.manage'))
  with check (public.has_permission(auth.uid(), 'finance.manage'));

-- expenses: internal only
drop policy if exists expenses_select on public.expenses;
create policy expenses_select on public.expenses for select
  using (public.has_permission(auth.uid(), 'finance.view'));
drop policy if exists expenses_write on public.expenses;
create policy expenses_write on public.expenses for all
  using (public.has_permission(auth.uid(), 'finance.manage'))
  with check (public.has_permission(auth.uid(), 'finance.manage'));
