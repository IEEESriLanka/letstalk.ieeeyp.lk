begin;

create table if not exists public.gallery_albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text not null default '',
  cover_image_url text,
  display_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.gallery_items
add column if not exists album_id uuid references public.gallery_albums(id) on delete set null;

create index if not exists gallery_items_album_order_idx
on public.gallery_items (album_id, published, display_order);

create index if not exists gallery_albums_published_order_idx
on public.gallery_albums (published, display_order);

drop trigger if exists gallery_albums_set_updated_at on public.gallery_albums;
create trigger gallery_albums_set_updated_at before update on public.gallery_albums
for each row execute function public.set_updated_at();

alter table public.gallery_albums enable row level security;

drop policy if exists "Public reads published gallery albums" on public.gallery_albums;
create policy "Public reads published gallery albums"
on public.gallery_albums for select
using (published = true or public.is_admin());

drop policy if exists "Admins manage gallery albums" on public.gallery_albums;
create policy "Admins manage gallery albums"
on public.gallery_albums for all
using (public.is_admin())
with check (public.is_admin());

grant select on public.gallery_albums to anon, authenticated;
grant insert, update, delete on public.gallery_albums to authenticated;

insert into public.gallery_albums (title, slug, description, display_order, published)
values ('General', 'general', 'Highlights from IEEE LETs Talk.', 0, true)
on conflict (slug) do nothing;

update public.gallery_items
set album_id = (select id from public.gallery_albums where slug = 'general')
where album_id is null;

commit;
