-- Department heads and leads see their department on the Team page; that page
-- needs team.view. Give it to the two director roles (the CEO and admins have it).
insert into public.role_permissions (role_id, permission_key)
select r.id, 'team.view' from public.roles r
where r.name in ('sales-director', 'content-director')
on conflict do nothing;
