begin;

alter table public.complaints
  add column if not exists latitude double precision check (latitude between -90 and 90),
  add column if not exists longitude double precision check (longitude between -180 and 180);

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

revoke all on function public.create_complaint(text, text, text, text, text, text, text, double precision, double precision) from public;
grant execute on function public.create_complaint(text, text, text, text, text, text, text, double precision, double precision) to anon, authenticated;

commit;
