-- ============================================================================
-- FLOW Dashboard — Migration 0009: Leads pipeline
-- ============================================================================
-- Leads are pre-customers: contact details, area and field, moving through a
-- pipeline. They deliberately live outside `clients` because a client needs a
-- unique subdomain (`clients.slug`) and grants portal access — neither of which
-- should exist for an enquiry nobody has called back yet. Converting a lead
-- creates the client and links it via converted_client_id.
-- Leads are internal-only: no policy grants a portal user any access.

do $$ begin
  create type lead_status as enum ('new', 'contacted', 'qualified', 'proposal', 'won', 'lost');
exception when duplicate_object then null; end $$;

create table if not exists public.leads (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  company             text,
  email               text,
  phone               text,
  address             text,
  area                text,                       -- geography (e.g. Nasr City, Alexandria)
  field               text,                       -- industry / product category
  status              lead_status not null default 'new',
  source              text,                       -- 'website' | 'manual' | 'referral' | ...
  plan_interest       text,                       -- which pricing plan they asked about
  notes               text,
  owner_id            uuid references public.profiles(id) on delete set null,
  converted_client_id uuid references public.clients(id) on delete set null,
  created_by          uuid references public.profiles(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_leads_owner  on public.leads(owner_id);

-- touch_updated_at() is defined in 0002.
drop trigger if exists trg_leads_touch on public.leads;
create trigger trg_leads_touch before update on public.leads
  for each row execute function public.touch_updated_at();

-- ── Permissions ─────────────────────────────────────────────────────────────
insert into public.permissions (key, label, category) values
  ('leads.view',    'View leads',            'Leads'),
  ('leads.create',  'Create leads',          'Leads'),
  ('leads.edit',    'Edit leads',            'Leads'),
  ('leads.delete',  'Delete leads',          'Leads'),
  ('leads.convert', 'Convert lead to client', 'Leads')
on conflict (key) do update set label = excluded.label, category = excluded.category;

insert into public.role_permissions (role_id, permission_key)
select r.id, p.key
from public.roles r
cross join (values ('leads.view'), ('leads.create'), ('leads.edit'), ('leads.delete'), ('leads.convert')) as p(key)
where r.name in ('co-founder', 'admin')
on conflict do nothing;

-- ── Row-Level Security ──────────────────────────────────────────────────────
alter table public.leads enable row level security;

drop policy if exists leads_select on public.leads;
create policy leads_select on public.leads for select
  using (public.has_permission(auth.uid(), 'leads.view'));

drop policy if exists leads_insert on public.leads;
create policy leads_insert on public.leads for insert
  with check (public.has_permission(auth.uid(), 'leads.create'));

drop policy if exists leads_update on public.leads;
create policy leads_update on public.leads for update
  using (public.has_permission(auth.uid(), 'leads.edit'))
  with check (public.has_permission(auth.uid(), 'leads.edit'));

drop policy if exists leads_delete on public.leads;
create policy leads_delete on public.leads for delete
  using (public.has_permission(auth.uid(), 'leads.delete'));
