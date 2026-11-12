-- ============================================================================
-- FLOW Dashboard — Migration 0018: Account tickets
-- ============================================================================
-- Once an account is live on a marketplace the client asks for things by
-- ticket: they pick the platform and a category in the portal. The account
-- manager assigned to that platform account (client_platforms.account_manager_id,
-- set by the CEO) gets it; they can also open a ticket themselves when a client
-- reaches them offline (source = 'offline').
--
-- Visibility (staff): the CEO sees all; an account manager sees tickets for the
-- accounts they manage, tickets assigned to them, or everything with
-- accounts.view_all. The client sees its own tickets. Replies are a plain
-- thread; no realtime (the chat already covers live conversation).

create sequence if not exists public.ticket_number_seq start 1;

create table if not exists public.tickets (
  id                       uuid primary key default gen_random_uuid(),
  number                   text not null unique
                             default ('TCK-' || lpad(nextval('public.ticket_number_seq')::text, 4, '0')),
  client_id                uuid not null references public.clients(id) on delete cascade,
  platform_id              uuid not null references public.client_platforms(id) on delete cascade,
  category                 text not null,                     -- fixed list in lib/tickets.ts
  title                    text not null,
  body                     text,
  status                   text not null default 'open'
                             check (status in ('open', 'in_progress', 'waiting_client', 'resolved', 'closed')),
  priority                 text not null default 'normal'
                             check (priority in ('low', 'normal', 'high', 'urgent')),
  source                   text not null default 'portal' check (source in ('portal', 'offline')),
  created_by_client_user   uuid references public.client_users(id) on delete set null,
  created_by_profile       uuid references public.profiles(id) on delete set null,
  assignee_id              uuid references public.profiles(id) on delete set null,
  resolved_at              timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);
create index if not exists idx_tickets_client   on public.tickets(client_id, created_at desc);
create index if not exists idx_tickets_platform on public.tickets(platform_id);
create index if not exists idx_tickets_assignee on public.tickets(assignee_id, status);

create table if not exists public.ticket_messages (
  id                    uuid primary key default gen_random_uuid(),
  ticket_id             uuid not null references public.tickets(id) on delete cascade,
  sender_type           text not null check (sender_type in ('staff', 'client')),
  sender_profile_id     uuid references public.profiles(id) on delete set null,
  sender_client_user_id uuid references public.client_users(id) on delete set null,
  body                  text not null,
  created_at            timestamptz not null default now()
);
create index if not exists idx_ticket_messages_ticket on public.ticket_messages(ticket_id, created_at);

-- ── Who may see a ticket (staff side) ───────────────────────────────────────
create or replace function public.can_see_ticket(uid uuid, pid uuid, assignee uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_permission(uid, 'tickets.manage') and (
    public.has_permission(uid, 'clients.view')
    or public.has_permission(uid, 'accounts.view_all')
    or assignee = uid
    or exists (
      select 1 from public.client_platforms cp
      where cp.id = pid and cp.account_manager_id = uid
        and public.has_permission(uid, 'accounts.workspace')
    )
  );
$$;

-- ── Rules on create / update ────────────────────────────────────────────────
create or replace function public.enforce_ticket_rules()
returns trigger language plpgsql security definer set search_path = public as $$
declare plat public.client_platforms%rowtype;
begin
  if tg_op = 'INSERT' then
    select * into plat from public.client_platforms where id = new.platform_id;
    if not found or plat.client_id <> new.client_id then
      raise exception 'That platform account doesn''t belong to this client.';
    end if;
    -- Clients can only raise tickets once the account is live.
    if auth.uid() is not null and public.current_client_id(auth.uid()) is not null
       and plat.stage <> 'managing' then
      raise exception 'Tickets open once your account is live on the platform.';
    end if;
    if new.assignee_id is null then new.assignee_id := plat.account_manager_id; end if;
  end if;

  if new.status in ('resolved', 'closed') then
    new.resolved_at := coalesce(new.resolved_at, now());
  else
    new.resolved_at := null;
  end if;
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_tickets_rules on public.tickets;
create trigger trg_tickets_rules before insert or update on public.tickets
  for each row execute function public.enforce_ticket_rules();

-- A client reply reopens a resolved / waiting ticket; the first staff reply starts work.
create or replace function public.on_ticket_message()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.sender_type = 'client' then
    update public.tickets set status = 'open'
    where id = new.ticket_id and status in ('waiting_client', 'resolved');
  else
    update public.tickets set status = 'in_progress'
    where id = new.ticket_id and status = 'open';
  end if;
  update public.tickets set updated_at = now() where id = new.ticket_id;
  return null;
end $$;

drop trigger if exists trg_ticket_messages_after on public.ticket_messages;
create trigger trg_ticket_messages_after after insert on public.ticket_messages
  for each row execute function public.on_ticket_message();

-- ── Row-level security ──────────────────────────────────────────────────────
alter table public.tickets         enable row level security;
alter table public.ticket_messages enable row level security;

drop policy if exists tickets_select on public.tickets;
create policy tickets_select on public.tickets for select using (
  public.can_see_ticket(auth.uid(), platform_id, assignee_id)
  or client_id = public.current_client_id(auth.uid())
);

-- Staff open offline tickets; clients open their own portal tickets.
drop policy if exists tickets_insert on public.tickets;
create policy tickets_insert on public.tickets for insert with check (
  (source = 'offline'
     and created_by_profile = auth.uid()
     and public.can_see_ticket(auth.uid(), platform_id, assignee_id))
  or (source = 'portal'
     and client_id = public.current_client_id(auth.uid())
     and created_by_client_user = public.current_client_user_id(auth.uid()))
);

-- Only staff change status / priority / assignee.
drop policy if exists tickets_update on public.tickets;
create policy tickets_update on public.tickets for update
  using (public.can_see_ticket(auth.uid(), platform_id, assignee_id))
  with check (public.has_permission(auth.uid(), 'tickets.manage'));

drop policy if exists tickets_delete on public.tickets;
create policy tickets_delete on public.tickets for delete
  using (public.has_permission(auth.uid(), 'clients.edit'));

-- Messages: the embedded select on tickets is itself filtered by tickets' RLS.
drop policy if exists ticket_messages_select on public.ticket_messages;
create policy ticket_messages_select on public.ticket_messages for select using (
  exists (select 1 from public.tickets t where t.id = ticket_messages.ticket_id)
);

drop policy if exists ticket_messages_insert on public.ticket_messages;
create policy ticket_messages_insert on public.ticket_messages for insert with check (
  exists (
    select 1 from public.tickets t
    where t.id = ticket_messages.ticket_id
      and (
        (sender_type = 'staff'
           and sender_profile_id = auth.uid()
           and public.can_see_ticket(auth.uid(), t.platform_id, t.assignee_id))
        or (sender_type = 'client'
           and sender_client_user_id = public.current_client_user_id(auth.uid())
           and t.client_id = public.current_client_id(auth.uid())
           and t.status <> 'closed')
      )
  )
);
