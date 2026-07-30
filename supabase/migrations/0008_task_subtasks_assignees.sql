-- ============================================================================
-- FLOW Dashboard — Migration 0008: Subtasks + multiple assignees per task
-- ============================================================================
-- A "big task" is just a task with children (parent_task_id), so every existing
-- screen, dialog and filter works on subtasks unchanged. Assignment moves from
-- a single tasks.assignee_id to a join table; the old column is backfilled and
-- dropped so there is only ever one source of truth.

alter table public.tasks
  add column if not exists parent_task_id uuid references public.tasks(id) on delete cascade;

create index if not exists idx_tasks_parent on public.tasks(parent_task_id);

create table if not exists public.task_assignees (
  task_id    uuid not null references public.tasks(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (task_id, profile_id)
);

create index if not exists idx_task_assignees_profile on public.task_assignees(profile_id);

-- ── Backfill from the single-assignee column, then retire it ─────────────────
do $$ begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'tasks' and column_name = 'assignee_id'
  ) then
    insert into public.task_assignees (task_id, profile_id)
      select id, assignee_id from public.tasks where assignee_id is not null
      on conflict do nothing;
    drop index if exists public.idx_tasks_assignee;
    alter table public.tasks drop column assignee_id;
  end if;
end $$;

-- ── Row-Level Security ──────────────────────────────────────────────────────
alter table public.task_assignees enable row level security;

-- Internal readers with tasks.view see all; a client user sees the assignees of
-- their own client's tasks (same shape as task_activity_select in 0002).
drop policy if exists task_assignees_select on public.task_assignees;
create policy task_assignees_select on public.task_assignees for select using (
  public.has_permission(auth.uid(), 'tasks.view')
  or exists (
    select 1 from public.tasks t
    where t.id = task_assignees.task_id
      and t.client_id = public.current_client_id(auth.uid())
  )
);

drop policy if exists task_assignees_write on public.task_assignees;
create policy task_assignees_write on public.task_assignees for all
  using (public.has_permission(auth.uid(), 'tasks.assign'))
  with check (public.has_permission(auth.uid(), 'tasks.assign'));
