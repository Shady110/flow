-- In-app notifications for both portals.
--   audience 'client' -> shown to that client's users (admin did something)
--   audience 'staff'  -> shown to every staff member (a client did something)
-- Rows are written server-side with the service role (lib/notify.ts); nobody
-- inserts from the browser. The only thing a viewer may change is read_at.
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  audience   text not null check (audience in ('staff', 'client')),
  client_id  uuid not null references public.clients(id) on delete cascade,
  kind       text not null,
  payload    jsonb not null default '{}'::jsonb,
  href       text,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_inbox
  on public.notifications (audience, client_id, created_at desc);
create index if not exists idx_notifications_staff
  on public.notifications (created_at desc) where audience = 'staff';

alter table public.notifications enable row level security;

drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications for select using (
  (audience = 'staff'  and (select public.has_permission((select auth.uid()), 'clients.view')))
  or (audience = 'client' and client_id = (select public.current_client_id((select auth.uid()))))
);

drop policy if exists notifications_update on public.notifications;
create policy notifications_update on public.notifications for update using (
  (audience = 'staff'  and (select public.has_permission((select auth.uid()), 'clients.view')))
  or (audience = 'client' and client_id = (select public.current_client_id((select auth.uid()))))
);

-- Viewers may only mark as read, never rewrite the content.
revoke update on public.notifications from authenticated, anon;
grant  update (read_at) on public.notifications to authenticated;

do $$ begin
  alter publication supabase_realtime add table public.notifications;
exception when duplicate_object then null; end $$;

-- Every stage move (already logged in stage_events by a trigger) tells the client.
create or replace function public.notify_client_stage_move()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.client_id is not null and new.to_stage is distinct from new.from_stage then
    insert into public.notifications (audience, client_id, kind, payload, href)
    values ('client', new.client_id, 'stage_moved',
            jsonb_build_object('stage', new.to_stage), '/');
  end if;
  return new;
end $$;

drop trigger if exists trg_notify_stage_move on public.stage_events;
create trigger trg_notify_stage_move after insert on public.stage_events
  for each row execute function public.notify_client_stage_move();
