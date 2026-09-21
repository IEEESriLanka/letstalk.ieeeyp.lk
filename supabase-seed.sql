-- IEEE LETs Talk CMS seed data
-- Run this after supabase-schema.sql.
-- The statements are idempotent: rerunning the file updates the same seed rows.

begin;

insert into public.events (
  id,
  title,
  description,
  event_date,
  start_time,
  location,
  registration_url,
  cover_image_url,
  published,
  created_at,
  updated_at
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'Road to Ignite - Session 12',
    'A leadership conversation with industry experts about career growth, innovation, and professional confidence.',
    current_date + interval '21 days',
    '18:30',
    'IEEE Sri Lanka Section Auditorium',
    'https://ieeeyp.lk',
    '/lets-talk-logo.png',
    true,
    now() - interval '12 days',
    now()
  ),
  (
    '11111111-1111-4111-8111-111111111112',
    'Data Science Workshop',
    'A hands-on workshop covering applied analytics, model thinking, and real-world data science workflows.',
    current_date + interval '45 days',
    '09:30',
    'University of Colombo School of Computing',
    'https://ieeeyp.lk',
    '/lets-talk-logo.png',
    true,
    now() - interval '8 days',
    now()
  ),
  (
    '11111111-1111-4111-8111-111111111113',
    'InsightX - Beyond the Model',
    'A special edition session exploring how engineering teams turn models into usable products and decisions.',
    current_date + interval '70 days',
    '17:30',
    'Online',
    null,
    '/lets-talk-logo.png',
    false,
    now() - interval '3 days',
    now()
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  event_date = excluded.event_date,
  start_time = excluded.start_time,
  location = excluded.location,
  registration_url = excluded.registration_url,
  cover_image_url = excluded.cover_image_url,
  published = excluded.published,
  updated_at = now();

insert into public.programs (
  id,
  title,
  description,
  cover_image_url,
  published,
  created_at,
  updated_at
)
values
  (
    '22222222-2222-4222-8222-222222222221',
    'Road to Ignite',
    'The flagship LETs Talk leadership series featuring conversations with founders, executives, and technology leaders.',
    '/lets-talk-logo.png',
    true,
    now() - interval '20 days',
    now()
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'Upskill',
    'Practical workshops designed to help students and young professionals build job-ready skills.',
    '/lets-talk-logo.png',
    true,
    now() - interval '16 days',
    now()
  ),
  (
    '22222222-2222-4222-8222-222222222223',
    'Creative Sri Lanka',
    'A creative technology and innovation track for multidisciplinary builders and young professionals.',
    '/lets-talk-logo.png',
    false,
    now() - interval '6 days',
    now()
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  cover_image_url = excluded.cover_image_url,
  published = excluded.published,
  updated_at = now();

insert into public.gallery_items (
  id,
  title,
  caption,
  image_url,
  display_order,
  published,
  created_at,
  updated_at
)
values
  (
    '33333333-3333-4333-8333-333333333331',
    'Leadership Session',
    'Industry leaders sharing practical career lessons with the LETs Talk community.',
    '/lets-talk-logo.png',
    1,
    true,
    now() - interval '14 days',
    now()
  ),
  (
    '33333333-3333-4333-8333-333333333332',
    'Hands-on Workshop',
    'Participants collaborating during an interactive engineering workshop.',
    '/lets-talk-logo.png',
    2,
    true,
    now() - interval '11 days',
    now()
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'Networking Moment',
    'Young professionals connecting after a LETs Talk session.',
    '/lets-talk-logo.png',
    3,
    false,
    now() - interval '5 days',
    now()
  )
on conflict (id) do update set
  title = excluded.title,
  caption = excluded.caption,
  image_url = excluded.image_url,
  display_order = excluded.display_order,
  published = excluded.published,
  updated_at = now();

insert into public.awards (
  id,
  title,
  description,
  award_year,
  image_url,
  published,
  created_at,
  updated_at
)
values
  (
    '44444444-4444-4444-8444-444444444441',
    'Best Industry Collaborative Project Award',
    'Recognition for bridging academia and industry through practical, experience-driven learning.',
    2024,
    '/lets-talk-logo.png',
    true,
    now() - interval '18 days',
    now()
  ),
  (
    '44444444-4444-4444-8444-444444444442',
    'Vision to Value Recognition',
    'Awarded for creating high-impact professional development experiences for young engineers.',
    2023,
    '/lets-talk-logo.png',
    true,
    now() - interval '10 days',
    now()
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  award_year = excluded.award_year,
  image_url = excluded.image_url,
  published = excluded.published,
  updated_at = now();

insert into public.partners (
  id,
  name,
  logo_url,
  website_url,
  display_order,
  active,
  created_at,
  updated_at
)
values
  (
    '55555555-5555-4555-8555-555555555551',
    'IEEE Sri Lanka Section',
    '/lets-talk-logo.png',
    'https://ieee.lk',
    1,
    true,
    now() - interval '24 days',
    now()
  ),
  (
    '55555555-5555-4555-8555-555555555552',
    'IEEE Young Professionals Sri Lanka',
    '/lets-talk-logo.png',
    'https://ieeeyp.lk',
    2,
    true,
    now() - interval '22 days',
    now()
  ),
  (
    '55555555-5555-4555-8555-555555555553',
    'Industry Tech Partner',
    '/lets-talk-logo.png',
    'https://ieeeyp.lk',
    3,
    false,
    now() - interval '7 days',
    now()
  )
on conflict (id) do update set
  name = excluded.name,
  logo_url = excluded.logo_url,
  website_url = excluded.website_url,
  display_order = excluded.display_order,
  active = excluded.active,
  updated_at = now();

insert into public.contact_messages (
  id,
  name,
  email,
  topic,
  message,
  read,
  created_at
)
values
  (
    '66666666-6666-4666-8666-666666666661',
    'Sample Student',
    'student@example.com',
    'Workshop inquiry',
    'I would like to know when registrations open for the next technical workshop.',
    false,
    now() - interval '2 days'
  ),
  (
    '66666666-6666-4666-8666-666666666662',
    'Sample Partner',
    'partner@example.com',
    'Partnership',
    'Our organization is interested in collaborating with IEEE LETs Talk for an upcoming session.',
    true,
    now() - interval '6 days'
  )
on conflict (id) do update set
  name = excluded.name,
  email = excluded.email,
  topic = excluded.topic,
  message = excluded.message,
  read = excluded.read;

commit;
