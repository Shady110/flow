-- Tasks were slow (~11s): the select policy called can_see_client() and
-- has_permission() once PER ROW, and each task row also pulled its assignees
-- through another per-row policy. Since 0024 every active staff profile holds
-- every permission, so the checks collapse to one per-statement test
-- ((select ...) lets Postgres evaluate it once as an initplan).
drop policy if exists tasks_select on public.tasks;
create policy tasks_select on public.tasks for select using (
  (select public.has_permission((select auth.uid()), 'tasks.view'))
  or client_id = (select public.current_client_id((select auth.uid())))
);

drop policy if exists task_assignees_select on public.task_assignees;
create policy task_assignees_select on public.task_assignees for select using (
  (select public.has_permission((select auth.uid()), 'tasks.view'))
  or exists (
    select 1 from public.tasks t
    where t.id = task_assignees.task_id
      and t.client_id = (select public.current_client_id((select auth.uid())))
  )
);

create index if not exists idx_tasks_due_date on public.tasks(due_date);
