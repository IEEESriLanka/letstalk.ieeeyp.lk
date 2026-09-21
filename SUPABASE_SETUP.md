# Supabase Setup

Use this order when preparing the database for the admin panel:

1. Run `supabase-schema.sql` in the Supabase SQL editor.
2. Run `supabase-seed.sql` in the Supabase SQL editor.
3. Create an auth user in Supabase Authentication.
4. Add that user to `public.admin_users`.
5. Start the app and sign in at `/admin/login`.

## Apply Tables To Supabase

### Option A: Supabase SQL Editor

This is the easiest path.

1. Open Supabase Dashboard.
2. Select your project.
3. Go to `SQL Editor`.
4. Open `supabase-schema.sql` from this repo.
5. Paste the full file into the SQL editor.
6. Click `Run`.
7. Open `supabase-seed.sql` from this repo.
8. Paste the full file into the SQL editor.
9. Click `Run`.

### Option B: Command Line

Use this only after `DATABASE_URL` points to your Supabase Postgres database, not a local database.

Get the connection string from:

`Supabase Dashboard -> Project Settings -> Database -> Connection string -> URI`

Then set it in `.env`:

```env
DATABASE_URL=postgresql://postgres.your-project-ref:your-password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true
```

Apply schema and seed:

```bash
npx prisma db execute --file supabase-schema.sql
npx prisma db execute --file supabase-seed.sql
```

If the command says it cannot reach `localhost`, your `DATABASE_URL` is still pointing to a local database instead of Supabase.

## Table Structure

The admin panel connects to these tables:

| Admin Page    | Table              | Important Columns                                                                                                  | Storage Bucket   |
| ------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------ | ---------------- |
| Dashboard     | all CMS tables     | counts and recent rows                                                                                             | -                |
| Events        | `events`           | `title`, `description`, `event_date`, `start_time`, `location`, `registration_url`, `cover_image_url`, `published` | `event-images`   |
| Programs      | `programs`         | `title`, `description`, `cover_image_url`, `published`                                                             | `program-images` |
| Gallery       | `gallery_items`    | `title`, `caption`, `image_url`, `display_order`, `published`                                                      | `gallery-images` |
| Awards        | `awards`           | `title`, `description`, `award_year`, `image_url`, `published`                                                     | `award-images`   |
| Partners      | `partners`         | `name`, `logo_url`, `website_url`, `display_order`, `active`                                                       | `partner-logos`  |
| Messages      | `contact_messages` | `name`, `email`, `topic`, `message`, `read`, `created_at`                                                          | -                |
| Authorization | `admin_users`      | `user_id`, `role`                                                                                                  | -                |

## First Admin User

After creating an Auth user in Supabase, run this SQL with your real email:

```sql
insert into public.admin_users (user_id, role)
select id, 'admin'
from auth.users
where email = 'your-email@example.com'
on conflict (user_id) do update set role = 'admin';
```

## Environment Variables

Set these in `.env.local` for local development and in your hosting provider for production:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=server-only-service-role-key
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` in a `VITE_` variable.

## Run Locally

```bash
npm install
npm run dev
```

Then open:

- Public website: `/`
- Admin login: `/admin/login`
- Admin dashboard: `/admin`

## Seed Data Notes

`supabase-seed.sql` uses fixed UUIDs and `on conflict` updates, so it is safe to run more than once.

The seed uses `/lets-talk-logo.png` for image fields so previews render immediately in this project. When you upload real files through the admin panel, they are stored in the correct Supabase Storage bucket and the table row is updated with the public image URL.
