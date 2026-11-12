-- ============================================================================
-- FLOW Dashboard — Migration 0021: Departments and levels
-- ============================================================================
-- Every team member belongs to a department (which decides the workspace they
-- land in: Sales -> leads, Content -> content queue, ...) and has a level inside
-- it (member / lead / head). Roles still decide what each person may DO; the
-- department decides where they START and who they see on the Team page.

create table if not exists public.departments (
  key       text primary key,
  name_en   text not null,
  name_ar   text not null,
  home_path text not null,
  sort      int  not null default 0
);

insert into public.departments (key, name_en, name_ar, home_path, sort) values
  ('management', 'Management', 'الإدارة',   '/',         0),
  ('sales',      'Sales',      'المبيعات',  '/leads',    1),
  ('content',    'Content',    'المحتوى',   '/content',  2),
  ('accounts',   'Accounts',   'الحسابات',  '/accounts', 3),
  ('finance',    'Finance',    'المالية',   '/finance',  4)
on conflict (key) do nothing;

alter table public.departments enable row level security;
drop policy if exists departments_select on public.departments;
create policy departments_select on public.departments for select using (public.is_internal(auth.uid()));
-- Written only by migrations for now.

alter table public.profiles
  add column if not exists department_key text references public.departments(key) on update cascade,
  add column if not exists level text check (level in ('member', 'lead', 'head'));

-- Backfill from today's roles; everyone else is assigned by the CEO on the Team page.
update public.profiles p set department_key = 'management', level = 'head'
  from public.roles r where p.role_id = r.id and r.name = 'co-founder' and p.department_key is null;
update public.profiles p set department_key = 'sales', level = 'head'
  from public.roles r where p.role_id = r.id and r.name = 'sales-director' and p.department_key is null;
update public.profiles p set department_key = 'content', level = 'head'
  from public.roles r where p.role_id = r.id and r.name = 'content-director' and p.department_key is null;
update public.profiles p set department_key = 'management', level = 'lead'
  from public.roles r where p.role_id = r.id and r.name = 'admin' and p.department_key is null;

create index if not exists idx_profiles_department on public.profiles (department_key);
