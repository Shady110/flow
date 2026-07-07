-- ============================================================================
-- FLOW Dashboard — Migration 0003: Client portal — products & realtime chat (Phase 3)
-- ============================================================================

-- ── Co-founder permission bypass ────────────────────────────────────────────
-- Co-founders implicitly hold every permission (incl. ones added in future
-- migrations) without needing explicit role_permissions rows.
create or replace function public.has_permission(uid uuid, perm text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.profiles p
    join public.roles r on r.id = p.role_id
    where p.id = uid
      and p.status = 'active'
      and (
        r.name = 'co-founder'
        or exists (
          select 1 from public.role_permissions rp
          where rp.role_id = p.role_id and rp.permission_key = perm
        )
      )
  );
$$;

-- ── New permissions ─────────────────────────────────────────────────────────
insert into public.permissions (key, label, category) values
  ('products.view',   'View products',   'Products'),
  ('products.manage', 'Manage products', 'Products')
on conflict (key) do update set label = excluded.label, category = excluded.category;

-- Grant the new product permissions to the default 'admin' role
insert into public.role_permissions (role_id, permission_key)
select r.id, k.key
from public.roles r
cross join (values ('products.view'), ('products.manage')) as k(key)
where r.name = 'admin'
on conflict do nothing;

-- ── Helper: the client_user row id for the current auth user ────────────────
create or replace function public.current_client_user_id(uid uuid)
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.client_users where user_id = uid limit 1;
$$;

-- ── Products ────────────────────────────────────────────────────────────────
do $$ begin
  create type product_status as enum ('draft', 'in_progress', 'review', 'live', 'rejected', 'paused');
exception when duplicate_object then null; end $$;

create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.clients(id) on delete cascade,
  name        text not null,
  sku         text,
  marketplace text,                       -- amazon | noon | jumia | ...
  status      product_status not null default 'draft',
  image_url   text,
  price       numeric(12, 2),
  notes       text,
  updated_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_products_client on public.products(client_id);

drop trigger if exists trg_products_touch on public.products;
create trigger trg_products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- ── Chat: conversations & messages ──────────────────────────────────────────
create table if not exists public.conversations (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references public.clients(id) on delete cascade,
  client_user_id  uuid not null references public.client_users(id) on delete cascade,
  subject         text,
  last_message_at timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists idx_conversations_client_user on public.conversations(client_user_id);
create index if not exists idx_conversations_client on public.conversations(client_id);

create table if not exists public.messages (
  id                    uuid primary key default gen_random_uuid(),
  conversation_id       uuid not null references public.conversations(id) on delete cascade,
  sender_type           text not null check (sender_type in ('admin', 'client')),
  sender_profile_id     uuid references public.profiles(id) on delete set null,
  sender_client_user_id uuid references public.client_users(id) on delete set null,
  body                  text not null,
  read_at               timestamptz,
  created_at            timestamptz not null default now()
);

create index if not exists idx_messages_conversation on public.messages(conversation_id, created_at);

-- ── Row-Level Security ──────────────────────────────────────────────────────
alter table public.products      enable row level security;
alter table public.conversations enable row level security;
alter table public.messages      enable row level security;

-- products: internal (products.view) sees all; a client user sees their own
drop policy if exists products_select on public.products;
create policy products_select on public.products for select using (
  public.has_permission(auth.uid(), 'products.view')
  or client_id = public.current_client_id(auth.uid())
);
drop policy if exists products_write on public.products;
create policy products_write on public.products for all
  using (public.has_permission(auth.uid(), 'products.manage'))
  with check (public.has_permission(auth.uid(), 'products.manage'));

-- conversations: admins with chat.access see all; a client user sees their own
drop policy if exists conversations_select on public.conversations;
create policy conversations_select on public.conversations for select using (
  public.has_permission(auth.uid(), 'chat.access')
  or client_user_id = public.current_client_user_id(auth.uid())
);
drop policy if exists conversations_insert on public.conversations;
create policy conversations_insert on public.conversations for insert with check (
  public.has_permission(auth.uid(), 'chat.access')
  or client_user_id = public.current_client_user_id(auth.uid())
);
drop policy if exists conversations_update on public.conversations;
create policy conversations_update on public.conversations for update using (
  public.has_permission(auth.uid(), 'chat.access')
  or client_user_id = public.current_client_user_id(auth.uid())
);

-- messages: readable/insertable only by conversation participants
drop policy if exists messages_select on public.messages;
create policy messages_select on public.messages for select using (
  exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and (
        public.has_permission(auth.uid(), 'chat.access')
        or c.client_user_id = public.current_client_user_id(auth.uid())
      )
  )
);
drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages for insert with check (
  exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and (
        (sender_type = 'admin'
          and public.has_permission(auth.uid(), 'chat.access')
          and sender_profile_id = auth.uid())
        or
        (sender_type = 'client'
          and c.client_user_id = public.current_client_user_id(auth.uid())
          and sender_client_user_id = public.current_client_user_id(auth.uid()))
      )
  )
);
drop policy if exists messages_update on public.messages;
create policy messages_update on public.messages for update using (
  exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and (
        public.has_permission(auth.uid(), 'chat.access')
        or c.client_user_id = public.current_client_user_id(auth.uid())
      )
  )
);

-- ── Realtime ────────────────────────────────────────────────────────────────
-- Broadcast message inserts to subscribed clients (RLS still applies).
do $$ begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.conversations;
exception when duplicate_object then null; end $$;
