-- One-person company: every active internal profile holds every permission.
-- (App-level permissions are granted in lib/auth/session.ts; this makes RLS agree.)
create or replace function public.has_permission(uid uuid, perm text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = uid and p.status = 'active');
$$;
