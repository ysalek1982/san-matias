begin;

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

drop trigger if exists set_complaint_categories_updated_at on public.complaint_categories;
create trigger set_complaint_categories_updated_at before update on public.complaint_categories
  for each row execute function public.set_updated_at();

alter table public.complaint_categories enable row level security;
drop policy if exists "complaint_categories_public_read" on public.complaint_categories;
drop policy if exists "complaint_categories_cms_all" on public.complaint_categories;
create policy "complaint_categories_public_read"
  on public.complaint_categories for select to anon, authenticated
  using (is_active);
create policy "complaint_categories_cms_all"
  on public.complaint_categories for all to authenticated
  using ((select private.has_cms_role(array['superadmin', 'admin']::public.cms_role[])))
  with check ((select private.has_cms_role(array['superadmin', 'admin']::public.cms_role[])));

revoke all on table public.complaint_categories from anon, authenticated;
grant select on public.complaint_categories to anon, authenticated;
grant insert, update, delete on public.complaint_categories to authenticated;

insert into public.complaint_categories (name, description, color, sort_order)
values
  ('Alumbrado público', 'Luminarias, postes y zonas sin iluminación.', '#c87d34', 10),
  ('Vías y drenaje', 'Calles, caminos, baches, cunetas y drenaje pluvial.', '#177a9b', 20),
  ('Limpieza urbana', 'Residuos, microbasurales y limpieza de espacios públicos.', '#3d7958', 30),
  ('Salud y servicios', 'Atención y servicios municipales vinculados al bienestar.', '#aa6128', 40),
  ('Otro', 'Situaciones que no corresponden a las categorías anteriores.', '#6d3b22', 50)
on conflict (name) do nothing;

commit;
