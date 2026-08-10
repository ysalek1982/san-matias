begin;

create table if not exists public.cms_audit_logs (
  id uuid primary key default extensions.gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null check (char_length(action) between 2 and 80),
  entity_type text not null check (char_length(entity_type) between 2 and 80),
  entity_id text,
  summary text not null check (char_length(summary) between 2 and 500),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists cms_audit_logs_created_idx on public.cms_audit_logs (created_at desc);
alter table public.cms_audit_logs enable row level security;
drop policy if exists "cms_audit_logs_admin_read" on public.cms_audit_logs;
create policy "cms_audit_logs_admin_read"
  on public.cms_audit_logs for select to authenticated
  using ((select private.has_cms_role(array['superadmin', 'admin']::public.cms_role[])));
revoke all on table public.cms_audit_logs from anon, authenticated;
grant select on public.cms_audit_logs to authenticated;
grant all privileges on public.cms_audit_logs to service_role;

commit;
