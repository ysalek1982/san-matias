-- GAM San Matías · Portal Ciudadano + CMS
-- PASO 1 · Esquema inicial para Supabase/PostgreSQL
-- Ejecutar una sola vez desde Supabase Dashboard > SQL Editor.

begin;

create extension if not exists pgcrypto with schema extensions;

do $$ begin
  create type public.cms_role as enum ('superadmin', 'admin', 'editor', 'helpdesk');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.content_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.authority_type as enum ('alcalde', 'concejal', 'directivo', 'unidad');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.work_status as enum ('adjudicado', 'en_ejecucion', 'ejecutado');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.complaint_status as enum ('abierto', 'en_revision', 'resuelto');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role public.cms_role not null default 'editor',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_email_lower_idx
  on public.profiles (lower(email));

create table if not exists public.authorities (
  id uuid primary key default extensions.gen_random_uuid(),
  parent_id uuid references public.authorities(id) on delete set null,
  full_name text not null check (char_length(full_name) between 2 and 160),
  position text not null check (char_length(position) between 2 and 160),
  authority_type public.authority_type not null,
  organization_area text,
  biography text,
  photo_url text,
  sort_order integer not null default 0,
  status public.content_status not null default 'draft',
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint authorities_not_own_parent check (parent_id is null or parent_id <> id)
);

create index if not exists authorities_public_list_idx
  on public.authorities (status, authority_type, sort_order);
create index if not exists authorities_parent_idx on public.authorities (parent_id);

create table if not exists public.works (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 3 and 200),
  summary text,
  description text,
  location text not null default '',
  contractor text,
  budget numeric(16,2) not null default 0 check (budget >= 0),
  physical_progress smallint not null default 0 check (physical_progress between 0 and 100),
  status public.work_status not null default 'adjudicado',
  content_status public.content_status not null default 'draft',
  cover_image_url text,
  gallery_urls text[] not null default '{}',
  started_at date,
  expected_end_at date,
  completed_at date,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint works_dates_valid check (
    expected_end_at is null or started_at is null or expected_end_at >= started_at
  )
);

create index if not exists works_public_list_idx
  on public.works (content_status, status, published_at desc);

create table if not exists public.news (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 3 and 220),
  excerpt text not null default '',
  body text not null default '',
  category text not null check (category in ('Salud', 'Turismo', 'Educación')),
  cover_image_url text,
  status public.content_status not null default 'draft',
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists news_public_list_idx
  on public.news (status, published_at desc, category);

create table if not exists public.documents (
  id uuid primary key default extensions.gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 220),
  description text,
  category text not null check (category in ('POA', 'Resolución')),
  document_number text,
  fiscal_year smallint not null check (fiscal_year between 2000 and 2100),
  file_path text not null,
  file_name text not null,
  mime_type text not null default 'application/pdf',
  file_size_bytes bigint check (file_size_bytes is null or file_size_bytes >= 0),
  status public.content_status not null default 'draft',
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists documents_public_list_idx
  on public.documents (status, fiscal_year desc, category);

create table if not exists public.home_banners (
  id uuid primary key default extensions.gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 160),
  eyebrow text,
  image_url text not null,
  link_url text,
  sort_order integer not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists home_banners_public_list_idx
  on public.home_banners (is_active, sort_order);

create table if not exists public.complaint_ticket_counters (
  ticket_year smallint primary key check (ticket_year between 2020 and 2100),
  last_value integer not null default 0 check (last_value >= 0)
);

