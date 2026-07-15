-- ── Editable landing-page content ───────────────────────────────────────────
-- Lets the internal team edit key marketing copy (hero, services, pricing, FAQ,
-- contact) from the dashboard without a code change. One row per section; the
-- structured content for each language lives in a JSONB blob matching the shape
-- the marketing components already consume. Missing rows fall back to the
-- in-code defaults in data/landing-content.ts.

create table if not exists public.landing_content (
  id uuid primary key default gen_random_uuid(),
  section text not null unique
    check (section in ('hero', 'services', 'pricing', 'faq', 'contact')),
  content_en jsonb not null default '{}'::jsonb,
  content_ar jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

-- New permission for editing landing content.
insert into public.permissions (key, label, category) values
  ('content.manage', 'Manage landing content', 'Administration')
on conflict (key) do update set label = excluded.label, category = excluded.category;

-- co-founder already holds every permission via has_permission(); ensure the
-- explicit grant row exists too so RLS/UI stays consistent.
insert into public.role_permissions (role_id, permission_key)
select r.id, 'content.manage' from public.roles r
where r.name = 'co-founder'
on conflict do nothing;

-- ── RLS: public read, permissioned write ────────────────────────────────────
alter table public.landing_content enable row level security;

-- Anyone (including the anon marketing site) can read published content.
create policy landing_content_select on public.landing_content
  for select using (true);

-- Only users with content.manage may create/update/delete.
create policy landing_content_write on public.landing_content
  for all
  using (public.has_permission(auth.uid(), 'content.manage'))
  with check (public.has_permission(auth.uid(), 'content.manage'));

-- Keep updated_at fresh (touch_updated_at() defined in 0001).
create trigger landing_content_touch
  before update on public.landing_content
  for each row execute function public.touch_updated_at();

-- Seed rows exist so the editor always has something to edit; content is
-- seeded empty and the app falls back to data/landing-content.ts defaults
-- until an editor saves real values. Insert one placeholder row per section.
insert into public.landing_content (section) values
  ('hero'), ('services'), ('pricing'), ('faq'), ('contact')
on conflict (section) do nothing;
