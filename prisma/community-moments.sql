-- Apply after gallery-albums.sql. Existing photos stay unselected.
alter table public.gallery_items
  add column if not exists show_in_moments boolean not null default false;
