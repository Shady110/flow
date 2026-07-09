-- ============================================================================
-- FLOW Dashboard — Migration 0005: AI automation jobs (Phase 5)
-- Listing (Excel → marketplace template) & image (photos → white-bg front/side/back).
-- ============================================================================

-- ── Tables ──────────────────────────────────────────────────────────────────
create table if not exists public.automation_jobs (
  id           uuid primary key default gen_random_uuid(),
  type         text not null check (type in ('listing', 'image')),
  status       text not null default 'draft' check (status in ('draft', 'processing', 'done', 'failed')),
  client_id    uuid references public.clients(id) on delete set null,
  marketplace  text,                              -- listing jobs only
  params       jsonb not null default '{}',       -- column mapping, selected fields, options
  input_path   text,
  output_path  text,                              -- result file in automation-outputs
  total        int not null default 0,
  done_count   int not null default 0,
  failed_count int not null default 0,
  error        text,
  created_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.automation_items (
  id         uuid primary key default gen_random_uuid(),
  job_id     uuid not null references public.automation_jobs(id) on delete cascade,
  status     text not null default 'queued' check (status in ('queued', 'processing', 'done', 'failed')),
  position   int not null default 0,
  input      jsonb not null default '{}',         -- row data / input image paths
  output     jsonb,                                -- generated fields / output image paths
  error      text,
  created_at timestamptz not null default now()
);

create index if not exists idx_automation_items_job on public.automation_items(job_id);
create index if not exists idx_automation_items_status on public.automation_items(job_id, status);

drop trigger if exists trg_automation_jobs_touch on public.automation_jobs;
create trigger trg_automation_jobs_touch before update on public.automation_jobs
  for each row execute function public.touch_updated_at();

-- ── Row-Level Security (internal automation.run users only) ─────────────────
alter table public.automation_jobs  enable row level security;
alter table public.automation_items enable row level security;

drop policy if exists automation_jobs_rw on public.automation_jobs;
create policy automation_jobs_rw on public.automation_jobs for all
  using (public.has_permission(auth.uid(), 'automation.run'))
  with check (public.has_permission(auth.uid(), 'automation.run'));

drop policy if exists automation_items_rw on public.automation_items;
create policy automation_items_rw on public.automation_items for all
  using (public.has_permission(auth.uid(), 'automation.run'))
  with check (public.has_permission(auth.uid(), 'automation.run'));

-- ── Private storage buckets (accessed server-side via signed URLs) ──────────
insert into storage.buckets (id, name, public)
values ('automation-inputs', 'automation-inputs', false),
       ('automation-outputs', 'automation-outputs', false)
on conflict (id) do nothing;
