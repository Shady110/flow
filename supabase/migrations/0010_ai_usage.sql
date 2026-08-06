-- ============================================================================
-- FLOW Dashboard — Migration 0010: AI usage ledger
-- ============================================================================
-- One row per Gemini API call made by an automation, with what it cost.
--
-- Deliberately NOT the `expenses` table: expenses has no currency column, so
-- anything written there is treated as EGP and folded straight into `profit`.
-- AI spend is billed in USD and needs its own home.
--
-- fx_rate is stored per row so a job's EGP cost is frozen at the rate that
-- applied when it ran — historical costs must not drift when the rate moves.
-- EGP is derived (cost_usd * fx_rate), never stored, so it cannot desync.

create table if not exists public.ai_usage (
  id            uuid primary key default gen_random_uuid(),
  job_id        uuid references public.automation_jobs(id) on delete cascade,
  item_id       uuid references public.automation_items(id) on delete set null,
  model         text not null,                  -- e.g. gemini-2.5-flash-image
  images        int  not null default 0,        -- generated images (billed per image)
  input_tokens  int  not null default 0,
  output_tokens int  not null default 0,
  cost_usd      numeric(12, 6) not null default 0,
  fx_rate       numeric(12, 4) not null,        -- USD -> EGP at write time
  created_at    timestamptz not null default now()
);

create index if not exists idx_ai_usage_job     on public.ai_usage(job_id);
create index if not exists idx_ai_usage_created on public.ai_usage(created_at desc);

-- ── Row-Level Security (internal automation users only) ─────────────────────
alter table public.ai_usage enable row level security;

drop policy if exists ai_usage_rw on public.ai_usage;
create policy ai_usage_rw on public.ai_usage for all
  using (public.has_permission(auth.uid(), 'automation.run'))
  with check (public.has_permission(auth.uid(), 'automation.run'));

-- ── Per-job rollup ──────────────────────────────────────────────────────────
-- security_invoker = on is required: without it the view runs as its owner and
-- silently bypasses the RLS policy above.
create or replace view public.ai_usage_by_job
  with (security_invoker = on) as
  select
    job_id,
    count(*)                     as calls,
    sum(images)                  as images,
    sum(cost_usd)                as cost_usd,
    sum(cost_usd * fx_rate)      as cost_egp
  from public.ai_usage
  where job_id is not null
  group by job_id;
