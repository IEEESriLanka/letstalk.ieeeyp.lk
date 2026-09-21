create table if not exists public.site_content (
  id text primary key,
  content jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key,
  name text not null,
  email text not null,
  topic text not null default 'General inquiry',
  message text not null default '',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  event_date date not null,
  start_time time,
  location text not null,
  registration_url text,
  cover_image_url text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  cover_image_url text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  caption text,
  image_url text not null,
  display_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.awards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  award_year integer,
  image_url text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  website_url text,
  display_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists events_published_idx on public.events (published, event_date desc);
create index if not exists programs_published_idx on public.programs (published, created_at desc);
create index if not exists gallery_published_order_idx on public.gallery_items (published, display_order);
create index if not exists awards_published_year_idx on public.awards (published, award_year desc);
create index if not exists partners_active_order_idx on public.partners (active, display_order);
create index if not exists contact_messages_read_idx on public.contact_messages (read, created_at desc);
create index if not exists admin_users_user_id_idx on public.admin_users (user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at before update on public.events
for each row execute function public.set_updated_at();

drop trigger if exists programs_set_updated_at on public.programs;
create trigger programs_set_updated_at before update on public.programs
for each row execute function public.set_updated_at();

drop trigger if exists gallery_items_set_updated_at on public.gallery_items;
create trigger gallery_items_set_updated_at before update on public.gallery_items
for each row execute function public.set_updated_at();

drop trigger if exists awards_set_updated_at on public.awards;
create trigger awards_set_updated_at before update on public.awards
for each row execute function public.set_updated_at();

drop trigger if exists partners_set_updated_at on public.partners;
create trigger partners_set_updated_at before update on public.partners
for each row execute function public.set_updated_at();

alter table public.site_content enable row level security;
alter table public.contact_messages enable row level security;
alter table public.admin_users enable row level security;
alter table public.events enable row level security;
alter table public.programs enable row level security;
alter table public.gallery_items enable row level security;
alter table public.awards enable row level security;
alter table public.partners enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
      and role in ('admin', 'editor')
  );
$$;

drop policy if exists "Public can read site content" on public.site_content;
create policy "Public can read site content"
on public.site_content for select
using (true);

drop policy if exists "Admins manage site content" on public.site_content;
create policy "Admins manage site content"
on public.site_content for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can create contact messages" on public.contact_messages;
create policy "Public can create contact messages"
on public.contact_messages for insert
with check (read = false);

drop policy if exists "Admins manage contact messages" on public.contact_messages;
create policy "Admins manage contact messages"
on public.contact_messages for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can read their admin record" on public.admin_users;
create policy "Admins can read their admin record"
on public.admin_users for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Admins manage admin users" on public.admin_users;
create policy "Admins manage admin users"
on public.admin_users for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public reads published events" on public.events;
create policy "Public reads published events"
on public.events for select
using (published = true or public.is_admin());

drop policy if exists "Admins manage events" on public.events;
create policy "Admins manage events"
on public.events for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public reads published programs" on public.programs;
create policy "Public reads published programs"
on public.programs for select
using (published = true or public.is_admin());

drop policy if exists "Admins manage programs" on public.programs;
create policy "Admins manage programs"
on public.programs for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public reads published gallery" on public.gallery_items;
create policy "Public reads published gallery"
on public.gallery_items for select
using (published = true or public.is_admin());

drop policy if exists "Admins manage gallery" on public.gallery_items;
create policy "Admins manage gallery"
on public.gallery_items for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public reads published awards" on public.awards;
create policy "Public reads published awards"
on public.awards for select
using (published = true or public.is_admin());

drop policy if exists "Admins manage awards" on public.awards;
create policy "Admins manage awards"
on public.awards for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public reads active partners" on public.partners;
create policy "Public reads active partners"
on public.partners for select
using (active = true or public.is_admin());

drop policy if exists "Admins manage partners" on public.partners;
create policy "Admins manage partners"
on public.partners for all
using (public.is_admin())
with check (public.is_admin());

insert into storage.buckets (id, name, public)
values
  ('event-images', 'event-images', true),
  ('program-images', 'program-images', true),
  ('gallery-images', 'gallery-images', true),
  ('award-images', 'award-images', true),
  ('partner-logos', 'partner-logos', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public can read admin images" on storage.objects;
create policy "Public can read admin images"
on storage.objects for select
using (bucket_id in ('event-images', 'program-images', 'gallery-images', 'award-images', 'partner-logos'));

drop policy if exists "Admins can upload admin images" on storage.objects;
create policy "Admins can upload admin images"
on storage.objects for insert
with check (
  bucket_id in ('event-images', 'program-images', 'gallery-images', 'award-images', 'partner-logos')
  and public.is_admin()
);

drop policy if exists "Admins can update admin images" on storage.objects;
create policy "Admins can update admin images"
on storage.objects for update
using (
  bucket_id in ('event-images', 'program-images', 'gallery-images', 'award-images', 'partner-logos')
  and public.is_admin()
)
with check (
  bucket_id in ('event-images', 'program-images', 'gallery-images', 'award-images', 'partner-logos')
  and public.is_admin()
);

drop policy if exists "Admins can delete admin images" on storage.objects;
create policy "Admins can delete admin images"
on storage.objects for delete
using (
  bucket_id in ('event-images', 'program-images', 'gallery-images', 'award-images', 'partner-logos')
  and public.is_admin()
);

grant usage on schema public to anon, authenticated;

grant select on public.site_content to anon, authenticated;
grant all on public.site_content to authenticated;

grant insert on public.contact_messages to anon;
grant select, insert, update, delete on public.contact_messages to authenticated;

grant select on public.events to anon, authenticated;
grant insert, update, delete on public.events to authenticated;

grant select on public.programs to anon, authenticated;
grant insert, update, delete on public.programs to authenticated;

grant select on public.gallery_items to anon, authenticated;
grant insert, update, delete on public.gallery_items to authenticated;

grant select on public.awards to anon, authenticated;
grant insert, update, delete on public.awards to authenticated;

grant select on public.partners to anon, authenticated;
grant insert, update, delete on public.partners to authenticated;

grant select on public.admin_users to authenticated;
grant insert, update, delete on public.admin_users to authenticated;

grant execute on function public.is_admin() to anon, authenticated;
