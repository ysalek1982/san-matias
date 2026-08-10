begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('public-media', 'public-media', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "storage_public_media_read" on storage.objects;
drop policy if exists "storage_public_media_insert" on storage.objects;
drop policy if exists "storage_public_media_update" on storage.objects;
drop policy if exists "storage_public_media_delete" on storage.objects;

create policy "storage_public_media_read"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'public-media');

create policy "storage_public_media_insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'public-media'
    and (select private.has_cms_role(array['superadmin', 'admin', 'editor']::public.cms_role[]))
  );

create policy "storage_public_media_update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'public-media'
    and (select private.has_cms_role(array['superadmin', 'admin', 'editor']::public.cms_role[]))
  )
  with check (
    bucket_id = 'public-media'
    and (select private.has_cms_role(array['superadmin', 'admin', 'editor']::public.cms_role[]))
  );

create policy "storage_public_media_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'public-media'
    and (select private.has_cms_role(array['superadmin', 'admin', 'editor']::public.cms_role[]))
  );

commit;
