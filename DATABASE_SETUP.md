# Supabase locally and on Vercel

The app uses Supabase's HTTPS Data API, not DATABASE_URL or DIRECT_URL.

## Local development

Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local.
Use the URL and publishable key from the same Supabase project.
Run `npm run dev` (PowerShell: `npm.cmd run dev`). Port 8080 is required;
the server now reports a conflict instead of silently using 8081.

Run `node scripts/check-database.mjs` to verify actual reads and server credentials.
The diagnostic prints counts and errors, never keys or row contents.

## Vercel

Set these environment variables in the Vercel project's Production and Preview
environments before building:

- VITE_SUPABASE_URL
- VITE_SUPABASE_PUBLISHABLE_KEY
- SUPABASE_URL (same project URL)
- SUPABASE_SECRET_KEY (a valid secret from that project, for admin account management)

Never prefix the secret key with VITE_. Public content uses the publishable key
and existing RLS policies; logged-in CMS edits use the user's browser session.
An invalid server secret must not break public content loading.

Use `npm run build`. Nitro selects its Vercel preset when VERCEL is set by Vercel,
and its Node server preset for ordinary local builds. Do not override the output
directory to dist or deploy only static files: server functions must be deployed
along with the client. Nitro generates `.vercel/output` on Vercel.

Redeploy after changing VITE_* variables because Vite embeds these values during
the build. Add both the localhost and deployed site URLs to Supabase Auth's
redirect URL allowlist for password reset flows.

The current local SUPABASE_SECRET_KEY was rejected with `Unregistered API key`.
Replace it with a valid project secret; no code change can register an invalid key.

Optional contact email delivery additionally needs RESEND_API_KEY and
RESEND_FROM_EMAIL. Database connectivity does not configure an email provider.
