-- ── Per-user language preference ────────────────────────────────────────────
-- Stores each user's chosen UI language so it follows them across devices.
-- The public marketing site relies on the NEXT_LOCALE cookie; logged-in
-- dashboard/portal users additionally persist their choice here.

alter table public.profiles
  add column if not exists locale text not null default 'en'
    check (locale in ('en', 'ar'));

alter table public.client_users
  add column if not exists locale text not null default 'en'
    check (locale in ('en', 'ar'));
