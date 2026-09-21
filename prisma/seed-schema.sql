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
