-- ============================================================================
-- FLOW Dashboard — Migration 0012: Social content planner
-- ============================================================================
-- The Sep–Dec plan lives in data/social/ as typed data. This is where it lands
-- so it can be edited, designed against, scheduled and attributed.
--
-- Deliberately NOT the `tasks` table. A task is work assigned to a person and
-- closed when done; a post is a dated artefact with two language variants, a
-- rendered image, a destination platform and an external id after publishing.
-- Forcing posts through tasks would mean a status enum that means something
-- different per row, and no place to put the caption.
--
-- `social_accounts` exists now, ahead of the publishing work in Phase 2, purely
-- so token expiry has a home. A publish that fails silently at 7am because a
-- token lapsed is the failure mode worth designing against first.
--
-- Ad spend is not modelled yet — there is no ad budget, so there is nothing to
-- record. `social_campaigns` carries the campaign identity that spend would
-- hang off, so adding it later is a column, not a reshape.

-- ── Enums ───────────────────────────────────────────────────────────────────
do $$ begin
  create type social_platform as enum ('instagram', 'facebook', 'linkedin');
exception when duplicate_object then null; end $$;

do $$ begin
  -- `needs_design` is a real state, not a nicety: copy is routinely approved
  -- while the image is still outstanding, and without it those posts sit in
  -- `draft` and look untouched.
  create type social_post_status as enum (
    'idea', 'draft', 'needs_design', 'approved', 'scheduled', 'published', 'failed'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type social_pillar as enum ('proof', 'teach', 'process', 'offer', 'pulse');
exception when duplicate_object then null; end $$;

do $$ begin
  create type social_format as enum ('reel', 'carousel', 'static', 'story', 'text', 'article');
exception when duplicate_object then null; end $$;

-- ── Campaigns ───────────────────────────────────────────────────────────────
create table if not exists public.social_campaigns (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,               -- 'white-friday'
  name        text not null,
  starts_at   date not null,
  ends_at     date not null,
  goal        text,
  colour      text,                               -- brand token name for the chip
  -- White Friday's window is set by Noon/Amazon.eg and announced late. This
  -- flags a date we invented so nobody schedules against it by accident.
  dates_provisional boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Accounts ────────────────────────────────────────────────────────────────
create table if not exists public.social_accounts (
  id            uuid primary key default gen_random_uuid(),
  platform      social_platform not null,
  external_id   text,                             -- IG user id / FB page id
  display_name  text not null,
  -- The token itself is never stored here. This names the env var or secret
  -- holding it, so the table can be read by anyone with social.view without
  -- leaking a credential that can post as the company.
  token_ref     text,
  token_expires_at timestamptz,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (platform, external_id)
);

-- ── Posts ───────────────────────────────────────────────────────────────────
create table if not exists public.social_posts (
  id            uuid primary key default gen_random_uuid(),
  campaign_id   uuid references public.social_campaigns(id) on delete set null,
  platform      social_platform not null,
  pillar        social_pillar not null,
  format        social_format not null,
  status        social_post_status not null default 'idea',

  -- The idea in one line. Always present, including on brief-only rows, so the
  -- calendar is readable before anything is written.
  hook          text not null,
  caption_en    text,
  caption_ar    text,
  hashtags      text[] not null default '{}',
  design_brief  text,
  template      text,                             -- render template key

  -- Scheduling. `scheduled_at` is the intended moment; `published_at` is when
  -- it actually went out. Keeping both means a late publish is visible rather
  -- than rewritten.
  scheduled_at  timestamptz,
  published_at  timestamptz,

  link_url      text,
  utm_campaign  text,
  utm_content   text,                             -- per-post, so attribution is per-post
  media_path    text,                             -- storage path of the rendered image
  external_post_id text,                          -- id returned by the platform
  error         text,                             -- last publish failure, cleared on success

  created_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_social_posts_scheduled on public.social_posts(scheduled_at);
create index if not exists idx_social_posts_status    on public.social_posts(status);
create index if not exists idx_social_posts_campaign  on public.social_posts(campaign_id);
-- The publish worker asks one question every minute: what is due? Without this
-- that is a sequential scan over every post ever planned.
create index if not exists idx_social_posts_due
  on public.social_posts(scheduled_at)
  where status = 'scheduled';

-- touch_updated_at() is defined in 0002.
drop trigger if exists trg_social_campaigns_touch on public.social_campaigns;
create trigger trg_social_campaigns_touch before update on public.social_campaigns
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_social_accounts_touch on public.social_accounts;
create trigger trg_social_accounts_touch before update on public.social_accounts
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_social_posts_touch on public.social_posts;
create trigger trg_social_posts_touch before update on public.social_posts
  for each row execute function public.touch_updated_at();

-- ── AI usage ────────────────────────────────────────────────────────────────
-- Caption and image generation bills the same way automation does, so it goes
-- in the same ledger rather than a second one. Two ledgers would mean the
-- existing spend cards silently show half the real AI cost.
alter table public.ai_usage
  add column if not exists social_post_id uuid references public.social_posts(id) on delete set null;

create index if not exists idx_ai_usage_social on public.ai_usage(social_post_id);

drop policy if exists ai_usage_rw on public.ai_usage;
create policy ai_usage_rw on public.ai_usage for all
  using (
    public.has_permission(auth.uid(), 'automation.run')
    or public.has_permission(auth.uid(), 'social.create')
  )
  with check (
    public.has_permission(auth.uid(), 'automation.run')
    or public.has_permission(auth.uid(), 'social.create')
  );

-- ── Storage ─────────────────────────────────────────────────────────────────
-- Public, unlike the automation buckets. Instagram's publishing API fetches the
-- image from a URL it must be able to reach unauthenticated, so a signed URL
-- does not work here. Nothing sensitive lives in this bucket — these are
-- images intended for a public feed.
insert into storage.buckets (id, name, public)
values ('social-media', 'social-media', true)
on conflict (id) do nothing;

-- ── Attribution ─────────────────────────────────────────────────────────────
-- site_visitors already captures utm_source/medium/campaign. Per-post
-- attribution needs one more: utm_campaign identifies the campaign, so using it
-- per post would collapse every post in White Friday into a single bucket.
-- utm_content is the standard parameter for distinguishing creatives within a
-- campaign, which is exactly what a post is.
alter table public.site_visitors
  add column if not exists utm_content text;

create index if not exists idx_site_visitors_utm_content
  on public.site_visitors(utm_content)
  where utm_content is not null;

-- ── Permissions ─────────────────────────────────────────────────────────────
-- `social.publish` is separate from `social.create` on purpose: drafting a post
-- and putting it in front of the company's audience are different levels of
-- trust, and the second one is not undoable.
insert into public.permissions (key, label, category) values
  ('social.view',    'View social calendar', 'Social'),
  ('social.create',  'Create & edit posts',  'Social'),
  ('social.publish', 'Publish & schedule',   'Social')
on conflict (key) do update set label = excluded.label, category = excluded.category;

insert into public.role_permissions (role_id, permission_key)
select r.id, p.key
from public.roles r
cross join (values ('social.view'), ('social.create'), ('social.publish')) as p(key)
where r.name in ('co-founder', 'admin')
on conflict do nothing;

-- ── Row-Level Security ──────────────────────────────────────────────────────
alter table public.social_campaigns enable row level security;
alter table public.social_accounts  enable row level security;
alter table public.social_posts     enable row level security;

drop policy if exists social_posts_select on public.social_posts;
create policy social_posts_select on public.social_posts for select
  using (public.has_permission(auth.uid(), 'social.view'));

drop policy if exists social_posts_insert on public.social_posts;
create policy social_posts_insert on public.social_posts for insert
  with check (public.has_permission(auth.uid(), 'social.create'));

drop policy if exists social_posts_update on public.social_posts;
create policy social_posts_update on public.social_posts for update
  using (public.has_permission(auth.uid(), 'social.create'))
  with check (public.has_permission(auth.uid(), 'social.create'));

drop policy if exists social_posts_delete on public.social_posts;
create policy social_posts_delete on public.social_posts for delete
  using (public.has_permission(auth.uid(), 'social.create'));

drop policy if exists social_campaigns_select on public.social_campaigns;
create policy social_campaigns_select on public.social_campaigns for select
  using (public.has_permission(auth.uid(), 'social.view'));

drop policy if exists social_campaigns_write on public.social_campaigns;
create policy social_campaigns_write on public.social_campaigns for all
  using (public.has_permission(auth.uid(), 'social.create'))
  with check (public.has_permission(auth.uid(), 'social.create'));

-- Accounts are read by anyone who can see the calendar (so token warnings are
-- visible) but only writable by someone trusted to publish.
drop policy if exists social_accounts_select on public.social_accounts;
create policy social_accounts_select on public.social_accounts for select
  using (public.has_permission(auth.uid(), 'social.view'));

drop policy if exists social_accounts_write on public.social_accounts;
create policy social_accounts_write on public.social_accounts for all
  using (public.has_permission(auth.uid(), 'social.publish'))
  with check (public.has_permission(auth.uid(), 'social.publish'));
