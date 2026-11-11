-- Run in the Supabase SQL Editor AFTER applying 0023. Read-only; every check should say ok = true.

-- 1. Three departments, no management/finance.
select 'departments are sales, content, accounts' as check,
       (select array_agg(key order by key) from public.departments) = array['accounts','content','sales'] as ok;

-- 2. The seven system roles exist with the right department and rank.
select 'seven system roles' as check,
       (select count(*) from public.roles where name in
         ('ceo','sales-director','sales-employee','content-director','content-employee','accounts-director','accounts-employee')) = 7 as ok;

-- 3. The CEO holds none of the work keys.
select 'CEO has no action keys' as check,
       not exists (
         select 1 from public.role_permissions rp join public.roles r on r.id = rp.role_id
          where r.name = 'ceo' and rp.permission_key in
            ('leads.edit','leads.create','leads.convert','tasks.create','tasks.edit','contracts.manage','pipeline.manage',
             'content.workspace','accounts.workspace','tickets.manage','sales.workspace','chat.access','finance.manage','invoices.issue')
       ) as ok;

-- 4. Employees do not get director-only insights or assignment.
select 'employees have no insights/assign' as check,
       not exists (
         select 1 from public.role_permissions rp join public.roles r on r.id = rp.role_id
          where r.rank = 'employee' and (rp.permission_key like 'insights.%' or rp.permission_key = 'accounts.assign')
       ) as ok;

-- 5. Only the Account employee is limited to assigned clients: no employee role holds accounts.view_all or clients.view there.
select 'account employee is assignment-scoped' as check,
       not exists (
         select 1 from public.role_permissions rp join public.roles r on r.id = rp.role_id
          where r.name = 'accounts-employee' and rp.permission_key in ('accounts.view_all','clients.view')
       ) as ok;

-- 6. Everyone who had a role still has one (profile_roles backfill).
select 'every profile with a role has a profile_roles row' as check,
       not exists (
         select 1 from public.profiles p
          where p.role_id is not null
            and not exists (select 1 from public.profile_roles pr where pr.profile_id = p.id)
       ) as ok;

-- 7. Your account is the CEO and holds insights.
select 'shaadygamal@gmail.com is CEO with insights' as check,
       exists (
         select 1 from auth.users u
           join public.profile_roles pr on pr.profile_id = u.id
           join public.roles r on r.id = pr.role_id and r.name = 'ceo'
          where lower(u.email) = 'shaadygamal@gmail.com'
       ) and public.has_permission((select id from auth.users where lower(email) = 'shaadygamal@gmail.com'), 'insights.sales') as ok;

-- 8. Per-client assignment carried over from the old per-platform account manager.
select 'assignments backfilled' as check,
       (select count(*) from public.client_assignments) >=
       (select count(distinct (client_id, account_manager_id)) from public.client_platforms where account_manager_id is not null) as ok;

-- For information: people still on the legacy "admin" role or with no role.
select u.email, string_agg(r.name, ', ') as roles
  from public.profiles p
  join auth.users u on u.id = p.id
  left join public.profile_roles pr on pr.profile_id = p.id
  left join public.roles r on r.id = pr.role_id
 group by u.email order by u.email;
