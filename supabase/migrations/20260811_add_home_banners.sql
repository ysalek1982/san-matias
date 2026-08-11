begin;

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

drop trigger if exists set_home_banners_updated_at on public.home_banners;
create trigger set_home_banners_updated_at
  before update on public.home_banners
  for each row execute function public.set_updated_at();

alter table public.home_banners enable row level security;

drop policy if exists "home_banners_public_read" on public.home_banners;
drop policy if exists "home_banners_cms_all" on public.home_banners;

create policy "home_banners_public_read"
  on public.home_banners for select to anon, authenticated
  using (is_active);

create policy "home_banners_cms_all"
  on public.home_banners for all to authenticated
  using ((select private.has_cms_role(array['superadmin', 'admin', 'editor']::public.cms_role[])))
  with check ((select private.has_cms_role(array['superadmin', 'admin', 'editor']::public.cms_role[])));

revoke all on table public.home_banners from anon, authenticated;
grant select on public.home_banners to anon, authenticated;
grant insert, update, delete on public.home_banners to authenticated;
grant all privileges on table public.home_banners to service_role;

insert into public.home_banners (title, eyebrow, image_url, link_url, sort_order, is_active)
select seed.title, seed.eyebrow, seed.image_url, seed.link_url, seed.sort_order, true
from (values
  ('La Curicha', 'Agua natural', '/images/la-curicha.jpg', '/turismo', 1),
  ('Pantanal boliviano', 'Humedal vivo', '/images/pantanal.png', '/turismo', 2),
  ('Paraba Azul', 'Fauna emblemática', '/images/paraba-azul.png', '/turismo', 3),
  ('Laguna Mandioré', 'Frontera de agua', '/images/laguna-mandiore.png', '/turismo', 4)
) as seed(title, eyebrow, image_url, link_url, sort_order)
where not exists (select 1 from public.home_banners);

commit;
