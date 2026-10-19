-- ============================================================================
-- FLOW Dashboard — Migration 0017: Scope shared tools to the clients you may see
-- ============================================================================
-- 0013 made CLIENT visibility depend on stage and role (can_see_client): the
-- content director sees a client only while one of its platforms is at
-- `listing`; an account manager only while it is pushing / managing and theirs.
--
-- But three older tables were guarded by a bare permission, so anyone holding
-- the permission saw EVERY client's rows:
--   · products         (products.view / products.manage)
--   · conversations + messages   (chat.access)
--   · automation_jobs + items    (automation.run)
-- The two directors hold exactly those permissions, which would have let the
-- content director read all clients' chats and products. Each policy now also
-- requires can_see_client(). The CEO and admins hold clients.view, so for them
-- nothing changes. Portal users are matched by their own client as before.

-- ── products ────────────────────────────────────────────────────────────────
drop policy if exists products_select on public.products;
create policy products_select on public.products for select using (
  (public.has_permission(auth.uid(), 'products.view')
     and public.can_see_client(auth.uid(), client_id))
  or client_id = public.current_client_id(auth.uid())
);
drop policy if exists products_write on public.products;
create policy products_write on public.products for all
  using (public.has_permission(auth.uid(), 'products.manage')
         and public.can_see_client(auth.uid(), client_id))
  with check (public.has_permission(auth.uid(), 'products.manage')
              and public.can_see_client(auth.uid(), client_id));

-- ── chat ────────────────────────────────────────────────────────────────────
drop policy if exists conversations_select on public.conversations;
create policy conversations_select on public.conversations for select using (
  (public.has_permission(auth.uid(), 'chat.access') and public.can_see_client(auth.uid(), client_id))
  or client_user_id = public.current_client_user_id(auth.uid())
);
drop policy if exists conversations_insert on public.conversations;
create policy conversations_insert on public.conversations for insert with check (
  (public.has_permission(auth.uid(), 'chat.access') and public.can_see_client(auth.uid(), client_id))
  or client_user_id = public.current_client_user_id(auth.uid())
);
drop policy if exists conversations_update on public.conversations;
create policy conversations_update on public.conversations for update using (
  (public.has_permission(auth.uid(), 'chat.access') and public.can_see_client(auth.uid(), client_id))
  or client_user_id = public.current_client_user_id(auth.uid())
);

drop policy if exists messages_select on public.messages;
create policy messages_select on public.messages for select using (
  exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and (
        (public.has_permission(auth.uid(), 'chat.access') and public.can_see_client(auth.uid(), c.client_id))
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
          and public.can_see_client(auth.uid(), c.client_id)
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
        (public.has_permission(auth.uid(), 'chat.access') and public.can_see_client(auth.uid(), c.client_id))
        or c.client_user_id = public.current_client_user_id(auth.uid())
      )
  )
);

-- ── automation ──────────────────────────────────────────────────────────────
-- Jobs not tied to a client (client_id is null) stay open to everyone who can run automations.
drop policy if exists automation_jobs_rw on public.automation_jobs;
create policy automation_jobs_rw on public.automation_jobs for all
  using (public.has_permission(auth.uid(), 'automation.run')
         and (client_id is null or public.can_see_client(auth.uid(), client_id)))
  with check (public.has_permission(auth.uid(), 'automation.run')
              and (client_id is null or public.can_see_client(auth.uid(), client_id)));

drop policy if exists automation_items_rw on public.automation_items;
create policy automation_items_rw on public.automation_items for all
  using (exists (
    select 1 from public.automation_jobs j
    where j.id = automation_items.job_id
      and public.has_permission(auth.uid(), 'automation.run')
      and (j.client_id is null or public.can_see_client(auth.uid(), j.client_id))
  ))
  with check (exists (
    select 1 from public.automation_jobs j
    where j.id = automation_items.job_id
      and public.has_permission(auth.uid(), 'automation.run')
      and (j.client_id is null or public.can_see_client(auth.uid(), j.client_id))
  ));
