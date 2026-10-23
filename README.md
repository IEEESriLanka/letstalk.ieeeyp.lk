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