create table if not exists public.complaint_categories (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null unique check (char_length(name) between 2 and 100),
  description text,
  color text not null default '#2d6045' check (color ~ '^#[0-9A-Fa-f]{6}$'),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

insert into public.complaint_categories (name, description, color, sort_order)
values
  ('Alumbrado público', 'Luminarias, postes y zonas sin iluminación.', '#c87d34', 10),
  ('Vías y drenaje', 'Calles, caminos, baches, cunetas y drenaje pluvial.', '#177a9b', 20),
  ('Limpieza urbana', 'Residuos, microbasurales y limpieza de espacios públicos.', '#3d7958', 30),
  ('Salud y servicios', 'Atención y servicios municipales vinculados al bienestar.', '#aa6128', 40),
  ('Otro', 'Situaciones que no corresponden a las categorías anteriores.', '#6d3b22', 50)
on conflict (name) do nothing;

create table if not exists public.complaints (
  id uuid primary key default extensions.gen_random_uuid(),
  ticket_number text not null unique check (ticket_number ~ '^SM-[0-9]{4}-[0-9]{3,}$'),
  full_name text not null check (char_length(full_name) between 2 and 160),
  identity_document text,
  email text,
  phone text not null check (char_length(phone) between 5 and 40),
  category text not null check (char_length(category) between 2 and 100),
  location text not null check (char_length(location) between 2 and 240),
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  description text not null check (char_length(description) between 10 and 5000),
  status public.complaint_status not null default 'abierto',
  assigned_to uuid references public.profiles(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists complaints_status_created_idx
  on public.complaints (status, created_at desc);
create index if not exists complaints_assigned_idx
  on public.complaints (assigned_to) where assigned_to is not null;

create table if not exists public.complaint_updates (
  id uuid primary key default extensions.gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  from_status public.complaint_status,
  to_status public.complaint_status,
  message text not null check (char_length(message) between 1 and 5000),
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists complaint_updates_timeline_idx
  on public.complaint_updates (complaint_id, created_at);

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.has_cms_role(allowed_roles public.cms_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.is_active
      and p.role = any(allowed_roles)
  );
$$;

revoke all on function private.has_cms_role(public.cms_role[]) from public;
grant execute on function private.has_cms_role(public.cms_role[]) to authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare table_name text;
begin
  foreach table_name in array array['profiles', 'authorities', 'works', 'news', 'documents', 'home_banners', 'complaint_categories', 'complaints']
  loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', table_name, table_name);
    execute format(
      'create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      table_name,
      table_name
    );
  end loop;
end $$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

drop function if exists public.create_complaint(text, text, text, text, text, text, text);

create or replace function public.create_complaint(
  p_full_name text,
  p_identity_document text,
  p_email text,
  p_phone text,
  p_category text,
  p_location text,
  p_description text,
  p_latitude double precision default null,
  p_longitude double precision default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_year smallint := extract(year from timezone('America/La_Paz', now()))::smallint;
  next_number integer;
  generated_ticket text;
begin
  if char_length(trim(p_full_name)) not between 2 and 160
    or char_length(trim(p_phone)) not between 5 and 40
    or char_length(trim(p_category)) not between 2 and 100
    or char_length(trim(p_location)) not between 2 and 240
    or char_length(trim(p_description)) not between 10 and 5000 then
    raise exception 'Datos de denuncia inválidos' using errcode = '22023';
  end if;
  if (p_latitude is null) <> (p_longitude is null)
    or (p_latitude is not null and p_latitude not between -90 and 90)
    or (p_longitude is not null and p_longitude not between -180 and 180) then
    raise exception 'Coordenadas inválidas' using errcode = '22023';
  end if;

  insert into public.complaint_ticket_counters (ticket_year, last_value)
  values (current_year, 1)
  on conflict (ticket_year) do update
    set last_value = public.complaint_ticket_counters.last_value + 1
  returning last_value into next_number;

  generated_ticket := format('SM-%s-%s', current_year, lpad(next_number::text, 3, '0'));

  insert into public.complaints (
    ticket_number, full_name, identity_document, email, phone,
    category, location, latitude, longitude, description
  ) values (
    generated_ticket, trim(p_full_name), nullif(trim(p_identity_document), ''),
    nullif(trim(p_email), ''), trim(p_phone), trim(p_category),
    trim(p_location), p_latitude, p_longitude, trim(p_description)
  );

  return generated_ticket;
end;
$$;

create or replace function public.track_complaint(p_ticket_number text)
returns table (
  ticket_number text,
  status public.complaint_status,
  category text,
  created_at timestamptz,
  updated_at timestamptz,
  public_updates jsonb
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    c.ticket_number,
    c.status,
    c.category,
    c.created_at,
    c.updated_at,
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'message', u.message,
          'status', u.to_status,
          'created_at', u.created_at
        ) order by u.created_at
      ) filter (where u.id is not null),
      '[]'::jsonb
    ) as public_updates
  from public.complaints c
  left join public.complaint_updates u
    on u.complaint_id = c.id and u.is_public
  where upper(trim(c.ticket_number)) = upper(trim(p_ticket_number))
  group by c.id;
$$;

revoke all on function public.create_complaint(text, text, text, text, text, text, text, double precision, double precision) from public;
revoke all on function public.track_complaint(text) from public;
grant execute on function public.create_complaint(text, text, text, text, text, text, text, double precision, double precision) to anon, authenticated;
grant execute on function public.track_complaint(text) to anon, authenticated;

alter table public.profiles enable row level security;
alter table public.authorities enable row level security;
alter table public.works enable row level security;
alter table public.news enable row level security;
alter table public.documents enable row level security;
alter table public.home_banners enable row level security;
alter table public.complaint_ticket_counters enable row level security;
alter table public.complaint_categories enable row level security;
alter table public.cms_audit_logs enable row level security;
alter table public.complaints enable row level security;
alter table public.complaint_updates enable row level security;

create policy "profiles_select_own_or_admin"
  on public.profiles for select to authenticated
  using (
    id = (select auth.uid())
    or (select private.has_cms_role(array['superadmin', 'admin']::public.cms_role[]))
  );
create policy "profiles_admin_insert"
  on public.profiles for insert to authenticated
  with check ((select private.has_cms_role(array['superadmin', 'admin']::public.cms_role[])));
create policy "profiles_admin_update"
  on public.profiles for update to authenticated
  using ((select private.has_cms_role(array['superadmin', 'admin']::public.cms_role[])))
  with check ((select private.has_cms_role(array['superadmin', 'admin']::public.cms_role[])));
create policy "profiles_superadmin_delete"
  on public.profiles for delete to authenticated
  using ((select private.has_cms_role(array['superadmin']::public.cms_role[])));

create policy "authorities_public_read"
  on public.authorities for select to anon, authenticated
  using (status = 'published');
create policy "authorities_cms_all"
  on public.authorities for all to authenticated
  using ((select private.has_cms_role(array['superadmin', 'admin', 'editor']::public.cms_role[])))
  with check ((select private.has_cms_role(array['superadmin', 'admin', 'editor']::public.cms_role[])));

create policy "works_public_read"
  on public.works for select to anon, authenticated
  using (content_status = 'published');
create policy "works_cms_all"
  on public.works for all to authenticated
  using ((select private.has_cms_role(array['superadmin', 'admin', 'editor']::public.cms_role[])))
  with check ((select private.has_cms_role(array['superadmin', 'admin', 'editor']::public.cms_role[])));

create policy "news_public_read"
  on public.news for select to anon, authenticated
  using (status = 'published' and published_at <= now());
create policy "news_cms_all"
  on public.news for all to authenticated
  using ((select private.has_cms_role(array['superadmin', 'admin', 'editor']::public.cms_role[])))
  with check ((select private.has_cms_role(array['superadmin', 'admin', 'editor']::public.cms_role[])));

create policy "documents_public_read"
  on public.documents for select to anon, authenticated
  using (status = 'published');
create policy "documents_cms_all"
  on public.documents for all to authenticated
  using ((select private.has_cms_role(array['superadmin', 'admin', 'editor']::public.cms_role[])))
  with check ((select private.has_cms_role(array['superadmin', 'admin', 'editor']::public.cms_role[])));

create policy "home_banners_public_read"
  on public.home_banners for select to anon, authenticated
  using (is_active);
create policy "home_banners_cms_all"
  on public.home_banners for all to authenticated
  using ((select private.has_cms_role(array['superadmin', 'admin', 'editor']::public.cms_role[])))
  with check ((select private.has_cms_role(array['superadmin', 'admin', 'editor']::public.cms_role[])));

create policy "complaint_categories_public_read"
  on public.complaint_categories for select to anon, authenticated
  using (is_active);
create policy "complaint_categories_cms_all"
  on public.complaint_categories for all to authenticated
  using ((select private.has_cms_role(array['superadmin', 'admin']::public.cms_role[])))
  with check ((select private.has_cms_role(array['superadmin', 'admin']::public.cms_role[])));

create policy "cms_audit_logs_admin_read"
  on public.cms_audit_logs for select to authenticated
  using ((select private.has_cms_role(array['superadmin', 'admin']::public.cms_role[])));

create policy "complaints_staff_read"
  on public.complaints for select to authenticated
  using ((select private.has_cms_role(array['superadmin', 'admin', 'helpdesk']::public.cms_role[])));
create policy "complaints_staff_update"
  on public.complaints for update to authenticated
  using ((select private.has_cms_role(array['superadmin', 'admin', 'helpdesk']::public.cms_role[])))
  with check ((select private.has_cms_role(array['superadmin', 'admin', 'helpdesk']::public.cms_role[])));

create policy "complaint_updates_staff_read"
  on public.complaint_updates for select to authenticated
  using ((select private.has_cms_role(array['superadmin', 'admin', 'helpdesk']::public.cms_role[])));
create policy "complaint_updates_staff_insert"
  on public.complaint_updates for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and (select private.has_cms_role(array['superadmin', 'admin', 'helpdesk']::public.cms_role[]))
  );
create policy "complaint_updates_admin_update"
  on public.complaint_updates for update to authenticated
  using ((select private.has_cms_role(array['superadmin', 'admin']::public.cms_role[])))
  with check ((select private.has_cms_role(array['superadmin', 'admin']::public.cms_role[])));
create policy "complaint_updates_admin_delete"
  on public.complaint_updates for delete to authenticated
  using ((select private.has_cms_role(array['superadmin', 'admin']::public.cms_role[])));

revoke all on table
  public.profiles,
  public.authorities,
  public.works,
  public.news,
  public.documents,
  public.home_banners,
  public.complaint_ticket_counters,
  public.complaint_categories,
  public.cms_audit_logs,
  public.complaints,
  public.complaint_updates
from anon, authenticated;
grant select on public.authorities, public.works, public.news, public.documents, public.home_banners, public.complaint_categories to anon, authenticated;
grant select on public.profiles to authenticated;
grant select on public.cms_audit_logs to authenticated;
grant insert, update, delete on public.profiles to authenticated;
grant insert, update, delete on public.authorities, public.works, public.news, public.documents, public.home_banners to authenticated;
grant insert, update, delete on public.complaint_categories to authenticated;
grant select, update on public.complaints to authenticated;
grant select, insert, update, delete on public.complaint_updates to authenticated;
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
grant all privileges on all routines in schema public to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('public-media', 'public-media', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('public-documents', 'public-documents', true, 52428800, array['application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "storage_public_read" on storage.objects;
drop policy if exists "storage_editors_insert" on storage.objects;
drop policy if exists "storage_editors_update" on storage.objects;
drop policy if exists "storage_editors_delete" on storage.objects;

create policy "storage_public_read"
  on storage.objects for select to anon, authenticated
  using (bucket_id in ('public-media', 'public-documents'));
create policy "storage_editors_insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id in ('public-media', 'public-documents')
    and (select private.has_cms_role(array['superadmin', 'admin', 'editor']::public.cms_role[]))
  );
create policy "storage_editors_update"
  on storage.objects for update to authenticated
  using (
    bucket_id in ('public-media', 'public-documents')
    and (select private.has_cms_role(array['superadmin', 'admin', 'editor']::public.cms_role[]))
  )
  with check (
    bucket_id in ('public-media', 'public-documents')
    and (select private.has_cms_role(array['superadmin', 'admin', 'editor']::public.cms_role[]))
  );
create policy "storage_editors_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id in ('public-media', 'public-documents')
    and (select private.has_cms_role(array['superadmin', 'admin', 'editor']::public.cms_role[]))
  );

commit;

-- Después de crear el primer usuario en Authentication, promuévalo manualmente:
-- update public.profiles set role = 'superadmin' where email = 'admin@sanmatias.gob.bo';
