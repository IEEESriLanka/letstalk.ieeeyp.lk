# IEEE LETs Talk — Frontend Application

A modern, high-performance web platform for **IEEE LETs Talk** — inspiring conversations, technical sessions, and career growth for the global engineering community.

---

## 🚀 Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start/latest) (Full-stack React with SSR & file-based routing)
- **UI Library**: [React 19](https://react.dev/)
- **Bundler & Dev Server**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & CSS variables
- **Icons & Animations**: [Lucide Icons](https://lucide.dev/), [Motion](https://motion.dev/)
- **Components**: [Radix UI](https://www.radix-ui.com/) & Tailwind UI primitives

---

## 🛠️ Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- npm or yarn

### Installation

```sh
npm install
```

### Running Locally

```sh
npm run dev
```

The application will start at [http://localhost:8080](http://localhost:8080).

### Production Build

```sh
npm run build
```

To preview the built production bundle:

```sh
npm run preview
```

### Vercel server startup verification

Follow [DEPLOYMENT.md](DEPLOYMENT.md) for required Preview checks, release gates,
and rollback steps. Development rules for future contributors and coding agents
are in [AGENTS.md](AGENTS.md).

Vercel builds use Nitro's Vercel preset with server dynamic imports inlined.
This avoids a generated circular import that previously caused
`TypeError: createCsrfMiddleware is not a function` on the first request.
Browser assets continue to use code splitting.

`npm run build` also runs a smoke check when `VERCEL` is set. It loads the
generated Vercel function, verifies the login page renders, and confirms
cross-site server-function requests return HTTP 403. A failure exits the build
with an error before deployment. To check an existing local Vercel build, run
`node scripts/check-server-build.mjs --vercel`.

Use the committed lockfile with `npm ci` for repeatable installs. After deploying
these changes, verify the deployed login page and Vercel runtime logs as well;
the build check does not exercise database credentials or email delivery.

### Events page hero

Open **Admin → Events Hero** to edit the Events heading and description, upload
photos (JPG/PNG/WebP, up to 5MB each), or add HTTPS image URLs. Add up to eight
photos, add a heading and description for each photo, reorder them with the arrows,
and select **Save Events hero** to publish. Blank per-photo text uses the default
heading/description. Each slide's text fades in over two seconds, holds for three,
then advances to the next photo and text (a five-second cycle),
with swipe and dot navigation. Reordering/removing photos keeps their text paired. Rotation
pauses during interaction and respects reduced-motion preferences. This hero is
independent of the homepage photos. Empty photo lists display a text-only hero.
Settings use existing `site_content` JSON; uploads use `gallery-images/events-hero/`.
No database migration or environment change is required. Verify admin save/upload
and the public Events page on Preview before release.

### Speaker comments

Open **Admin → Speaker Comments** to add a speaker's name, designation, comment,
and optional photo. Upload JPG/PNG/WebP photos up to 5MB or provide an HTTPS image
URL. Photos use the existing `gallery-images` bucket under `speaker-comments/`.
Use the arrows to reorder cards, check **Published on About Us**, then **Save
comments**. Unpublished cards remain in the admin list. Removing a card takes
effect only after saving; **Discard changes** restores the saved list.

Published cards rotate at the bottom of About Us, above the footer, every six seconds, with swipe,
dots. Rotation pauses on hover/focus and is disabled
for reduced-motion preferences. Empty/older content hides the section; no sample
endorsements are published. Comments use the existing `site_content.content` JSON
and its admin permissions, so no database migration or environment changes are
needed. Test publishing and image upload on a Preview with test data before release.

### Contact form on Vercel

Messages are stored in the existing Supabase `contact_messages` table and appear
in **Admin → Messages** (refreshes every 30 seconds while open). Each submission
also sends an email to **ieeeletstalksl@gmail.com** through Resend.

1. Create a [Resend account](https://resend.com), verify a domain you control,
   and create an API key with permission to send emails.
2. In **Vercel → Project → Settings → Environment Variables**, add
   `RESEND_API_KEY` and `RESEND_FROM_EMAIL`, for example
   `IEEE LETs Talk <contact@your-verified-domain.com>`. Enable these for Production
   and any Preview environments where you want email delivery.
3. Keep the existing `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
   configured for the same Supabase project used by the admin dashboard.
4. Redeploy, submit a test message from the contact form, and confirm it appears
   in both Admin → Messages and the Gmail inbox (check spam too).

The visitor's address is set as **Reply-To**, so replying in Gmail goes directly
to them. The From address must belong to your verified sending domain; entering
someone else's Gmail address as From is not supported by email authentication.
See [Resend's sending API](https://resend.com/docs/api-reference/emails/send-email).
Never give either Resend setting a `VITE_` prefix.

If email configuration is missing or Resend fails, the message remains saved in
the admin inbox. The server logs `Contact notification failed` in Vercel; failed
email notifications are not automatically retried. A successful submission means
the message was saved, not a guarantee of Gmail delivery. No database migration
is required for this feature.

### Linting & Formatting

```sh
npm run lint
npm run format
```

---

## 📁 Project Structure

```
├── public/               # Static assets (favicon, robots.txt)
├── src/
│   ├── assets/           # Imagery and illustrations
│   ├── components/
│   │   ├── site/         # IEEE LETs Talk sections, navigation, and layout
│   │   └── ui/           # Radix UI and Shadcn design system components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions and error handling
│   ├── routes/           # TanStack Start file-based routes
│   │   ├── __root.tsx    # App root shell and meta tags
│   │   └── index.tsx     # Landing page
│   ├── router.tsx        # TanStack Router configuration
│   ├── server.ts         # Server entry point
│   ├── start.ts          # TanStack Start client entry
│   └── styles.css        # Global CSS and Tailwind theme definitions
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite build and plugin setup
```
